const pool = require('../config/database');

const Vendor = {
  async create({ userId, businessName, city, vatNumber }) {
    try {
      const query = `
        INSERT INTO vendors (user_id, business_name, city, vat_number)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const values = [userId, businessName, city, vatNumber];
      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  async findByUserId(userId) {
    try {
      const query = `
        SELECT v.*, u.is_email_verified
        FROM vendors v
        JOIN users u ON u.id = v.user_id
        WHERE v.user_id = $1
      `;
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  async getAllPublic(limit = 50, offset = 0) {
    try {
      // Validate and sanitize inputs
      limit = parseInt(limit, 10);
      offset = parseInt(offset, 10);
      
      if (!Number.isFinite(limit) || limit <= 0) limit = 50;
      if (!Number.isFinite(offset) || offset < 0) offset = 0;
      if (limit > 100) limit = 100; // Max limit
      
      const query = `
        SELECT 
          v.id,
          v.business_name,
          v.city,
          v.created_at,
          u.first_name,
          u.last_name
        FROM vendors v
        JOIN users u ON u.id = v.user_id
        WHERE v.is_verified = true
        ORDER BY v.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      const result = await pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Vendor.getAllPublic: ${error.message}`);
    }
  }
};

module.exports = Vendor;
