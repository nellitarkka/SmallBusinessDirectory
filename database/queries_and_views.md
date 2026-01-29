# Database Query Layer – Views & Common Queries (Week 3)

This document describes the SQL views and common read queries that form the **database query layer** for the Small Business Vendor Directory.

These views provide consistent, reusable structures for:

* public listing browsing & search
* vendor dashboards
* user favorites
* admin moderation tools

They simplify backend development by centralizing query logic in the database instead of scattering SQL joins throughout application code.

All views are defined in:

```
database/migrations/003_views.sql
```

---

# 1. `public_listings_view`

### **Purpose**

This view is used for all *public-facing* listing browsing and search functionality.

It returns:

* only listings with `status = 'active'`
* vendor business information
* aggregated list of category names
* core listing details (title, description, city, contact, etc.)

This view is optimized for the **Search Listings** use-case.

### **Columns Exposed**

* listing_id
* title
* description
* city
* contact_email
* contact_phone
* opening_hours
* created_at
* business_name
* vendor_city
* vendor_user_id
* vendor_email
* categories (array of category names)

### **Example Queries**

```sql
-- Retrieve all active listings (default browse)
SELECT * FROM public_listings_view;

-- Filter listings by city
SELECT *
FROM public_listings_view
WHERE city = 'Esch-sur-Alzette';

-- Keyword search in title or description
SELECT *
FROM public_listings_view
WHERE title ILIKE '%plumbing%'
   OR description ILIKE '%plumbing%';

-- Filter by category (frontend/backend logic applies category filtering)
-- Example: filter listings that have the category 'Plumber'
SELECT *
FROM public_listings_view
WHERE 'Plumber' = ANY (categories);
```

---

# 2. `vendor_listings_view`

### **Purpose**

Used in the **Vendor Dashboard**, where a vendor sees all their listings regardless of status.

Includes:

* listing status
* vendor profile link
* number of customers who favorited each listing

This supports vendor tools like:

* “My Listings” dashboard
* “Manage Listing Status”
* “See interest (favorites)”

### **Columns Exposed**

* listing_id
* vendor_id
* vendor_user_id
* business_name
* title
* description
* city
* status
* created_at
* updated_at
* favorite_count

### **Example Queries**

```sql
-- All listings belonging to a specific vendor user
SELECT *
FROM vendor_listings_view
WHERE vendor_user_id = :current_vendor_user_id;

-- Vendor sees only listings in 'submitted' status
SELECT *
FROM vendor_listings_view
WHERE vendor_user_id = :id
  AND status = 'submitted';
```

---

# 3. `user_favorites_view`

### **Purpose**

Provides all listings *favorited* by a specific user.
Directly supports the **“My Favorites”** feature.

This view includes:

* listing details
* vendor business name
* favorited_at timestamp

### **Columns Exposed**

* user_id
* favorited_at
* listing_id
* title
* city
* business_name
* status

### **Example Queries**

```sql
-- Show all favorites for a specific user
SELECT *
FROM user_favorites_view
WHERE user_id = :current_user_id;

-- Show favorites that are currently active listings
SELECT *
FROM user_favorites_view
WHERE user_id = :uid
  AND status = 'active';
```

---

# 4. `open_reports_view`

### **Purpose**

This view is for **admin moderation**.

It lists all reports with:

* report details
* listing metadata
* vendor information

Supports use-cases:

* Admin views open reports
* Admin inspects listing/vendorship behind the report
* Admin triggers moderation actions

### **Columns Exposed**

* report_id
* listing_id
* reporter_user_id
* reason
* status
* created_at
* listing_title
* listing_city
* vendor_business_name
* vendor_user_id

### **Example Queries**

```sql
-- Default moderation queue
SELECT *
FROM open_reports_view
ORDER BY created_at DESC;

-- Find reports for listings in Luxembourg City
SELECT *
FROM open_reports_view
WHERE listing_city = 'Luxembourg';
```
