-- 003_views.sql
-- Views for common read queries (Week 3)

-- 1. Public listings view
--    - Only active listings
--    - Includes vendor business name and city
--    - Aggregates category names into a text array
CREATE OR REPLACE VIEW public_listings_view AS
SELECT
    l.id               AS listing_id,
    l.title,
    l.description,
    l.city,
    l.contact_email,
    l.contact_phone,
    l.opening_hours,
    l.created_at,
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


-- 2. Vendor listings view
--    - Allows vendor to see all their listings, regardless of status
--    - Includes counts of favorites per listing
CREATE OR REPLACE VIEW vendor_listings_view AS
SELECT
    l.id                AS listing_id,
    l.vendor_id,
    v.user_id           AS vendor_user_id,
    v.business_name,
    l.title,
    l.description,
    l.city,
    l.status,
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


-- 3. User favorites view
--    - All listings favorited by a given user
--    - Reuses listing + vendor info for convenience
CREATE OR REPLACE VIEW user_favorites_view AS
SELECT
    f.user_id,
    f.created_at AS favorited_at,
    l.id         AS listing_id,
    l.title,
    l.city,
    v.business_name,
    l.status
FROM favorites f
JOIN listings l ON f.listing_id = l.id
JOIN vendors v ON l.vendor_id = v.id;


-- 4. Open reports view
--    - Shows open / in_review reports with listing + vendor info for admins
CREATE OR REPLACE VIEW open_reports_view AS
SELECT
    r.id               AS report_id,
    r.listing_id,
    r.reporter_user_id,
    r.reason,
    r.status,
    r.created_at,
    l.title            AS listing_title,
    l.city             AS listing_city,
    v.business_name    AS vendor_business_name,
    v.user_id          AS vendor_user_id
FROM reports r
LEFT JOIN listings l ON r.listing_id = l.id
LEFT JOIN vendors v ON l.vendor_id = v.id
WHERE r.status IN ('open', 'in_review');
