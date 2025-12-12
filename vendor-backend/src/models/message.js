const pool = require('../config/database');

const Message = {
  // Create a new message
  async create(senderUserId, receiverUserId, listingId, subject, body) {
    try {
      const query = `
        INSERT INTO messages (sender_user_id, receiver_user_id, listing_id, subject, body, created_at, is_read)
        VALUES ($1, $2, $3, $4, $5, NOW(), FALSE)
        RETURNING *
      `;
      
      const result = await pool.query(query, [senderUserId, receiverUserId, listingId, subject, body]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Get all messages for a user (both sent and received)
  async findByUserId(userId) {
    try {
      const query = `
        SELECT * FROM messages 
        WHERE sender_user_id = $1 OR receiver_user_id = $1
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Get received messages for a user
  async findReceivedByUserId(userId) {
    try {
      const query = `
        SELECT * FROM messages 
        WHERE receiver_user_id = $1
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Get sent messages for a user
  async findSentByUserId(userId) {
    try {
      const query = `
        SELECT * FROM messages 
        WHERE sender_user_id = $1
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Get conversation between two users for a listing
  async findConversation(userId1, userId2, listingId) {
    try {
      const query = `
        SELECT * FROM messages 
        WHERE listing_id = $3 AND (
          (sender_user_id = $1 AND receiver_user_id = $2) OR
          (sender_user_id = $2 AND receiver_user_id = $1)
        )
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [userId1, userId2, listingId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Get message by ID
  async findById(messageId) {
    try {
      const query = 'SELECT * FROM messages WHERE id = $1';
      const result = await pool.query(query, [messageId]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Mark message as read
  async markAsRead(messageId) {
    try {
      const query = 'UPDATE messages SET is_read = TRUE WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [messageId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Mark all messages as read for a user
  async markAllAsReadForUser(userId) {
    try {
      const query = 'UPDATE messages SET is_read = TRUE WHERE receiver_user_id = $1 AND is_read = FALSE RETURNING *';
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Delete a message
  async delete(messageId) {
    try {
      const query = 'DELETE FROM messages WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [messageId]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Get count of unread messages for a user
  async getUnreadCount(userId) {
    try {
      const query = 'SELECT COUNT(*) as count FROM messages WHERE receiver_user_id = $1 AND is_read = FALSE';
      const result = await pool.query(query, [userId]);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Message;
