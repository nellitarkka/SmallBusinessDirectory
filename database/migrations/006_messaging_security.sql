-- 006_messaging_security.sql
-- Deliverable III: Verified-only + rate-limited messaging entrypoints (NO RLS)
-- Your schema uses integer ids for messages/listings and BIGINT for users.id.
-- This migration matches that.

BEGIN;

-- 1) users.is_email_verified
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_email_verified boolean NOT NULL DEFAULT false;

-- 2) rate_limits table (minute window counter)
-- IMPORTANT: user_id must match users.id type => BIGINT
CREATE TABLE IF NOT EXISTS public.rate_limits (
  user_id bigint NOT NULL,
  action text NOT NULL,
  window_start timestamptz NOT NULL,
  count int NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, action, window_start)
);

-- Ensure FK exists (and is correct type)
DO $do$
BEGIN
  -- If constraint already exists, leave it.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public'
      AND table_name='rate_limits'
      AND constraint_type='FOREIGN KEY'
      AND constraint_name='rate_limits_user_id_fkey'
  ) THEN
    ALTER TABLE public.rate_limits
      ADD CONSTRAINT rate_limits_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END
$do$;

-- Helper: start of current minute
CREATE OR REPLACE FUNCTION public.minute_window_start(ts timestamptz)
RETURNS timestamptz
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT date_trunc('minute', ts);
$$;

-- Enforce: limit per minute per action
-- p_user_id is BIGINT to match users.id and rate_limits.user_id
CREATE OR REPLACE FUNCTION public.enforce_rate_limit(p_user_id bigint, p_action text, p_limit int)
RETURNS void
LANGUAGE plpgsql
AS $fn$
DECLARE
  ws timestamptz := public.minute_window_start(now());
  new_count int;
BEGIN
  INSERT INTO public.rate_limits(user_id, action, window_start, count)
  VALUES (p_user_id, p_action, ws, 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO new_count;

  IF new_count > p_limit THEN
    RAISE EXCEPTION 'Rate limit exceeded for %', p_action USING ERRCODE = '42901';
  END IF;
END;
$fn$;

-- 3) Email verification tokens
-- You already have public.email_verification_tokens in your schema.
-- We will ADD missing columns if needed, without changing existing ones.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.email_verification_tokens
  ADD COLUMN IF NOT EXISTS token_hash text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS used_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- If your existing table uses a different token column, keep it; backend can start using token_hash.
CREATE INDEX IF NOT EXISTS ix_email_verification_tokens_expires
  ON public.email_verification_tokens (expires_at);

-- verify_email(token) -> returns user id (BIGINT)
-- Assumes email_verification_tokens has a user_id column referencing users.id (BIGINT).
-- If your table uses "user_id" but it's INT4, Postgres will still compare fine; FK is optional here.
CREATE OR REPLACE FUNCTION public.verify_email(p_token text)
RETURNS bigint
LANGUAGE plpgsql
AS $fn$
DECLARE
  th text := encode(digest(p_token, 'sha256'), 'hex');
  v_user bigint;
BEGIN
  -- Find valid token
  SELECT user_id INTO v_user
  FROM public.email_verification_tokens
  WHERE token_hash = th
    AND (used_at IS NULL)
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired token' USING ERRCODE='22023';
  END IF;

  -- Mark token used
  UPDATE public.email_verification_tokens
     SET used_at = now()
   WHERE user_id = v_user AND token_hash = th;

  -- Mark user verified
  UPDATE public.users
     SET is_email_verified = true
   WHERE id = v_user;

  RETURN v_user;
END;
$fn$;

-- 4) send_message(...) verified-only + rate limited + auto-resolve vendor receiver from listing
-- Your messages table uses:
--   sender_id (int), recipient_id (int), listing_id (int), subject (varchar), content (text)
-- So we insert into those existing columns.
--
-- Sender is BIGINT (users.id), but we cast to INT for messages insert.
-- This is safe as long as your user ids fit within int range (they currently look like ~48..59).
CREATE OR REPLACE FUNCTION public.send_message(
  p_sender_id bigint,
  p_listing_id int,
  p_subject text,
  p_content text
)
RETURNS int
LANGUAGE plpgsql
AS $fn$
DECLARE
  verified boolean;
  v_receiver bigint;
  v_owner_col text;
  mid int;
BEGIN
  SELECT is_email_verified INTO verified
  FROM public.users
  WHERE id = p_sender_id;

  IF verified IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Email not verified' USING ERRCODE='42501';
  END IF;

  PERFORM public.enforce_rate_limit(p_sender_id, 'send_message', 10);

  -- detect listing owner column (who receives the message)
  SELECT column_name INTO v_owner_col
  FROM information_schema.columns
  WHERE table_schema='public'
    AND table_name='listings'
    AND column_name IN ('vendor_id','vendor_user_id','user_id','owner_id')
  ORDER BY CASE column_name
    WHEN 'vendor_id' THEN 1
    WHEN 'vendor_user_id' THEN 2
    WHEN 'user_id' THEN 3
    WHEN 'owner_id' THEN 4
    ELSE 99 END
  LIMIT 1;

  IF v_owner_col IS NULL THEN
    RAISE EXCEPTION 'Cannot resolve vendor owner column on listings (expected vendor_id/vendor_user_id/user_id/owner_id)'
      USING ERRCODE='22023';
  END IF;

  EXECUTE format('SELECT %I::bigint FROM public.listings WHERE id = $1', v_owner_col)
    INTO v_receiver
    USING p_listing_id;

  IF v_receiver IS NULL THEN
    RAISE EXCEPTION 'Listing not found' USING ERRCODE='22023';
  END IF;

  -- Insert message into existing schema (recipient_id/content)
  INSERT INTO public.messages(sender_id, recipient_id, listing_id, subject, content, created_at, read)
  VALUES (p_sender_id::int, v_receiver::int, p_listing_id, NULLIF(p_subject,''), p_content, now(), false)
  RETURNING id INTO mid;

  RETURN mid;
END;
$fn$;

COMMIT;
