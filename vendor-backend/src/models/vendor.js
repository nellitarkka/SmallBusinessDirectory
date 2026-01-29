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
      const query = 'SELECT * FROM vendors WHERE user_id = $1';
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Vendor;
