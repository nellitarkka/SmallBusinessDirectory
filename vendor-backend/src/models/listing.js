const pool = require('../config/database');

const Listing = {
  // Create a new listing
  async create(vendorId, data) {
    try {
      const { title, description, city, contactEmail, contactPhone, openingHours } = data;
      
      const query = `
        INSERT INTO listings (vendor_id, title, description, city, contact_email, contact_phone, opening_hours, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
        RETURNING *
      `;
      
      const values = [vendorId, title, description, city, contactEmail, contactPhone, openingHours];
      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Get all active listings (public view)
  async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM public_listings_view WHERE 1=1';
      const params = [];
      let paramCount = 1;
      
      // Filter by city
      if (filters.city) {
        query += ` AND city ILIKE $${paramCount}`;
        params.push(`%${filters.city}%`);
        paramCount++;
      }
      
      // Filter by category
      if (filters.category) {
        query += ` AND $${paramCount} = ANY(categories)`;
        params.push(filters.category);
        paramCount++;
      }
      
      // Search in title or description
      if (filters.search) {
        query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
        paramCount++;
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Get one listing by ID
  async findById(id) {
    try {
      const query = 'SELECT * FROM public_listings_view WHERE listing_id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Get all listings for a vendor
  async findByVendorUserId(userId) {
    try {
      const query = 'SELECT * FROM vendor_listings_view WHERE vendor_user_id = $1 ORDER BY created_at DESC';
      const result = await pool.query(query, [userId]);
      // Map listing_id to id for consistency with frontend
      return result.rows.map(row => ({
        ...row,
        id: row.listing_id
      }));
    } catch (error) {
      throw error;
    }
  },

  // Update a listing
  async update(id, data) {
    try {
      const allowedFields = ['title', 'description', 'city', 'contact_email', 'contact_phone', 'opening_hours', 'status', 'image_url'];
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      // Build dynamic UPDATE query
      Object.keys(data).forEach(key => {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = $${paramCount}`);
          values.push(data[key]);
          paramCount++;
        }
      });
      
      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      updates.push(`updated_at = NOW()`);
      values.push(id);
      
      const query = `
        UPDATE listings
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Delete a listing
  async delete(id) {
    try {
      const query = 'DELETE FROM listings WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Get listing with vendor check (for authorization)
  async findByIdWithVendor(id) {
    try {
      const query = `
        SELECT l.*, v.id as vendor_id, v.user_id as vendor_user_id
        FROM listings l
        JOIN vendors v ON l.vendor_id = v.id
        WHERE l.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Add categories to a listing
  async addCategories(listingId, categoryIds) {
    try {
      if (!categoryIds || categoryIds.length === 0) return;
      
      const values = categoryIds.map((catId, idx) => `($1, $${idx + 2})`).join(', ');
      const query = `
        INSERT INTO listing_categories (listing_id, category_id)
        VALUES ${values}
        ON CONFLICT DO NOTHING
      `;
      
      await pool.query(query, [listingId, ...categoryIds]);
    } catch (error) {
      throw error;
    }
  },

  // Remove all categories from a listing
  async removeCategories(listingId) {
    try {
      const query = 'DELETE FROM listing_categories WHERE listing_id = $1';
      await pool.query(query, [listingId]);
    } catch (error) {
      throw error;
    }
  }
,
  // Admin: get all listings with status and vendor info
  async findAllAdmin() {
    try {
      const query = 'SELECT * FROM vendor_listings_view ORDER BY created_at DESC';
      const result = await pool.query(query);
      // Map listing_id to id for consistency with frontend
      return result.rows.map(row => ({
        ...row,
        id: row.listing_id
      }));
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Listing;
