# Architecture Overview

## 1. System Overview
The project is a three‑tier web application:

- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express REST API
- **Database**: PostgreSQL (Supabase)

```
Browser → Frontend (Vite/React) → Backend (Express) → PostgreSQL (Supabase)
```

---

## 2. Frontend (Vite + React)
**Location**: frontend/

Responsibilities:
- UI routes for customers, vendors, and admins
- Form validation and client-side state management
- API communication via services/api.ts

Key pages:
- Landing, listings, vendor detail
- Customer dashboard (favorites, messages)
- Vendor dashboard (listing management)
- Admin dashboard (approvals)

---

## 3. Backend (Express API)
**Location**: vendor-backend/

Responsibilities:
- REST endpoints for auth, listings, categories, favorites, and messaging
- Input validation (`express-validator`)
- Rate limiting (`express-rate-limit`)
- JWT authentication + role-based authorization

### Request Flow
1. Request hits route
2. Middleware stack:
   - Rate limiting (auth/listings/messages)
   - Validation (payload checks)
   - Authentication (JWT verification)
   - Authorization (role checks)
3. Controller handles business logic
4. DB model executes SQL

---

## 4. Database (PostgreSQL / Supabase)
**Location**: database/

Highlights:
- Core tables: users, vendors, listings, categories
- Relations: listing_categories, favorites
- Messaging: messages, inquiries
- Security: rate_limits, email_verification_tokens
- Views: public_listings_view, vendor_listings_view

Migrations are versioned in database/migrations/.

---

## 5. File Storage (Listing Images)
- Upload handled by Multer on backend
- Files stored locally under `vendor-backend/src/uploads/`
- Public URL stored in DB as `/uploads/<filename>`
- Served via Express static middleware at `/uploads`

---

## 6. Security Model (Summary)
- **Authentication**: JWT, bearer tokens
- **Authorization**: role checks (customer/vendor/admin)
- **Validation**: server-side request validation (auth/listings/messages)
- **Rate limiting**: auth, listing creation, and messaging
- **Hardening**: Helmet + CORS
- **DB enforcement**: constraints and security logic in migrations

---

## 7. Deployment Architecture (Azure)

- **Frontend & Backend**: Azure Virtual Machine with Docker and docker-compose
- **Database**: PostgreSQL on Supabase
- **Email**: Gmail SMTP
- **Access**: http://smallbusinessdirectory.francecentral.cloudapp.azure.com or http://20.199.16.127

Both the frontend (Vite + React) and backend (Node.js + Express) are containerized using Docker and orchestrated with docker-compose, then deployed on a single Azure VM. The application is fully functional and publicly accessible.

Environment variables are configured in Azure (not committed).

---

## 8. Observability & Logs
- Backend logs via console (Node)
- Test coverage via Jest
- CI checks on PRs

---

## 9. Key Risks & Mitigations
- **Rate limiting bypass** → middleware enforced on write endpoints
- **Data validation gaps** → express-validator on key routes
- **Unauthorized access** → auth middleware + role checks
- **Large uploads** → Multer size/type limits
