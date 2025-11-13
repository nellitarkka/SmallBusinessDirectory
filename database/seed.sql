-- seed.sql
-- Sample data for Small Business Vendor Directory

-- 1. Users (admin, vendor, customer)
INSERT INTO users (email, password_hash, role, first_name, last_name)
VALUES
    ('admin@example.com',   'hashed_admin_pw',   'admin',    'Alice',  'Admin'),
    ('vendor1@example.com', 'hashed_vendor_pw',  'vendor',   'Victor', 'Vendor'),
    ('customer1@example.com','hashed_customer_pw','customer','Clara', 'Customer')
ON CONFLICT (email) DO NOTHING;

-- 2. Vendor profile for vendor1
INSERT INTO vendors (user_id, business_name, vat_number, city, is_verified)
SELECT id, 'Victor Plumbing Services', 'LU12345678', 'Esch-sur-Alzette', TRUE
FROM users
WHERE email = 'vendor1@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- 3. Categories
INSERT INTO categories (name, is_active)
VALUES
    ('Plumber', TRUE),
    ('Electrician', TRUE),
    ('Painter', TRUE),
    ('Carpenter', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 4. Listings for that vendor
INSERT INTO listings (
    vendor_id, title, description, city,
    contact_email, contact_phone, status, opening_hours
)
SELECT
    v.id,
    'Emergency Plumbing 24/7',
    'Fast and reliable plumbing service for emergencies and regular maintenance.',
    'Esch-sur-Alzette',
    'contact@victorplumbing.lu',
    '+352 123 456 789',
    'active',
    'Mon–Fri 08:00–18:00'
FROM vendors v
JOIN users u ON v.user_id = u.id
WHERE u.email = 'vendor1@example.com'
LIMIT 1;

INSERT INTO listings (
    vendor_id, title, description, city,
    contact_email, contact_phone, status, opening_hours
)
SELECT
    v.id,
    'Bathroom Renovation & Installations',
    'Complete bathroom renovation, fixture installations, leak inspections.',
    'Luxembourg',
    'contact@victorplumbing.lu',
    '+352 987 654 321',
    'submitted',
    'Mon–Sat 09:00–19:00'
FROM vendors v
JOIN users u ON v.user_id = u.id
WHERE u.email = 'vendor1@example.com'
LIMIT 1;

-- 5. Assign categories to listings
-- Map: first listing -> Plumber, second listing -> Plumber + Carpenter (example)

-- First, get IDs
WITH
    plumber_cat AS (
        SELECT id AS category_id FROM categories WHERE name = 'Plumber'
    ),
    carpenter_cat AS (
        SELECT id AS category_id FROM categories WHERE name = 'Carpenter'
    ),
    listing1 AS (
        SELECT id AS listing_id
        FROM listings
        ORDER BY id ASC
        LIMIT 1
    ),
    listing2 AS (
        SELECT id AS listing_id
        FROM listings
        ORDER BY id DESC
        LIMIT 1
    )
INSERT INTO listing_categories (listing_id, category_id)
SELECT l1.listing_id, p.category_id
FROM listing1 l1, plumber_cat p
ON CONFLICT DO NOTHING;

WITH
    plumber_cat AS (
        SELECT id AS category_id FROM categories WHERE name = 'Plumber'
    ),
    carpenter_cat AS (
        SELECT id AS category_id FROM categories WHERE name = 'Carpenter'
    ),
    listing2 AS (
        SELECT id AS listing_id
        FROM listings
        ORDER BY id DESC
        LIMIT 1
    )
INSERT INTO listing_categories (listing_id, category_id)
SELECT l2.listing_id, c.category_id
FROM listing2 l2, carpenter_cat c
ON CONFLICT DO NOTHING;

-- 6. Favorites: customer favorites the first listing
INSERT INTO favorites (user_id, listing_id)
SELECT
    u.id,
    l.id
FROM users u
JOIN listings l ON TRUE
WHERE u.email = 'customer1@example.com'
ORDER BY l.id ASC
LIMIT 1
ON CONFLICT (user_id, listing_id) DO NOTHING;

-- 7. Messages: customer -> vendor
INSERT INTO messages (listing_id, sender_user_id, receiver_user_id, subject, body)
SELECT
    l.id,
    c.id AS sender_user_id,
    v.id AS receiver_user_id,
    'Inquiry about emergency plumbing',
    'Hello, I would like to know if you are available this evening for an urgent leak.'
FROM listings l
JOIN vendors ve ON l.vendor_id = ve.id
JOIN users v ON ve.user_id = v.id
JOIN users c ON c.email = 'customer1@example.com'
ORDER BY l.id ASC
LIMIT 1;

-- 8. Report: customer reports the second listing
INSERT INTO reports (listing_id, reporter_user_id, reason, status)
SELECT
    l.id,
    c.id,
    'Incorrect contact details on listing.',
    'open'
FROM users c
JOIN listings l ON TRUE
WHERE c.email = 'customer1@example.com'
ORDER BY l.id DESC
LIMIT 1;

-- 9. Admin action: admin reviewed the report
INSERT INTO admin_actions (admin_user_id, action_type, listing_id, target_user_id, details)
SELECT
    a.id,
    'review_report',
    l.id,
    v.id,
    'Admin reviewed report and requested vendor to update contact details.'
FROM users a
JOIN listings l ON TRUE
JOIN vendors ve ON l.vendor_id = ve.id
JOIN users v ON ve.user_id = v.id
WHERE a.email = 'admin@example.com'
ORDER BY l.id DESC
LIMIT 1;

-- 10. Sample tokens
-- Email verification for customer
INSERT INTO email_verification_tokens (user_id, token, expires_at, used)
SELECT
    u.id,
    'dummy-email-token-customer1',
    NOW() + INTERVAL '7 days',
    FALSE
FROM users u
WHERE u.email = 'customer1@example.com'
ON CONFLICT (token) DO NOTHING;

-- Password reset for vendor
INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
SELECT
    u.id,
    'dummy-reset-token-vendor1',
    NOW() + INTERVAL '1 day',
    FALSE
FROM users u
WHERE u.email = 'vendor1@example.com'
ON CONFLICT (token) DO NOTHING;
