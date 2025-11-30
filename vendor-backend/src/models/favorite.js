const pool = require('../config/database');

const Favorite = {
  // Add favorite
  async add(userId, listingId) {
    const result = await pool.query(
      'INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [userId, listingId]
    );
    return result.rows[0];
  },

  // Remove favorite
  async remove(userId, listingId) {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2 RETURNING *',
      [userId, listingId]
    );
    return result.rows[0];
  },

  // Get user favorites
  async getUserFavorites(userId) {
    const result = await pool.query(
      'SELECT * FROM user_favorites_view WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  },

  // Check if favorited
  async isFavorited(userId, listingId) {
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM favorites WHERE user_id = $1 AND listing_id = $2) as is_favorited',
      [userId, listingId]
    );
    return result.rows[0].is_favorited;
  }
};

module.exports = Favorite;
