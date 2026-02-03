-- 002_indexes_and_extensions.sql
-- Indexes and extensions to support search and filtering

-- Enable pg_trgm for better text search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Basic indexes for filtering
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- Trigram index for faster search on title
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm
    ON listings USING GIN (title gin_trgm_ops);
