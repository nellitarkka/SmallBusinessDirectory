-- 005_security_baseline.sql
-- Deliverable III: Security baseline (NO RLS; backend uses DATABASE_URL)
-- Covers:
--   - updated_at triggers
--   - length constraints (messages/listings)
--   - vendor duplicate prevention (vendors table if present; else fallback to listings)
--   - helpful indexes
--
-- Designed to be schema-tolerant (auto-detects likely column names).

BEGIN;

-- ---------- 0) Extensions ----------
CREATE EXTENSION IF NOT EXISTS citext;

-- ---------- 1) updated_at trigger ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$;

DO $do$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','listings','vendors','messages','inquiries'] LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();', t);
      EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;', t, t);
      EXECUTE format(
        'CREATE TRIGGER trg_%I_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
        t, t
      );
    END IF;
  END LOOP;
END
$do$;

-- ---------- 2) Length constraints ----------
DO $do$
BEGIN
  -- messages(subject <= 120, body/content <= 2000)
  IF to_regclass('public.messages') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='messages' AND column_name='subject'
    ) THEN
      ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS chk_messages_subject_len;
      ALTER TABLE public.messages
        ADD CONSTRAINT chk_messages_subject_len
        CHECK (subject IS NULL OR char_length(subject) <= 120);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='messages' AND column_name='body'
    ) THEN
      ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS chk_messages_body_len;
      ALTER TABLE public.messages
        ADD CONSTRAINT chk_messages_body_len
        CHECK (body IS NULL OR char_length(body) <= 2000);
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='messages' AND column_name='content'
    ) THEN
      ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS chk_messages_content_len;
      ALTER TABLE public.messages
        ADD CONSTRAINT chk_messages_content_len
        CHECK (content IS NULL OR char_length(content) <= 2000);
    END IF;
  END IF;

  -- listings(title <= 120, description <= 4000)
  IF to_regclass('public.listings') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='listings' AND column_name='title'
    ) THEN
      ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS chk_listings_title_len;
      ALTER TABLE public.listings
        ADD CONSTRAINT chk_listings_title_len
        CHECK (title IS NULL OR char_length(title) <= 120);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='listings' AND column_name='description'
    ) THEN
      ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS chk_listings_desc_len;
      ALTER TABLE public.listings
        ADD CONSTRAINT chk_listings_desc_len
        CHECK (description IS NULL OR char_length(description) <= 4000);
    END IF;
  END IF;
END
$do$;

-- ---------- 3) Vendor duplicate prevention ----------
-- Preferred: vendors table with a "name-ish" and optional "city-ish" column.
-- Fallback: listings title + city.

DO $do$
DECLARE
  v_name_col text;
  v_city_col text;
BEGIN
  IF to_regclass('public.vendors') IS NOT NULL THEN
    -- pick the best candidate for "vendor name"
    SELECT column_name INTO v_name_col
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='vendors'
      AND column_name IN ('name','vendor_name','business_name','company_name','title')
    ORDER BY CASE column_name
      WHEN 'name' THEN 1
      WHEN 'vendor_name' THEN 2
      WHEN 'business_name' THEN 3
      WHEN 'company_name' THEN 4
      WHEN 'title' THEN 5
      ELSE 99 END
    LIMIT 1;

    IF v_name_col IS NULL THEN
      RAISE EXCEPTION
        'Cannot enforce vendor duplicate prevention: no vendor name column found in public.vendors (expected name/vendor_name/business_name/company_name/title).';
    END IF;

    -- optional city column
    SELECT column_name INTO v_city_col
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='vendors'
      AND column_name IN ('city','location_city','town')
    ORDER BY CASE column_name
      WHEN 'city' THEN 1
      WHEN 'location_city' THEN 2
      WHEN 'town' THEN 3
      ELSE 99 END
    LIMIT 1;

    -- normalized name column
    EXECUTE 'ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS name_normalized text;';

    -- backfill normalization
    EXECUTE format(
      'UPDATE public.vendors
         SET name_normalized = lower(regexp_replace(trim(%I), ''\s+'', '' '', ''g''))
       WHERE name_normalized IS NULL;',
      v_name_col
    );

    -- generate trigger function tied to the detected name column
    EXECUTE format($genfn$
      CREATE OR REPLACE FUNCTION public.vendor_normalize_name()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $vfunc$
      BEGIN
        NEW.name_normalized := lower(regexp_replace(trim(NEW.%I), '\s+', ' ', 'g'));
        RETURN NEW;
      END;
      $vfunc$;
    $genfn$, v_name_col);

    -- trigger for keeping normalized name updated
    EXECUTE 'DROP TRIGGER IF EXISTS trg_vendors_normalize_name ON public.vendors;';
    EXECUTE format(
      'CREATE TRIGGER trg_vendors_normalize_name
       BEFORE INSERT OR UPDATE OF %I ON public.vendors
       FOR EACH ROW EXECUTE FUNCTION public.vendor_normalize_name();',
      v_name_col
    );

    -- uniqueness: city + normalized name (if city exists), else only normalized name
    IF v_city_col IS NOT NULL THEN
      EXECUTE format(
        'CREATE UNIQUE INDEX IF NOT EXISTS uq_vendors_city_name_norm
         ON public.vendors (%I, name_normalized);',
        v_city_col
      );
    ELSE
      EXECUTE
        'CREATE UNIQUE INDEX IF NOT EXISTS uq_vendors_name_norm
         ON public.vendors (name_normalized);';
    END IF;

  ELSIF to_regclass('public.listings') IS NOT NULL THEN
    -- fallback duplicate prevention at listing level (title + city)
    EXECUTE 'ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS vendor_name_norm text;';
    EXECUTE 'ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS city_norm text;';

    EXECUTE
      'UPDATE public.listings
         SET vendor_name_norm = lower(regexp_replace(trim(title), ''\s+'', '' '', ''g''))
       WHERE vendor_name_norm IS NULL;';

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='listings' AND column_name='city'
    ) THEN
      EXECUTE
        'UPDATE public.listings
           SET city_norm = lower(regexp_replace(trim(city), ''\s+'', '' '', ''g''))
         WHERE city_norm IS NULL;';
      EXECUTE
        'CREATE UNIQUE INDEX IF NOT EXISTS uq_listings_vendor_city_norm
         ON public.listings (vendor_name_norm, city_norm);';
    ELSE
      EXECUTE
        'CREATE UNIQUE INDEX IF NOT EXISTS uq_listings_vendor_norm
         ON public.listings (vendor_name_norm);';
    END IF;
  END IF;
END
$do$;

-- ---------- 4) Helpful indexes ----------
DO $do$
BEGIN
  IF to_regclass('public.messages') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='sender_id') THEN
      CREATE INDEX IF NOT EXISTS ix_messages_sender_created
        ON public.messages (sender_id, created_at DESC);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='receiver_id') THEN
      CREATE INDEX IF NOT EXISTS ix_messages_receiver_created
        ON public.messages (receiver_id, created_at DESC);
    END IF;
  END IF;
END
$do$;

COMMIT;
