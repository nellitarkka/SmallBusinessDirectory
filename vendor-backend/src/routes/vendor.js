const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const Vendor = require('../models/vendor');

/**
 * GET /profile
 * Get vendor profile for authenticated vendor
 */
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

/**
 * GET /
 * Public: get all vendors (for homepage)
 * Query params: limit (default 50), offset (default 0)
 */
router.get('/', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    
    const vendors = await Vendor.getAllPublic(limit, offset);

    res.json({
      status: 'success',
      data: vendors
    });
  } catch (error) {
    console.error('Fetch vendors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch vendors'
    });
  }
});

//  MUST be last
module.exports = router;