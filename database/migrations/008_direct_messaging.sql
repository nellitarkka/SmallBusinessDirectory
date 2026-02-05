-- 008_direct_messaging.sql
-- Add support for direct messages (without listing_id requirement)
-- Allows users to respond to existing conversations

BEGIN;

-- Direct message function (for conversations without listing_id)
-- Used when responding to an existing conversation where recipient is known
CREATE OR REPLACE FUNCTION public.send_direct_message(
  p_sender_id bigint,
  p_recipient_id bigint,
  p_subject text,
  p_content text
)
RETURNS int
LANGUAGE plpgsql
AS $fn$
DECLARE
  verified boolean;
  mid int;
BEGIN
  -- Check email verification
  SELECT is_email_verified INTO verified
  FROM public.users
  WHERE id = p_sender_id;

  IF verified IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Email not verified' USING ERRCODE='42501';
  END IF;

  -- Enforce rate limiting
  PERFORM public.enforce_rate_limit(p_sender_id, 'send_message', 10);

  -- Verify recipient exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_recipient_id) THEN
    RAISE EXCEPTION 'Recipient not found' USING ERRCODE='22023';
  END IF;

  -- Insert direct message (no listing_id)
  INSERT INTO public.messages(sender_id, recipient_id, subject, content, created_at, read)
  VALUES (p_sender_id::int, p_recipient_id::int, NULLIF(p_subject,''), p_content, now(), false)
  RETURNING id INTO mid;

  RETURN mid;
END;
$fn$;

COMMIT;
