const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const Vendor = require('../models/vendor');

// Get vendor profile for authenticated vendor
router.get('/profile', authenticate, requireRole('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findByUserId(req.user.userId);
    
    if (!vendor) {
      return res.status(404).json({
        status: 'error',
        message: 'Vendor profile not found'
      });
    }
    
    res.json({
      status: 'success',
      data: { vendor }
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
// Public: get all vendors (for homepage)
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.getAllPublic(); // or Vendor.findAll()
    res.json({
      status: 'success',
      data: vendors
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch vendors'
    });
  }
});
