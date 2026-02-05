# Small Business Vendor Directory — Frontend

React + TypeScript frontend for the **Small Business Vendor Directory** platform.  
Customers can browse vendor listings and contact vendors. Vendors can manage listings and submit them for admin approval. Admins can moderate submissions (approve/reject with reason).

---

## Tech Stack

- **React + TypeScript**
- **Vite** (development server & build tool)
- **React Router** (client-side routing)
- **Vitest + React Testing Library** (frontend testing)
- REST API integration via `src/services/api.ts`

---

## Prerequisites

- **Node.js** (recommended version: 18+)
- **npm** (comes with Node.js)

---

## User Roles & Features
### Customer
- Browse approved vendor listings
- Search and filter vendors
- View vendor details
- Save vendors to favorites
- Contact vendors via messaging

### Vendor

Vendor dashboard
- Create and edit listings
- Upload listing images
- Save listings as drafts
- Submit listings for admin review
- View listing status (draft / submitted / active / rejected)
- View rejection reasons and resubmit if rejected
- Submission blocked when vendor account is unverified (UI-level restriction)

### Admin
- Admin dashboard
- Review submitted listings
- Approve listings
- Reject listings with a rejection reason
- View approved and rejected listings


#### Structure

src/
- auth/         # Authentication context and role handling
- components/   # Reusable UI components
- css/          # Page-level and shared styles
- data/         # Frontend data models and stores
- pages/        # Route-level pages (customer, vendor, admin)
- services/     # API client and endpoint wrappers
- utils/        # Shared utilities
- App.tsx       # Root application component
 
