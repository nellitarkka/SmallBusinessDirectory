-- WEEK 2 ALTER: Quality, constraints, and performance improvements

-- 1) ENUM status for listings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
    CREATE TYPE listing_status AS ENUM ('draft', 'published', 'archived');
  END IF;
END $$;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS status listing_status NOT NULL DEFAULT 'published';


-- 2) Price sanity checks
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS chk_price_nonneg,
  DROP CONSTRAINT IF EXISTS chk_price_order;

ALTER TABLE public.listings
  ADD CONSTRAINT chk_price_nonneg
  CHECK (
    (price_min IS NULL OR price_min >= 0)
    AND (price_max IS NULL OR price_max >= 0)
  );

ALTER TABLE public.listings
  ADD CONSTRAINT chk_price_order
  CHECK (
    price_min IS NULL OR price_max IS NULL OR price_min <= price_max
  );


-- 3) Vendor email format (safe version that doesn't fail if old data is invalid)
ALTER TABLE public.vendors
  DROP CONSTRAINT IF EXISTS chk_email_format;

ALTER TABLE public.vendors
  ADD CONSTRAINT chk_email_format
  CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
  NOT VALID;  -- allows adding even if some old rows have bad emails


-- 4) Prevent duplicate vendor names in the same city
CREATE UNIQUE INDEX IF NOT EXISTS uq_vendor_name_city
ON public.vendors(LOWER(name), LOWER(COALESCE(city, '')));


-- 5) Avoid duplicate listing titles per vendor
CREATE UNIQUE INDEX IF NOT EXISTS uq_listing_title_per_vendor
ON public.listings(vendor_id, LOWER(title));


-- 6) Improve query performance with indexes
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_desc ON public.listings(created_at DESC);


-- 7) Simple search view (title + description)
CREATE OR REPLACE VIEW public.vw_listings_search AS
SELECT
  l.id,
  l.vendor_id,
  l.title,
  l.category,
  (l.title || ' ' || COALESCE(l.description, '')) AS search_text,
  l.tags,
  l.status,
  l.is_published,
  l.created_at,
  l.updated_at
FROM public.listings l;


-- 8) Listings with vendor info
CREATE OR REPLACE VIEW public.vw_listings_with_vendor AS
SELECT
  l.*,
  v.name AS vendor_name,
  v.city AS vendor_city
FROM public.listings l
JOIN public.vendors v ON v.id = l.vendor_id;


-- 9) Categories table (optional normalization)
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

INSERT INTO public.categories (name)
VALUES ('Food'), ('Services'), ('Home'), ('Beauty'), ('Education')
ON CONFLICT (name) DO NOTHING;