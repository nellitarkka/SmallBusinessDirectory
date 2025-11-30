# Small Business Vendor Directory - Backend API

REST API backend for a Small Business Vendor Directory platform that connects customers with local service providers in Luxembourg.

## 📋 Project Overview

This backend API provides comprehensive functionality for:
- **User Management**: Customer, vendor, and admin registration/authentication
- **Listing Management**: CRUD operations for service listings
- **Search & Discovery**: Filter listings by city, category, and keywords
- **Favorites System**: Users can save their preferred listings
- **Category Management**: Organize services into categories

## 🛠️ Technology Stack

- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest + Supertest
- **Security**: bcrypt, helmet, cors

## 📦 Installation

### Prerequisites
- Node.js v20 or higher
- PostgreSQL database (or Supabase account)
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd vendor-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```env
PORT=3000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. **Start the development server**
```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 🧪 Testing

Run the complete test suite:
```bash
npm test
```

**Test Results**: 25/25 tests passing (100% success rate)
- Authentication: 9/9 tests ✅
- Listings: 6/6 tests ✅
- Categories: 4/4 tests ✅
- Favorites: 6/6 tests ✅

**Test Coverage**: 55.36% overall

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All authenticated endpoints require a Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/register
Register a new user (customer, vendor, or admin)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "customer",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`

### POST /api/auth/login
Authenticate and receive JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK` with token

### GET /api/auth/profile
Get current user profile (requires authentication)

---

## 📝 Listings Endpoints

### GET /api/listings
Get all listings (public)

**Query Parameters:**
- `city` - Filter by city
- `category` - Filter by category name
- `search` - Search in title/description

### GET /api/listings/:id
Get single listing (public)

### POST /api/listings
Create new listing (vendor only, requires auth)

### GET /api/listings/vendor/my-listings
Get vendor's own listings (requires auth)

### PATCH /api/listings/:id
Update listing (vendor only, own listings)

### DELETE /api/listings/:id
Delete listing (vendor only, own listings)

---

## 🏷️ Categories Endpoints

### GET /api/categories
Get all categories (public)

### GET /api/categories/:id
Get single category (public)

### POST /api/categories
Create category (admin only)

### PATCH /api/categories/:id
Update category (admin only)

### DELETE /api/categories/:id
Delete category (admin only)

---

## ⭐ Favorites Endpoints

### POST /api/favorites/:listingId
Add listing to favorites (requires auth)

### GET /api/favorites
Get user's favorites (requires auth)

### GET /api/favorites/:listingId/check
Check if listing is favorited (requires auth)

### DELETE /api/favorites/:listingId
Remove from favorites (requires auth)

---

## 🔒 Authorization

**Role-Based Access Control:**
- Public: GET listings, GET categories
- Customer: All favorites operations
- Vendor: Create/update/delete own listings
- Admin: Category management

**Error Responses:**
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🗂️ Project Structure
```
vendor-backend/
├── src/
│   ├── config/database.js
│   ├── middleware/auth.js
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   └── app.js
├── __tests__/
│   ├── auth.test.js
│   ├── listings.test.js
│   ├── categories.test.js
│   └── favorites.test.js
├── .env
├── package.json
└── README.md
```

## 👥 Collaboration Workflow

**Branching Strategy:**
- `main` - Production code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes

**Commit Convention:**
```
<type>: <description>
Example: feat: add favorites endpoint
```

## 🚀 Deployment

**Environment Variables:**
```env
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
NODE_ENV=production
```

## 📊 Database

PostgreSQL with tables:
- users, vendors, listings
- categories, favorites
- listing_categories (junction table)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Write tests
4. Submit pull request

## 📝 License

Software Engineering Course Project

## 👨‍💻 Authors

Backend API Development Team
