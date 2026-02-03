-- manual_test_queries.sql
-- Manual test queries for validating the database schema and views

------------------------------------------------------------
-- T1 – Unique Email in users
------------------------------------------------------------
-- Expect: second insert fails due to unique constraint on email

INSERT INTO users (email, password_hash, role)
VALUES ('customer1@example.com', 'test', 'customer');


------------------------------------------------------------
-- T2 – Role Constraint in users
------------------------------------------------------------
-- Expect: insert fails due to CHECK constraint on role

INSERT INTO users (email, password_hash, role)
VALUES ('invalidrole@example.com', 'test', 'superuser');


------------------------------------------------------------
-- T3 – Vendor 1:1 Relationship With users
------------------------------------------------------------
-- (1) Non-existing user_id – expect FK violation

INSERT INTO vendors (user_id, business_name, vat_number, city)
VALUES (999999, 'Ghost Vendor', 'XX000', 'Nowhere');

-- (2) Duplicate user_id – find existing vendor user_id first:
SELECT user_id FROM vendors LIMIT 1;

-- Substitute an existing user_id below:
INSERT INTO vendors (user_id, business_name, vat_number, city)
VALUES (2, 'Duplicate Vendor', 'XX111', 'Nowhere');


------------------------------------------------------------
-- T4 – Cascading Delete: Vendor -> Listings
------------------------------------------------------------

-- Find a vendor and their listings
SELECT v.id AS vendor_id, u.email, COUNT(l.id) AS listing_count
FROM vendors v
JOIN users u ON v.user_id = u.id
LEFT JOIN listings l ON l.vendor_id = v.id
GROUP BY v.id, u.email;

-- Pick a vendor_id with listing_count > 0, then:

 DELETE FROM vendors WHERE id = 1;

-- After deletion, check:
SELECT * FROM listings WHERE vendor_id = 1;


------------------------------------------------------------
-- T5 – Create a New Listing
------------------------------------------------------------

-- Find a vendor_id to use:
SELECT id, user_id, business_name FROM vendors LIMIT 1;

-- Use a valid vendor_id from above:
INSERT INTO listings (
    vendor_id, title, description, city,
    contact_email, contact_phone, status, opening_hours
) VALUES (
    7,
    'Test Listing From Manual Test',
    'This is a test listing created during DB manual tests.',
    'Test City',
    'test@example.com',
    '+352 000 000',
    'draft',
    'Mon–Fri 09:00–17:00'
);

-- Verify:
SELECT * FROM listings WHERE title = 'Test Listing From Manual Test';


------------------------------------------------------------
-- T6 – Invalid Listing Status
------------------------------------------------------------
-- Expect: fail due to CHECK constraint on status

INSERT INTO listings (
    vendor_id, title, description, city, status
)
VALUES (
    1,
    'Invalid Status Listing',
    'Should fail.',
    'Test City',
    'archived'
);


------------------------------------------------------------
-- T7 – Favorites Many-to-Many
------------------------------------------------------------

-- Find an existing user and listing
SELECT id, email, role FROM users;
SELECT id, title FROM listings;

-- Use real ids from above:
INSERT INTO favorites (user_id, listing_id)
VALUES (3, 10);

-- Try inserting same pair again:
INSERT INTO favorites (user_id, listing_id)
VALUES (3, 10);

-- Expect: second insert fails on PK (user_id, listing_id).

------------------------------------------------------------
-- T8 – Messages: Sender & Receiver Must Exist
------------------------------------------------------------

-- (1) Non-existing sender_user_id
INSERT INTO messages (listing_id, sender_user_id, receiver_user_id, body)
VALUES (1, 999999, 1, 'Invalid sender id test');

-- (2) Non-existing listing_id
INSERT INTO messages (listing_id, sender_user_id, receiver_user_id, body)
VALUES (999999, 1, 1, 'Invalid listing id test');


------------------------------------------------------------
-- T9 – Reports Workflow Status
------------------------------------------------------------

SELECT id, title, vendor_id, status 
FROM listings;

-- Valid insert
INSERT INTO reports (listing_id, reporter_user_id, reason, status)
VALUES (8, 1, 'Test report reason', 'open');

SELECT id, listing_id, reporter_user_id, status
FROM reports
ORDER BY id DESC
LIMIT 1;

-- Invalid status
UPDATE reports
SET status = 'closed'
WHERE id = 8;  -- adjust an appropriate id if needed


------------------------------------------------------------
-- T10 – public_listings_view only active
------------------------------------------------------------

SELECT DISTINCT status FROM listings;

SELECT listing_id
FROM public_listings_view;

SELECT id, status 
FROM listings
WHERE id IN (SELECT listing_id FROM public_listings_view);


------------------------------------------------------------
-- T11 – public_listings_view categories
------------------------------------------------------------

SELECT listing_id, title, categories
FROM public_listings_view
LIMIT 5;


------------------------------------------------------------
-- T12 – vendor_listings_view favorite_count
------------------------------------------------------------

SELECT *
FROM vendor_listings_view
ORDER BY favorite_count DESC;


------------------------------------------------------------
-- T13 – user_favorites_view per user
------------------------------------------------------------

-- Find a user id (e.g., customer1@example.com)
SELECT id, email FROM users;

-- Then:
SELECT * FROM user_favorites_view
WHERE user_id = 3;


------------------------------------------------------------
-- T14 – open_reports_view shows open/in_review only
------------------------------------------------------------

SELECT DISTINCT status FROM open_reports_view;


------------------------------------------------------------
-- T15 – Seed Users Exist
------------------------------------------------------------

SELECT id, email, role FROM users
WHERE email IN (
    'admin@example.com',
    'vendor1@example.com',
    'customer1@example.com'
);


------------------------------------------------------------
-- T16 – Vendor & Listings Connectivity
------------------------------------------------------------

SELECT v.id AS vendor_id, u.email, COUNT(l.id) AS listing_count
FROM vendors v
JOIN users u ON v.user_id = u.id
LEFT JOIN listings l ON l.vendor_id = v.id
GROUP BY v.id, u.email;


------------------------------------------------------------
-- T17 – Messages linked to valid users/listings
------------------------------------------------------------

SELECT m.id,
       m.listing_id,
       l.title AS listing_title,
       m.sender_user_id,
       su.email AS sender_email,
       m.receiver_user_id,
       ru.email AS receiver_email
FROM messages m
LEFT JOIN listings l ON m.listing_id = l.id
LEFT JOIN users su ON m.sender_user_id = su.id
LEFT JOIN users ru ON m.receiver_user_id = ru.id;
