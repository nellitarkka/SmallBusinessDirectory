# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/register | 5 requests | 1 hour per IP |
| POST /auth/login | 10 requests | 15 minutes per IP |
| POST /listings | 3 requests | 1 hour per user |
| POST /messages | 5 requests | 1 minute per user |

## Endpoints

### Authentication Endpoints
- POST /auth/register - Register new user
- POST /auth/login - Login user  
- GET /auth/profile - Get user profile (requires auth)

### Listing Endpoints
- GET /listings - Get all listings (public)
- GET /listings/:id - Get single listing (public)
- POST /listings - Create listing (vendor only, rate limited)
- PATCH /listings/:id - Update listing (vendor only)
- DELETE /listings/:id - Delete listing (vendor only)

### Message Endpoints
- POST /messages - Send message (rate limited)
- GET /messages/inbox - Get received messages
- GET /messages/sent - Get sent messages

For detailed request/response examples, see full documentation.
