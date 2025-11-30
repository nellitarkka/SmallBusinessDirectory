const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, favoriteController.getMine);
router.post('/:listingId', authenticate, favoriteController.add);
router.delete('/:listingId', authenticate, favoriteController.remove);
router.get('/:listingId/check', authenticate, favoriteController.checkFavorite);

module.exports = router;
