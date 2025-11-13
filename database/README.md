# Database Design 

This document describes the relational database design for the **Small Business Vendor Directory** project.
The schema is based on the project’s **functional requirements**, **user stories**, **use-case descriptions**, and **domain model**.

The database follows a **role-based Users model**, where customers, vendors, and admins all share a common `users` table but have additional logic/attributes extending it.

---

# 1. Overview of Planned Tables

### Core Tables

* **users**
* **vendors**
* **listings**
* **categories**

### Relationship / Link Tables

* **listing_categories**
* **favorites**

### Messaging & Reporting

* **messages**
* **reports**

### Administration & Security

* **admin_actions**
* **email_verification_tokens**
* **password_reset_tokens**

---

# 2. Table Purposes

## **users**

Stores all authenticated accounts (customers, vendors, and admins).
A single table with a role column simplifies authentication and permission management.

## **vendors**

Contains vendor-specific information.
Each vendor has exactly one corresponding row in `users` with role = 'vendor'.
Models the business profile and verification status.

## **listings**

Represents vendor-submitted business listings visible to customers.
Includes listing content, contact info, status (draft/submitted/active/rejected), and metadata.

## **categories**

Predefined categories (e.g., Painter, Plumber, Bakery).
Used for filtering during search and browsing.

## **listing_categories**

Join table representing the many-to-many relationship between listings and categories.

## **favorites**

Tracks which listings have been saved (“favorited”) by which users.
Another many-to-many relationship: users ↔ listings.

## **messages**

Inquiry messages exchanged between customers and vendors about a listing.
Includes sender, receiver, listing, and read/unread status.

## **reports**

Abuse or problem reports submitted by users.
Admins moderate these entries and may take follow-up action.

## **admin_actions**

Audit log of administrative or moderation actions.
Allows traceability of “approve listing”, “reject listing”, “suspend user”, etc.

## **email_verification_tokens**

For new accounts to verify their email addresses.

## **password_reset_tokens**

For password reset flows when a user forgets their password.

---

# 3. Relationships (Conceptual ERD)

This section outlines the relationships between all major entities.

### Users & Roles

* One `user` has exactly one role: **customer**, **vendor**, or **admin**.
* A vendor user has an associated row in the `vendors` table.

### Vendors ↔ Listings

* One **vendor** can create many **listings**.
* One **listing** belongs to exactly one **vendor**.
* If a vendor is deleted → all their listings are removed (ON DELETE CASCADE).

### Listings ↔ Categories

* Many-to-many relationship:

  * A listing can have multiple categories.
  * A category can be applied to multiple listings.
* Implemented via `listing_categories (listing_id, category_id)`.

### Users ↔ Favorites ↔ Listings

* A user can favorite many listings.
* A listing can be favorited by many users.
* Many-to-many via `favorites (user_id, listing_id)`.

### Messages

* Each message belongs to one listing.
* Has both `sender_user_id` and `receiver_user_id`.
* Both sender and receiver must exist as users.

### Reports

* A report references one listing (optional in case the listing is deleted).
* Reporter must be an existing user.
* Tracks status (open, in_review, resolved).

### Admin Actions

* Performed by admin users.
* Can optionally reference:

  * a listing,
  * a user,
  * or both.

### Email & Password Tokens

* Belong to a specific user.
* Have expiration timestamps and a “used” flag.

---

# 4. SQL Schema File

The full SQL schema is implemented in:

```
database/schema.sql
```

It defines:

* Table creation
* Primary keys
* Foreign keys
* Cascading behavior
* Constraints
* Indexes for search and filtering

This schema is synchronized with the conceptual ERD described above.