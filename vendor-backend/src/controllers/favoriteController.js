const Favorite = require('../models/favorite');
const Listing = require('../models/listing');

const favoriteController = {
  // Add favorite
  async add(req, res) {
    try {
      const { listingId } = req.params;
      const userId = req.user.userId;

      // Check if listing exists
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({
          status: 'error',
          message: 'Listing not found'
        });
      }

      const favorite = await Favorite.add(userId, listingId);
      res.status(201).json({
        status: 'success',
        data: { favorite }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Remove favorite
  async remove(req, res) {
    try {
      const { listingId } = req.params;
      const userId = req.user.userId;

      const favorite = await Favorite.remove(userId, listingId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Get my favorites
  async getMine(req, res) {
    try {
      const userId = req.user.userId;
      const favorites = await Favorite.getUserFavorites(userId);
      res.json({
        status: 'success',
        results: favorites.length,
        data: { favorites }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Check if favorited
  async checkFavorite(req, res) {
    try {
      const { listingId } = req.params;
      const userId = req.user.userId;

      const isFavorited = await Favorite.isFavorited(userId, listingId);
      res.json({
        status: 'success',
        data: { isFavorited }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
};

module.exports = favoriteController;
