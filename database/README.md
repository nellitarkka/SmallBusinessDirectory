# Database Setup — Week 1 (Deliverable II)

## Overview
This folder contains the initial database setup for the **Small Business Vendor Directory** web application.  
The database was created and tested in **Supabase**, which provides a hosted PostgreSQL instance and SQL Editor.

During Week 1, the focus was on:
- Defining the main database schema
- Inserting example data
- Running initial SQL queries to verify correctness and relationships

---

## 📁 Files Included

| File | Description |
|------|--------------|
| **week1_schema.sql** | Defines the database schema: creates tables (`vendors`, `listings`, `reviews`), primary keys, data types, and default values. |
| **week1_seed.sql** | Inserts example vendors and listings to populate the database for testing. |
| **week1_queries.sql** | Contains test queries used to validate that data was inserted correctly and relationships work as expected (e.g., joins, filters, searches). |
| **week1_reset.sql** | Clears all tables and restarts ID sequences, allowing fresh testing without residual data. |

---

## 🧱 Database Schema

The schema currently includes:

- **vendors** — stores vendor details (name, email, phone, website, city).
- **listings** — stores vendor listings (title, category, description, price range, tags, publish status).
- **reviews** *(placeholder)* — will store user feedback linked to listings (to be implemented in Week 2).

### Relationships:
- One **vendor** can have many **listings**.
- Each **listing** belongs to one **vendor**.
- Reviews will be linked to listings later.

---

## 🧪 Testing & Queries

The `week1_queries.sql` file includes:
- **SELECT** statements to verify inserted data  
  (`SELECT * FROM public.vendors;`, `SELECT * FROM public.listings;`)
- **JOIN** queries to confirm relationships  
  (`SELECT v.name, l.title FROM vendors v JOIN listings l ON v.id = l.vendor_id;`)
- **Search and filtering examples** to simulate user searches (e.g., category, tags)
- **Aggregate queries** for quick analysis (e.g., count listings per vendor)

All queries executed successfully in the Supabase SQL Editor.  
No errors were returned, and test data appeared as expected.

---

## 🗓️ Next Steps (Week 2)
- Add **foreign key constraints** between `vendors`, `listings`, and `reviews`.
- Create additional indexes for faster search and filtering.
- Implement and seed the **reviews** table.
- Export and include the **ER diagram** from Supabase Schema Visualizer.

---

## 💡 Notes
- This database is hosted on Supabase and managed online.  
- No local `.env` configuration is required yet.  
- SQL scripts are versioned here for reproducibility and team collaboration.
