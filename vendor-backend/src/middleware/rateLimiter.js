const rateLimit = require('express-rate-limit');

// Rate limiter for message sending (5 messages per minute per user)
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per window
  message: {
    status: 'error',
    message: 'Too many messages sent. Please wait a minute before sending more.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID from JWT as the key
  keyGenerator: (req) => `user_${req.user.userId}`,
  skip: (req) => !req.user, // Skip if not authenticated (auth middleware will handle)
  skipFailedRequests: false
});

// Rate limiter for listing creation (3 listings per hour per vendor)
const listingCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per window
  message: {
    status: 'error',
    message: 'Too many listings created. Please wait an hour before creating more.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `user_${req.user.userId}`,
  skip: (req) => !req.user,
  skipFailedRequests: false
});

// Rate limiter for registration (5 attempts per hour per IP)
// No custom keyGenerator - uses default IP-based limiting
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per window
  message: {
    status: 'error',
    message: 'Too many registration attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false
});

// Rate limiter for login (10 attempts per 15 minutes per IP)
// No custom keyGenerator - uses default IP-based limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false
});

module.exports = {
  messageLimiter,
  listingCreationLimiter,
  registrationLimiter,
  loginLimiter
};
