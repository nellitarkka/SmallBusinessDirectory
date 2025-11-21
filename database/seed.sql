-- Extended seed data for Small Business Vendor Directory
-- Provides multiple users, vendors, listings, categories, favorites, messages, and reports

------------------------------------------------------------
-- 1. Users (admin, vendors, customers)
------------------------------------------------------------

INSERT INTO users (email, password_hash, role, first_name, last_name)
VALUES
    ('admin@example.com',     'hashed_admin_pw',   'admin',    'Alice',   'Admin'),
    ('vendor1@example.com',   'hashed_vendor_pw',  'vendor',   'Victor',  'Plumber'),
    ('vendor2@example.com',   'hashed_vendor_pw',  'vendor',   'Elena',   'Electric'),
    ('vendor3@example.com',   'hashed_vendor_pw',  'vendor',   'Marc',    'Wood'),
    ('customer1@example.com', 'hashed_customer_pw','customer', 'Clara',   'Customer'),
    ('customer2@example.com', 'hashed_customer_pw','customer', 'Luca',    'Buyer'),
    ('customer3@example.com', 'hashed_customer_pw','customer', 'Sofia',   'Client')
ON CONFLICT (email) DO NOTHING;


------------------------------------------------------------
-- 2. Vendor profiles (1:1 with vendor users)
------------------------------------------------------------

INSERT INTO vendors (user_id, business_name, vat_number, city, is_verified)
SELECT id, 'Victor Plumbing Services', 'LU12345678', 'Esch-sur-Alzette', TRUE
FROM users
WHERE email = 'vendor1@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO vendors (user_id, business_name, vat_number, city, is_verified)
SELECT id, 'Lux Electric & IT', 'LU23456789', 'Luxembourg', TRUE
FROM users
WHERE email = 'vendor2@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO vendors (user_id, business_name, vat_number, city, is_verified)
SELECT id, 'Marc Wood & Garden', 'LU34567890', 'Differdange', FALSE
FROM users
WHERE email = 'vendor3@example.com'
ON CONFLICT (user_id) DO NOTHING;


------------------------------------------------------------
-- 3. Categories
------------------------------------------------------------

INSERT INTO categories (name, is_active)
VALUES
    ('Plumber', TRUE),
    ('Electrician', TRUE),
    ('Painter', TRUE),
    ('Carpenter', TRUE),
    ('Cleaning', TRUE),
    ('Gardener', TRUE),
    ('IT Services', TRUE),
    ('Car Repair', TRUE),
    ('Catering', TRUE),
    ('Hairdresser', TRUE)
ON CONFLICT (name) DO NOTHING;


------------------------------------------------------------
-- 4. Listings (for multiple vendors)
------------------------------------------------------------

-- Helper: get vendor ids
WITH v1 AS (
    SELECT v.id AS vendor_id FROM vendors v
    JOIN users u ON v.user_id = u.id
    WHERE u.email = 'vendor1@example.com'
),
v2 AS (
    SELECT v.id AS vendor_id FROM vendors v
    JOIN users u ON v.user_id = u.id
    WHERE u.email = 'vendor2@example.com'
),
v3 AS (
    SELECT v.id AS vendor_id FROM vendors v
    JOIN users u ON v.user_id = u.id
    WHERE u.email = 'vendor3@example.com'
)
INSERT INTO listings (
    vendor_id, title, description, city,
    contact_email, contact_phone, status, opening_hours
)
SELECT
    v1.vendor_id,
    'Emergency Plumbing 24/7',
    'Fast and reliable plumbing service for emergencies and regular maintenance.',
    'Esch-sur-Alzette',
    'contact@victorplumbing.lu',
    '+352 111 111',
    'active',
    'Mon–Sun 00:00–23:59'
FROM v1
UNION ALL
SELECT
    v1.vendor_id,
    'Bathroom Renovation & Installations',
    'Complete bathroom renovation, fixture installations, leak inspections.',
    'Luxembourg',
    'contact@victorplumbing.lu',
    '+352 111 222',
    'submitted',
    'Mon–Sat 09:00–19:00'
FROM v1
UNION ALL
SELECT
    v1.vendor_id,
    'Kitchen Pipe Replacement',
    'Replacement of old kitchen pipes and leak inspection.',
    'Differdange',
    'contact@victorplumbing.lu',
    '+352 111 333',
    'draft',
    'Mon–Fri 08:00–17:00'
FROM v1
UNION ALL
SELECT
    v2.vendor_id,
    'Apartment Electrical Check',
    'Electrical safety inspection and certificate for apartments.',
    'Luxembourg',
    'service@luxelectric.lu',
    '+352 222 111',
    'active',
    'Mon–Fri 08:00–18:00'
FROM v2
UNION ALL
SELECT
    v2.vendor_id,
    'Smart Home Setup',
    'Installation and configuration of smart home devices and networks.',
    'Luxembourg',
    'service@luxelectric.lu',
    '+352 222 222',
    'active',
    'Mon–Sat 09:00–20:00'
FROM v2
UNION ALL
SELECT
    v2.vendor_id,
    'IT Network Troubleshooting',
    'Small business network diagnostics and troubleshooting.',
    'Esch-sur-Alzette',
    'it@luxelectric.lu',
    '+352 222 333',
    'submitted',
    'Mon–Fri 10:00–18:00'
FROM v2
UNION ALL
SELECT
    v3.vendor_id,
    'Custom Wardrobes & Cabinets',
    'Design and build custom wardrobes, cabinets, and shelves.',
    'Differdange',
    'hello@marcwood.lu',
    '+352 333 111',
    'active',
    'Mon–Fri 08:00–17:00'
FROM v3
UNION ALL
SELECT
    v3.vendor_id,
    'Garden Maintenance Package',
    'Monthly maintenance package for small gardens.',
    'Esch-sur-Alzette',
    'hello@marcwood.lu',
    '+352 333 222',
    'active',
    'Mon–Sat 08:00–16:00'
FROM v3
UNION ALL
SELECT
    v3.vendor_id,
    'Interior Painting Service',
    'Interior wall and ceiling painting with color consultation.',
    'Luxembourg',
    'hello@marcwood.lu',
    '+352 333 333',
    'rejected',
    'Mon–Fri 09:00–18:00'
FROM v3;


------------------------------------------------------------
-- 5. Assign categories to listings
------------------------------------------------------------

WITH
    plumber_cat AS (SELECT id FROM categories WHERE name = 'Plumber'),
    electrician_cat AS (SELECT id FROM categories WHERE name = 'Electrician'),
    it_cat AS (SELECT id FROM categories WHERE name = 'IT Services'),
    carpenter_cat AS (SELECT id FROM categories WHERE name = 'Carpenter'),
    painter_cat AS (SELECT id FROM categories WHERE name = 'Painter'),
    gardener_cat AS (SELECT id FROM categories WHERE name = 'Gardener'),
    cleaning_cat AS (SELECT id FROM categories WHERE name = 'Cleaning'),
    catering_cat AS (SELECT id FROM categories WHERE name = 'Catering'),
    hairdresser_cat AS (SELECT id FROM categories WHERE name = 'Hairdresser'),
    all_listings AS (
        SELECT id, title
        FROM listings
    )
-- Plumbing listings
INSERT INTO listing_categories (listing_id, category_id)
SELECT l.id, p.id
FROM all_listings l, plumber_cat p
WHERE l.title IN (
    'Emergency Plumbing 24/7',
    'Bathroom Renovation & Installations',
    'Kitchen Pipe Replacement'
)
ON CONFLICT DO NOTHING;

-- Electrical / IT listings
WITH
    plumber_cat AS (SELECT id FROM categories WHERE name = 'Plumber'),
    electrician_cat AS (SELECT id FROM categories WHERE name = 'Electrician'),
    it_cat AS (SELECT id FROM categories WHERE name = 'IT Services'),
    carpenter_cat AS (SELECT id FROM categories WHERE name = 'Carpenter'),
    painter_cat AS (SELECT id FROM categories WHERE name = 'Painter'),
    gardener_cat AS (SELECT id FROM categories WHERE name = 'Gardener'),
    cleaning_cat AS (SELECT id FROM categories WHERE name = 'Cleaning'),
    catering_cat AS (SELECT id FROM categories WHERE name = 'Catering'),
    hairdresser_cat AS (SELECT id FROM categories WHERE name = 'Hairdresser'),
    all_listings AS (
        SELECT id, title
        FROM listings
    )
INSERT INTO listing_categories (listing_id, category_id)
SELECT l.id, e.id
FROM all_listings l, electrician_cat e
WHERE l.title IN (
    'Apartment Electrical Check',
    'Smart Home Setup'
)
ON CONFLICT DO NOTHING;

WITH
    plumber_cat AS (SELECT id FROM categories WHERE name = 'Plumber'),
    electrician_cat AS (SELECT id FROM categories WHERE name = 'Electrician'),
    it_cat AS (SELECT id FROM categories WHERE name = 'IT Services'),
    carpenter_cat AS (SELECT id FROM categories WHERE name = 'Carpenter'),
    painter_cat AS (SELECT id FROM categories WHERE name = 'Painter'),
    gardener_cat AS (SELECT id FROM categories WHERE name = 'Gardener'),
    cleaning_cat AS (SELECT id FROM categories WHERE name = 'Cleaning'),
    catering_cat AS (SELECT id FROM categories WHERE name = 'Catering'),
    hairdresser_cat AS (SELECT id FROM categories WHERE name = 'Hairdresser'),
    all_listings AS (
        SELECT id, title
        FROM listings
    )
INSERT INTO listing_categories (listing_id, category_id)
SELECT l.id, i.id
FROM all_listings l, it_cat i
WHERE l.title IN (
    'Smart Home Setup',
    'IT Network Troubleshooting'
)
ON CONFLICT DO NOTHING;

-- Wood / Garden / Painting listings
WITH
    plumber_cat AS (SELECT id FROM categories WHERE name = 'Plumber'),
    electrician_cat AS (SELECT id FROM categories WHERE name = 'Electrician'),
    it_cat AS (SELECT id FROM categories WHERE name = 'IT Services'),
    carpenter_cat AS (SELECT id FROM categories WHERE name = 'Carpenter'),
    painter_cat AS (SELECT id FROM categories WHERE name = 'Painter'),
    gardener_cat AS (SELECT id FROM categories WHERE name = 'Gardener'),
    cleaning_cat AS (SELECT id FROM categories WHERE name = 'Cleaning'),
    catering_cat AS (SELECT id FROM categories WHERE name = 'Catering'),
    hairdresser_cat AS (SELECT id FROM categories WHERE name = 'Hairdresser'),
    all_listings AS (
        SELECT id, title
        FROM listings
    )
INSERT INTO listing_categories (listing_id, category_id)
SELECT l.id, c.id
FROM all_listings l, carpenter_cat c
WHERE l.title IN (
    'Custom Wardrobes & Cabinets'
)
ON CONFLICT DO NOTHING;

WITH
    plumber_cat AS (SELECT id FROM categories WHERE name = 'Plumber'),
    electrician_cat AS (SELECT id FROM categories WHERE name = 'Electrician'),
    it_cat AS (SELECT id FROM categories WHERE name = 'IT Services'),
    carpenter_cat AS (SELECT id FROM categories WHERE name = 'Carpenter'),
    painter_cat AS (SELECT id FROM categories WHERE name = 'Painter'),
    gardener_cat AS (SELECT id FROM categories WHERE name = 'Gardener'),
    cleaning_cat AS (SELECT id FROM categories WHERE name = 'Cleaning'),
    catering_cat AS (SELECT id FROM categories WHERE name = 'Catering'),
    hairdresser_cat AS (SELECT id FROM categories WHERE name = 'Hairdresser'),
    all_listings AS (
        SELECT id, title
        FROM listings
    )
INSERT INTO listing_categories (listing_id, category_id)
SELECT l.id, g.id
FROM all_listings l, gardener_cat g
WHERE l.title IN (
    'Garden Maintenance Package'
)
ON CONFLICT DO NOTHING;

WITH
    plumber_cat AS (SELECT id FROM categories WHERE name = 'Plumber'),
    electrician_cat AS (SELECT id FROM categories WHERE name = 'Electrician'),
    it_cat AS (SELECT id FROM categories WHERE name = 'IT Services'),
    carpenter_cat AS (SELECT id FROM categories WHERE name = 'Carpenter'),
    painter_cat AS (SELECT id FROM categories WHERE name = 'Painter'),
    gardener_cat AS (SELECT id FROM categories WHERE name = 'Gardener'),
    cleaning_cat AS (SELECT id FROM categories WHERE name = 'Cleaning'),
    catering_cat AS (SELECT id FROM categories WHERE name = 'Catering'),
    hairdresser_cat AS (SELECT id FROM categories WHERE name = 'Hairdresser'),
    all_listings AS (
        SELECT id, title
        FROM listings
    )
INSERT INTO listing_categories (listing_id, category_id)
SELECT l.id, p.id
FROM all_listings l, painter_cat p
WHERE l.title IN (
    'Interior Painting Service'
)
ON CONFLICT DO NOTHING;


------------------------------------------------------------
-- 6. Favorites (customers save multiple listings)
------------------------------------------------------------

-- Helper: user and listing ids
WITH
    u1 AS (SELECT id AS user_id FROM users WHERE email = 'customer1@example.com'),
    u2 AS (SELECT id AS user_id FROM users WHERE email = 'customer2@example.com'),
    u3 AS (SELECT id AS user_id FROM users WHERE email = 'customer3@example.com'),
    l AS (SELECT id, title FROM listings)
INSERT INTO favorites (user_id, listing_id)
SELECT u1.user_id, l.id FROM u1, l WHERE l.title IN
    ('Emergency Plumbing 24/7', 'Custom Wardrobes & Cabinets')
ON CONFLICT (user_id, listing_id) DO NOTHING;

WITH
    u1 AS (SELECT id AS user_id FROM users WHERE email = 'customer1@example.com'),
    u2 AS (SELECT id AS user_id FROM users WHERE email = 'customer2@example.com'),
    u3 AS (SELECT id AS user_id FROM users WHERE email = 'customer3@example.com'),
    l AS (SELECT id, title FROM listings)
INSERT INTO favorites (user_id, listing_id)
SELECT u2.user_id, l.id FROM u2, l WHERE l.title IN
    ('Apartment Electrical Check', 'Garden Maintenance Package', 'Smart Home Setup')
ON CONFLICT (user_id, listing_id) DO NOTHING;

WITH
    u1 AS (SELECT id AS user_id FROM users WHERE email = 'customer1@example.com'),
    u2 AS (SELECT id AS user_id FROM users WHERE email = 'customer2@example.com'),
    u3 AS (SELECT id AS user_id FROM users WHERE email = 'customer3@example.com'),
    l AS (SELECT id, title FROM listings)
INSERT INTO favorites (user_id, listing_id)
SELECT u3.user_id, l.id FROM u3, l WHERE l.title IN
    ('Garden Maintenance Package', 'Bathroom Renovation & Installations')
ON CONFLICT (user_id, listing_id) DO NOTHING;


------------------------------------------------------------
-- 7. Messages (customers contacting vendors)
------------------------------------------------------------

WITH
    c1 AS (SELECT id AS user_id FROM users WHERE email = 'customer1@example.com'),
    c2 AS (SELECT id AS user_id FROM users WHERE email = 'customer2@example.com'),
    v1user AS (SELECT id AS user_id FROM users WHERE email = 'vendor1@example.com'),
    v2user AS (SELECT id AS user_id FROM users WHERE email = 'vendor2@example.com'),
    l AS (SELECT id, title FROM listings)

INSERT INTO messages (listing_id, sender_user_id, receiver_user_id, subject, body)
SELECT
    l.id,
    c1.user_id,
    v1user.user_id,
    'Urgent leak in bathroom',
    'Hello, there is a leak in my bathroom. Are you available this evening?'
FROM c1, v1user, l
WHERE l.title = 'Emergency Plumbing 24/7';

WITH
    c1 AS (SELECT id AS user_id FROM users WHERE email = 'customer1@example.com'),
    c2 AS (SELECT id AS user_id FROM users WHERE email = 'customer2@example.com'),
    v1user AS (SELECT id AS user_id FROM users WHERE email = 'vendor1@example.com'),
    v2user AS (SELECT id AS user_id FROM users WHERE email = 'vendor2@example.com'),
    l AS (SELECT id, title FROM listings)
INSERT INTO messages (listing_id, sender_user_id, receiver_user_id, subject, body)
SELECT
    l.id,
    c2.user_id,
    v2user.user_id,
    'Smart home consultation',
    'Hi, I would like to discuss installing smart lights and thermostat.'
FROM c2, v2user, l
WHERE l.title = 'Smart Home Setup';


------------------------------------------------------------
-- 8. Reports (customers reporting issues)
------------------------------------------------------------

WITH
    c1 AS (SELECT id AS user_id FROM users WHERE email = 'customer1@example.com'),
    c3 AS (SELECT id AS user_id FROM users WHERE email = 'customer3@example.com'),
    l AS (SELECT id, title FROM listings)

INSERT INTO reports (listing_id, reporter_user_id, reason, status)
SELECT
    l.id,
    c1.user_id,
    'Contact phone number seems incorrect.',
    'open'
FROM c1, l
WHERE l.title = 'IT Network Troubleshooting';

WITH
    c1 AS (SELECT id AS user_id FROM users WHERE email = 'customer1@example.com'),
    c3 AS (SELECT id AS user_id FROM users WHERE email = 'customer3@example.com'),
    l AS (SELECT id, title FROM listings)
INSERT INTO reports (listing_id, reporter_user_id, reason, status)
SELECT
    l.id,
    c3.user_id,
    'Vendor did not show up to the appointment.',
    'in_review'
FROM c3, l
WHERE l.title = 'Garden Maintenance Package';


------------------------------------------------------------
-- 9. Admin actions (moderation log)
------------------------------------------------------------

WITH
    admin AS (SELECT id AS admin_id FROM users WHERE email = 'admin@example.com'),
    v1user AS (SELECT id AS user_id FROM users WHERE email = 'vendor1@example.com'),
    l AS (SELECT id, title FROM listings)

INSERT INTO admin_actions (admin_user_id, action_type, listing_id, target_user_id, details)
SELECT
    admin.admin_id,
    'approve_listing',
    l.id,
    v1user.user_id,
    'Approved Emergency Plumbing listing after checking details.'
FROM admin, v1user, l
WHERE l.title = 'Emergency Plumbing 24/7';

WITH
    admin AS (SELECT id AS admin_id FROM users WHERE email = 'admin@example.com'),
    v1user AS (SELECT id AS user_id FROM users WHERE email = 'vendor1@example.com'),
    l AS (SELECT id, title FROM listings)
INSERT INTO admin_actions (admin_user_id, action_type, listing_id, target_user_id, details)
SELECT
    admin.admin_id,
    'review_report',
    l.id,
    v1user.user_id,
    'Admin manually marked report as in review.'
FROM admin, v1user, l
WHERE l.title = 'IT Network Troubleshooting';


------------------------------------------------------------
-- 10. Example tokens (email verification & password reset)
------------------------------------------------------------

-- Email verification tokens
INSERT INTO email_verification_tokens (user_id, token, expires_at, used)
SELECT
    u.id,
    'verify-customer1-token',
    NOW() + INTERVAL '7 days',
    FALSE
FROM users u
WHERE u.email = 'customer1@example.com'
ON CONFLICT (token) DO NOTHING;

INSERT INTO email_verification_tokens (user_id, token, expires_at, used)
SELECT
    u.id,
    'verify-vendor2-token',
    NOW() + INTERVAL '7 days',
    FALSE
FROM users u
WHERE u.email = 'vendor2@example.com'
ON CONFLICT (token) DO NOTHING;

-- Password reset tokens
INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
SELECT
    u.id,
    'reset-vendor1-token',
    NOW() + INTERVAL '1 day',
    FALSE
FROM users u
WHERE u.email = 'vendor1@example.com'
ON CONFLICT (token) DO NOTHING;

INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
SELECT
    u.id,
    'reset-customer2-token',
    NOW() + INTERVAL '1 day',
    FALSE
FROM users u
WHERE u.email = 'customer2@example.com'
ON CONFLICT (token) DO NOTHING;
