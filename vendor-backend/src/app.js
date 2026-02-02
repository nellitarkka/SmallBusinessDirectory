const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());
// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const categoryRoutes = require('./routes/categories');
const favoriteRoutes = require('./routes/favorites');
const messageRoutes = require('./routes/messages');
const vendorRoutes = require('./routes/vendor');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/vendor', vendorRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
