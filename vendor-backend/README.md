# Small Business Vendor Directory - Backend API

REST API backend for a Small Business Vendor Directory platform that connects customers with local service providers in Luxembourg.

##  Project Overview

This backend API provides comprehensive functionality for:
- **User Management**: Customer, vendor, and admin registration/authentication
- **Listing Management**: CRUD operations for service listings
- **Search & Discovery**: Filter listings by city, category, and keywords
- **Favorites System**: Users can save their preferred listings
- **Category Management**: Organize services into categories

##  Technology Stack

- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest + Supertest
- **Security**: bcrypt, helmet, cors

##  Installation

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
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

4. **Start the development server**
```bash
npm run dev
```

The server will start at `http://localhost:3000`

##  Testing

Run the complete test suite:
```bash
npm test
```

**Test Results**: 142/142 tests passing (100% success rate)
- Test Suites: 15/15 passing
- Statements: 87.25%
- Branch Coverage: 79.31%
- Function Coverage: 100%
- Line Coverage: 87.98%

## API Documentation

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

##  Authentication Endpoints

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

## Listings Endpoints

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

## Categories Endpoints

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

##  Favorites Endpoints

### POST /api/favorites/:listingId
Add listing to favorites (requires auth)

### GET /api/favorites
Get user's favorites (requires auth)

### GET /api/favorites/:listingId/check
Check if listing is favorited (requires auth)

### DELETE /api/favorites/:listingId
Remove from favorites (requires auth)

---

## Messaging Endpoints

### POST /api/messages
Send a message to a vendor (requires verified email, auth)

**Request:**
```json
{
  "recipientId": "user_id",
  "listingId": "listing_id (optional)",
  "subject": "Message subject",
  "body": "Message content"
}
```

**Response:** `201 Created`

### GET /api/messages/inbox
Get user's received messages (requires auth)

### GET /api/messages/sent
Get user's sent messages (requires auth)

### GET /api/messages/:id
Get a specific message (requires auth, must be participant)

### GET /api/messages/conversation/:conversationId
Get messages in a conversation (requires auth)

### PATCH /api/messages/:id/read
Mark message as read (requires auth, must be recipient)

### DELETE /api/messages/:id
Delete a message (requires auth, must be participant)

### GET /api/messages/unread/count
Get count of unread messages (requires auth)

---

## Authorization

**Role-Based Access Control:**
- Public: GET listings, GET categories
- Customer: All favorites and messaging operations
- Vendor: Create/update/delete own listings, messaging operations
- Admin: Category management, listing status updates

**Error Responses:**
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Project Structure
```
vendor-backend/
├── src/
│   ├── config/database.js
│   ├── middleware/auth.js
│   ├── middleware/rateLimiter.js
│   ├── models/
│   │   ├── user.js
│   │   ├── listing.js
│   │   ├── message.js
│   │   ├── category.js
│   │   ├── favorite.js
│   │   └── vendor.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── listingController.js
│   │   ├── messageController.js
│   │   ├── categoryController.js
│   │   └── favoriteController.js
│   ├── services/emailService.js
│   ├── routes/
│   ├── middleware/validators/
│   └── app.js
├── __tests__/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   ├── validation.test.js
│   ├── helpers.js
│   └── setup.js
├── .env
├── package.json
└── README.md
```