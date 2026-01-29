# **Database Design – Small Business Vendor Directory**

This document describes the relational database design for the **Small Business Vendor Directory** project.
It defines the schema, constraints, relationships, seed data, views, and integration guidelines required to support the MVP.

The database uses a **role-based users model**, where customers, vendors, and admins all share a common `users` table and differ through a `role` column and related tables.

---

# **1. Overview**

## Core Tables

* `users` — authentication accounts (admin, vendor, customer)
* `vendors` — vendor business profiles
* `listings` — business listings visible in the directory
* `categories` — predefined listing categories

## Link / Relationship Tables

* `listing_categories` — many-to-many between listings and categories
* `favorites` — saved/favorited listings per user

## Messaging & Moderation

* `messages` — inquiry messages between users & vendors
* `reports` — user-submitted reports against listings

## Administration & Security

* `admin_actions` — moderation/audit log
* `email_verification_tokens`
* `password_reset_tokens`

These tables support all MVP features:
public browsing, search, vendor dashboards, favorites, messaging, reporting & moderation, and user authentication flows.

---

# **2. Table Descriptions**

### `users`

Stores all platform accounts.

Important columns:

* `email` (unique)
* `password_hash`
* `role` (`customer`, `vendor`, `admin`)
* `first_name`, `last_name`
* timestamps

Used by authentication and linked everywhere else.

---

### `vendors`

Vendor-specific business data.

Columns:

* `user_id` (unique FK → `users.id`)
* `business_name`, `vat_number`, `city`
* `is_verified`

Each vendor has exactly one user with role `'vendor'`.

---

### `categories`

Predefined list of service categories.

Columns:

* `name` (unique)
* `is_active`

Used for search filters and listing classification.

---

### `listings`

Vendor-created directory entries.

Columns:

* `vendor_id` (FK → `vendors.id`)
* `title`, `description`, `city`
* `contact_email`, `contact_phone`
* `status` (`draft`, `submitted`, `active`, `rejected`)
* `opening_hours`
* timestamps

Listings appear in public search only when `status = 'active'`.

---

### `listing_categories`

Join table: listings ↔ categories.

Columns:

* `listing_id`, `category_id`
* Composite PK `(listing_id, category_id)`

Enables multi-category listings.

---

### `favorites`

Tracks listings saved by users.

Columns:

* `user_id`, `listing_id`
* `created_at`

Composite PK `(user_id, listing_id)`.

---

### `messages`

Inquiry communication system.

Columns:

* `listing_id`
* `sender_user_id`, `receiver_user_id`
* `subject`, `body`
* `is_read`
* `created_at`

Used by the interactive messaging feature.

---

### `reports`

User-reported issues with listings.

Columns:

* `listing_id`
* `reporter_user_id`
* `reason`
* `status` (`open`, `in_review`, `resolved`)
* timestamps

Supports moderation flows.

---

### `admin_actions`

Moderation / audit log.

Columns:

* `admin_user_id`
* `action_type`
* `listing_id`
* `target_user_id`
* `details`
* `created_at`

Used by admin dashboard to show moderation history.

---

### `email_verification_tokens` / `password_reset_tokens`

Columns:

* `user_id`
* `token`
* `expires_at`
* `used`

Used by authentication teammate for verification and reset flows.

---

# **3. Files in the `database/` Directory**

```
database/
│
├── schema.sql
├── seed.sql
├── migrations/
│     ├── 001_initial_schema.sql
│     ├── 002_indexes_and_extensions.sql
│     ├── 003_views.sql
│
└── tests/
      ├── test_plan.md
      └── manual_test_queries.sql
```

### `schema.sql`

Full SQL schema definition (tables + constraints).

### Migrations

* `001_initial_schema.sql` — core tables & relationships
* `002_indexes_and_extensions.sql` — indexes for search & performance
* `003_views.sql` — query layer views (public listings, vendor dashboard, etc.)

### `seed.sql`

Creates a realistic, rich dataset:

* 1 admin user
* 3 vendors
* 3 customers
* 10 categories
* 9 listings across multiple cities and statuses
* structured listing-category assignments
* multiple favorites per user
* several inquiry messages
* multiple reports + admin actions
* verification and reset tokens

This dataset makes development, UI previews, and testing realistic.

---

# **4. Query Layer (SQL Views)**

Located in `migrations/003_views.sql`.

### `public_listings_view`

For **public browsing & search**.
Includes:

* only `active` listings
* vendor info
* aggregated categories array

Used by backend for search endpoints.

---

### `vendor_listings_view`

For **vendor dashboards**.
Includes:

* all listings belonging to a vendor
* `favorite_count` per listing

Used by backend for vendor “My Listings”.

---

### `user_favorites_view`

For **user favorites page**.
Includes:

* listing details
* business name
* favorited timestamp

---

### `open_reports_view`

For **admin moderation**.
Includes:

* open/in_review reports
* listing metadata
* vendor info

Used by backend for the moderation queue.

---

# **5. Seed Data Overview**

The seed file creates:

### Users

* 1 admin
* 3 vendors (verified + unverified)
* 3 customers

### Vendors

Each vendor has a business profile with VAT, city, verified status.

### Categories

10 categories including plumber, electrician, IT services, carpenter, painter, gardener, etc.

### Listings

9 listings:

* multiple cities (Luxembourg, Esch, Differdange)
* mixed statuses (`active`, `submitted`, `draft`, `rejected`)
* realistic descriptions
* proper vendor linking

### Listing–Category Assignments

Each listing is associated with 1–2 categories.

### Favorites

Users have varied favorite listings (2–3 each).

### Messages

Realistic conversations:

* customers → vendors
* subject + body content

### Reports & Admin Actions

Multiple reports with different statuses
Moderation actions logged for audit.

### Tokens

Two email verification tokens
Two password reset tokens

---

# **6. Testing Strategy**

Testing files:

* `tests/test_plan.md` — structured test checklist
* `tests/manual_test_queries.sql` — runnable SQL for each test

Tests cover:

### Constraints

* unique email
* valid roles
* valid statuses
* foreign key integrity

### Relationships

* users ↔ vendors
* vendors ↔ listings
* listings ↔ categories
* users ↔ favorites
* messages with valid users/listings

### Cascading Behavior

Deleting a vendor removes their listings.

### Views

* public listings show only active + categories
* vendor view shows favorite_count
* favorites view matches favorites table
* reports view shows only open/in_review

Everything must pass without unexpected errors.

---

# **7. Integration Guide for Teammates**

This section tells your backend/frontend/auth teammates how to use your DB.

---

## Backend Developer

### Use views for READ operations:

| Feature          | View                   |
| ---------------- | ---------------------- |
| Search listings  | `public_listings_view` |
| Vendor dashboard | `vendor_listings_view` |
| Favorites page   | `user_favorites_view`  |
| Moderation queue | `open_reports_view`    |

### Use tables for WRITE operations:

* `users`, `vendors`
* `listings`, `listing_categories`
* `favorites`
* `messages`
* `reports`, `admin_actions`
* verification + password tokens

---

## Frontend Developer

Expect backend to feed:

* homepage search → `public_listings_view`
* vendor dashboard → `vendor_listings_view`
* favorites page → `user_favorites_view`
* admin UI → `open_reports_view`

The extended dataset makes all pages look populated.

---

## Authentication Developer

Use:

* `users`
* `email_verification_tokens`
* `password_reset_tokens`

Vendor registration requires creating:

1. a user with role `'vendor'`
2. a row in `vendors`

---

## Interactive Features Developer (Messaging, Reporting)

Use:

* `messages`
* `reports`
* `open_reports_view`
* `admin_actions`

The extended dataset includes samples of each flow.

---

# **8. Conclusion**

This database provides a fully functional foundation for our MVP of the Small Business Vendor Directory.

It includes a normalized relational schema, strong constraints and indexing, a realistic seed data, optimized SQL views for core user flows, a complete manual testing suite and clear integration guidance for backend, frontend, authentication, and interactive features.
