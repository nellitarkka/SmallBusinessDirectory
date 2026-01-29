# Database Test Plan – Small Business Vendor Directory (Week 4)

This document describes the database tests for the Small Business Vendor Directory.
It focuses on validating:

- Schema integrity (tables, constraints, relationships)
- Functional behavior of core operations (listings, favorites, messages, reports)
- Correctness of SQL views (query layer)
- Consistency of seeded data

The tests are executed using SQL queries in the Supabase SQL editor.

---

## 1. Environment & Prerequisites

- Database schema created from migrations:
  - `database/migrations/001_initial_schema.sql`
  - `database/migrations/002_indexes_and_extensions.sql`
  - `database/migrations/003_views.sql`
- Seed data loaded from:
  - `database/seed.sql`

Assumption: the database is in a known, clean state (e.g., recreated from migrations and seed before testing).

---

## 2. Test Categories

1. **Schema & Constraints**
2. **Core CRUD & Relationships**
3. **Views / Query Layer**
4. **Seed Data Sanity Checks**

Each test case is described using:
- **ID**
- **Description**
- **Precondition**
- **Steps**
- **Expected Result**

---

## 3. Schema & Constraints Tests

### T1 – Unique Email in `users`

- **Description:** Ensure `email` is unique across users.
- **Precondition:** Seed data loaded.
- **Steps:**
  1. Try to insert another user with `email = 'customer1@example.com'`.
- **Expected Result:** Insert fails with a unique constraint violation on `users.email`.

---

### T2 – Role Constraint in `users`

- **Description:** Only allowed roles (`customer`, `vendor`, `admin`) can be inserted.
- **Precondition:** Schema loaded.
- **Steps:**
  1. Try to insert a user with `role = 'superuser'`.
- **Expected Result:** Insert fails due to CHECK constraint on `role`.

---

### T3 – Vendor 1:1 Relationship with `users`

- **Description:** Each vendor row must reference an existing user and be unique per user.
- **Precondition:** Seed data loaded.
- **Steps:**
  1. Insert a vendor with a non-existing `user_id`.
  2. Insert a second vendor row with the same `user_id` as an existing vendor.
- **Expected Result:**
  - (1) Fails with foreign key violation (no such user).
  - (2) Fails with unique constraint violation on `vendors.user_id`.

---

### T4 – Cascading Delete: Vendor → Listings

- **Description:** When a vendor is deleted, their listings are deleted (ON DELETE CASCADE).
- **Precondition:** Seed data loaded.
- **Steps:**
  1. Count listings for the seed vendor.
  2. Delete that vendor row.
  3. Count listings for that vendor again.
- **Expected Result:**
  - Listings count > 0 before delete.
  - Listings count = 0 after delete.

---

## 4. Core CRUD & Relationships Tests

### T5 – Create a New Listing

- **Description:** Inserting a listing with valid vendor_id should succeed.
- **Precondition:** Seed vendor exists.
- **Steps:**
  1. Insert a new listing with an existing `vendor_id`.
  2. Query `listings` by title to verify insertion.
- **Expected Result:** Listing appears with correct title, city, status, etc.

---

### T6 – Invalid Listing Status

- **Description:** Listing status must be one of `draft`, `submitted`, `active`, `rejected`.
- **Precondition:** Schema loaded.
- **Steps:**
  1. Try to insert a listing with `status = 'archived'`.
- **Expected Result:** Insert fails with CHECK constraint violation on `status`.

---

### T7 – Favorites Many-to-Many

- **Description:** A user can favorite multiple listings; each pair is unique.
- **Precondition:** Seed data loaded.
- **Steps:**
  1. Insert a favorite for an existing user + existing listing.
  2. Try inserting the exact same (user_id, listing_id) pair again.
- **Expected Result:**
  - First insert succeeds.
  - Second insert fails with primary key violation on `favorites(user_id, listing_id)`.

---

### T8 – Messages: Sender & Receiver Must Exist

- **Description:** Message must reference existing users and an existing listing.
- **Precondition:** Schema loaded.
- **Steps:**
  1. Try inserting a message with a non-existing `sender_user_id`.
  2. Try inserting a message with a non-existing `listing_id`.
- **Expected Result:**
  - Inserts fail with foreign key violations.

---

### T9 – Reports Workflow Status

- **Description:** Report status must be `open`, `in_review`, or `resolved`.
- **Precondition:** Schema loaded.
- **Steps:**
  1. Insert a new report with a valid status (e.g., `open`) → should succeed.
  2. Try updating a report status to `closed`.
- **Expected Result:**
  - Valid insert succeeds.
  - Invalid status update fails due to CHECK constraint.

---

## 5. Views / Query Layer Tests

### T10 – `public_listings_view` Only Shows Active Listings

- **Description:** View should only expose listings with `status = 'active'`.
- **Precondition:** Seed data loaded, including listings with different statuses.
- **Steps:**
  1. Query `SELECT DISTINCT status FROM listings;` to confirm multiple statuses.
  2. Query `SELECT DISTINCT status FROM public_listings_view;`.
- **Expected Result:**
  - Underlying `listings` table can contain various statuses.
  - `public_listings_view` only exposes `active` listings.

---

### T11 – `public_listings_view` Category Aggregation

- **Description:** Categories column returns array of category names.
- **Precondition:** Seed data with listing-category assignments.
- **Steps:**
  1. Select a row from `public_listings_view` for a known listing.
- **Expected Result:**
  - `categories` is an array type, containing one or more category names.

---

### T12 – `vendor_listings_view` Favorite Count

- **Description:** Favorite counts per listing are correctly calculated.
- **Precondition:** At least one favorite exists in seed.
- **Steps:**
  1. Query `vendor_listings_view` for the seed vendor.
- **Expected Result:**
  - `favorite_count` matches the number of rows in `favorites` for each listing.

---

### T13 – `user_favorites_view` Per User Favorites

- **Description:** Only favorites for the given user are returned.
- **Precondition:** Seed data loaded with favorites for a known `customer1`.
- **Steps:**
  1. Query `user_favorites_view` for that user.
- **Expected Result:**
  - All rows have `user_id` equal to that user’s id.
  - Listings correspond to favorited ones.

---

### T14 – `open_reports_view` Shows Open/In_review Only

- **Description:** Only open or in_review reports appear.
- **Precondition:** At least one open report in seed.
- **Steps:**
  1. Query `SELECT DISTINCT status FROM open_reports_view;`.
- **Expected Result:**
  - Only `open` and/or `in_review` appear (no `resolved`).

---

## 6. Seed Data Sanity Checks

### T15 – Seed Users Exist

- **Description:** Verify that the predefined users are present.
- **Precondition:** Seed data loaded.
- **Steps:**
  1. Query users for `admin@example.com`, `vendor1@example.com`, `customer1@example.com`.
- **Expected Result:**
  - All three users exist, with expected roles.

---

### T16 – Vendor & Listings Connectivity

- **Description:** Seed vendor has listings.
- **Precondition:** Seed data loaded.
- **Steps:**
  1. Find vendor by `vendor1@example.com`.
  2. Query `listings` for that vendor_id.
- **Expected Result:**
  - One or more listings returned.

---

### T17 – Messages Linked to Valid Users/Listings

- **Description:** Seed message is correctly linked.
- **Precondition:** Seed data loaded.
- **Steps:**
  1. Query `messages` and join `users` and `listings` to check foreign keys.
- **Expected Result:**
  - All foreign keys in `messages` refer to existing rows.

---

## 7. Execution

These tests are executed manually using:

- Supabase SQL editor, or
- any Postgres client connected to the same database.

The corresponding SQL for most tests is provided in:

- `database/tests/manual_test_queries.sql`

This test plan can also be used as a basis for future automated tests in CI.
