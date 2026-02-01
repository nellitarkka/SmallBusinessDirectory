const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateCreateListing, validateUpdateListing } = require('../middleware/validators/listingValidators');
const { listingCreationLimiter } = require('../middleware/rateLimiter');

// Public routes (no authentication needed)
router.get('/', listingController.getAll);
router.get('/:id', listingController.getOne);

// Protected vendor routes (authentication + vendor role required)
router.post('/', authenticate, requireRole('vendor'), listingCreationLimiter, validateCreateListing, listingController.create);
router.get('/vendor/my-listings', authenticate, requireRole('vendor'), listingController.getMine);
router.patch('/:id', authenticate, requireRole('vendor'), validateUpdateListing, listingController.update);
router.delete('/:id', authenticate, requireRole('vendor'), listingController.delete);

module.exports = router;
