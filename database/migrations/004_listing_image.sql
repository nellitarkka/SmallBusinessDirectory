-- 004_listing_image.sql
-- Add single image URL to listings and update views to expose it

ALTER TABLE listings ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Recreate views (CREATE OR REPLACE cannot change column count); drop then create with explicit column list

DROP VIEW IF EXISTS public_listings_view;
CREATE VIEW public_listings_view (
    listing_id,
    title,
    description,
    city,
    contact_email,
    contact_phone,
    opening_hours,
    created_at,
    image_url,
    business_name,
    vendor_city,
    vendor_user_id,
    vendor_email,
    categories
) AS
SELECT
    l.id               AS listing_id,
    l.title,
    l.description,
    l.city,
    l.contact_email,
    l.contact_phone,
    l.opening_hours,
    l.created_at,
    l.image_url,
    v.business_name,
    v.city             AS vendor_city,
    u.id               AS vendor_user_id,
    u.email            AS vendor_email,
    ARRAY_AGG(c.name ORDER BY c.name) FILTER (WHERE c.id IS NOT NULL) AS categories
FROM listings l
JOIN vendors v ON l.vendor_id = v.id
JOIN users u ON v.user_id = u.id
LEFT JOIN listing_categories lc ON lc.listing_id = l.id
LEFT JOIN categories c ON c.id = lc.category_id
WHERE l.status = 'active'
GROUP BY
    l.id,
    v.business_name,
    v.city,
    u.id,
    u.email;

DROP VIEW IF EXISTS vendor_listings_view;
CREATE VIEW vendor_listings_view (
    listing_id,
    vendor_id,
    vendor_user_id,
    business_name,
    title,
    description,
    city,
    status,
    image_url,
    created_at,
    updated_at,
    favorite_count
) AS
SELECT
    l.id                AS listing_id,
    l.vendor_id,
    v.user_id           AS vendor_user_id,
    v.business_name,
    l.title,
    l.description,
    l.city,
    l.status,
    l.image_url,
    l.created_at,
    l.updated_at,
    COALESCE(fav_counts.favorite_count, 0) AS favorite_count
FROM listings l
JOIN vendors v ON l.vendor_id = v.id
LEFT JOIN (
    SELECT
        listing_id,
        COUNT(*) AS favorite_count
    FROM favorites
    GROUP BY listing_id
) AS fav_counts ON fav_counts.listing_id = l.id;
