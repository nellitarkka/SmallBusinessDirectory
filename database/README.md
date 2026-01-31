# **Database Design – Small Business Vendor Directory**

This document describes the relational database design for the **Small Business Vendor Directory** project across **Deliverables I–III**.
It defines the schema, constraints, relationships, query layer, and database-level security mechanisms supporting the MVP.

The database uses a **role-based users model**, where customers, vendors, and admins share a common `users` table and are differentiated by a `role` column and related tables.

---

## **1. Overview**

### Core Tables

* `users` — authentication accounts (admin, vendor, customer)
* `vendors` — vendor business profiles
* `listings` — business listings visible in the directory
* `categories` — predefined listing categories

### Relationship Tables

* `listing_categories` — many-to-many between listings and categories
* `favorites` — saved listings per user

### Messaging, Trust & Moderation

* `messages` — user ↔ vendor communication
* `inquiries` — inquiry threads linked to listings
* `reports` — user-submitted reports
* `admin_actions` — moderation and audit log

### Security & Authentication Support

* `email_verification_tokens`
* `password_reset_tokens`
* `rate_limits`

These tables support browsing, search, vendor dashboards, messaging, inquiries, reporting, moderation, and authentication flows.

---

## **2. Core Schema Highlights**

### `users`

Stores all platform accounts.

Key columns:

* `email` (unique)
* `password_hash`
* `role` (`customer`, `vendor`, `admin`)
* `is_email_verified`
* `ghost_strikes`
* timestamps

---

### `vendors`

Vendor-specific business data.

Key columns:

* `user_id` (FK → `users.id`)
* `business_name`, `vat_number`, `city`
* `is_verified`

Each vendor is linked to exactly one user account.

---

### `listings`

Vendor-created directory entries.

Key columns:

* `vendor_id` (FK → `vendors.id`)
* `title`, `description`, `city`
* `contact_email`, `contact_phone`
* `status` (`draft`, `submitted`, `active`, `rejected`)
* timestamps

Only `active` listings appear in public search.

---

### `messages`

Communication system between users and vendors.

Key columns:

* `listing_id`
* `sender_id`, `recipient_id`
* `subject`, `content`
* `inquiry_id` (optional)
* `read`, `created_at`

Direct inserts are discouraged; message creation is handled via database functions.

---

### `inquiries` *(Deliverable III)*

Inquiry threads tied to listings.

Key columns:

* `customer_id`
* `vendor_user_id`
* `listing_id`
* `status` (`open`, `accepted`, `rejected`, `no_show`, `closed`)
* timestamps

Only one open inquiry per user–listing pair is allowed.

---

## **3. Security & Abuse Prevention (Deliverable III)**

Deliverable III introduces **database-level enforcement** to ensure secure and consistent behavior.

### Implemented Mechanisms

* Email verification enforcement for messaging and inquiries
* Rate limiting for message and inquiry creation
* Inquiry-based messaging tied to listings
* Vendor-controlled inquiry status updates
* Ghost-strike tracking for unreliable user behavior
* Vendor duplicate prevention using normalized fields and unique constraints
* Automatic `updated_at` handling via triggers

All enforcement is handled **inside the database**, independent of backend application logic.

---

## **4. Database Migrations**

All database changes are implemented as **versioned SQL migrations**, located in:

```
database/migrations/
```

Relevant migration files include:

* `001_initial_schema.sql`
* `002_indexes_and_extensions.sql`
* `003_views.sql`
* `005_security_baseline.sql`
* `006_messaging_security.sql`
* `007_inquiries.sql`
* `007_inquiries_patch.sql` (schema-aware vendor user resolution)

These migrations were applied and verified on the project’s Supabase database.

---

## **5. Query Layer (SQL Views)**

Defined in `003_views.sql` to support read-heavy operations:

* `public_listings_view` — public browsing & search
* `vendor_listings_view` — vendor dashboard
* `user_favorites_view` — saved listings
* `open_reports_view` — admin moderation queue

Backend components are expected to use views for **read operations**.

---

## 6. Testing Overview

Two levels of database testing are included:

- `tests/`  
  Contains schema-level and relational integrity tests created for Deliverable 2
  (tables, constraints, relationships, views).

- `docs/database_manual_tests.md`  
  Contains manual validation queries for Deliverable 3, focusing on
  security, messaging, inquiry workflows, and abuse-prevention logic.

---

## **7. Integration Notes**

* Database functions must be used for messaging and inquiry creation.
* Direct inserts into `messages` and `inquiries` should be avoided.
* Views should be used for read-heavy endpoints.
* Authentication flows rely on `users`, `email_verification_tokens`, and `password_reset_tokens`.

---

## **8. Conclusion**

The database provides a solid foundation for the MVP, combining:

* a normalized relational schema,
* optimized query views,
* database-enforced security and trust mechanisms,
* and documented validation procedures.

Together, these elements support all core features of the **Small Business Vendor Directory** across Deliverables I–III.