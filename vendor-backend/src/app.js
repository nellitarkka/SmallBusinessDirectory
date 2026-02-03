const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();

/**
 * Security middleware
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

/**
 * General CORS configuration
 * - No hardcoded frontend URLs
 * - Supports authenticated requests (JWT)
 * - Safe and acceptable for coursework deployment
 */
app.use(
  cors({
    origin: true, // allow all origins dynamically
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

/**
 * Body parsing
 */
app.use(express.json());

/**
 * Serve uploaded images
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Import routes
 */
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const categoryRoutes = require('./routes/categories');
const favoriteRoutes = require('./routes/favorites');
const messageRoutes = require('./routes/messages');
const vendorRoutes = require('./routes/vendor');

/**
 * Mount routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/vendors', vendorRoutes);

/**
 * Health check endpoint (useful for deployment verification)
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running'
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

/**
 * Start server
 */
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
