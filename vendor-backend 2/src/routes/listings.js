const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public routes (no authentication needed)
router.get('/', listingController.getAll);
router.get('/:id', listingController.getOne);

// Protected vendor routes (authentication + vendor role required)
router.post('/', authenticate, requireRole('vendor'), listingController.create);
router.get('/vendor/my-listings', authenticate, requireRole('vendor'), listingController.getMine);
router.patch('/:id', authenticate, requireRole('vendor'), listingController.update);
router.delete('/:id', authenticate, requireRole('vendor'), listingController.delete);

module.exports = router;
