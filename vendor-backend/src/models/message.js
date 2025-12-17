const pool = require('../config/database');

const Message = {
  // Create a new message
  create: async (senderId, recipientId, listingId, subject, content) => {
    const query = `
      INSERT INTO messages (sender_id, recipient_id, listing_id, subject, content)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [senderId, recipientId, listingId, subject, content];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get all messages for a user (inbox)
  getInbox: async (userId) => {
    const query = `
      SELECT 
        m.*,
        sender.name as sender_name,
        sender.email as sender_email,
        l.business_name as listing_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN listings l ON m.listing_id = l.id
      WHERE m.recipient_id = $1
      ORDER BY m.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // Get all messages sent by a user
  getSent: async (userId) => {
    const query = `
      SELECT 
        m.*,
        recipient.name as recipient_name,
        recipient.email as recipient_email,
        l.business_name as listing_name
      FROM messages m
      LEFT JOIN users recipient ON m.recipient_id = recipient.id
      LEFT JOIN listings l ON m.listing_id = l.id
      WHERE m.sender_id = $1
      ORDER BY m.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // Get conversation between two users
  getConversation: async (user1Id, user2Id) => {
    const query = `
      SELECT 
        m.*,
        sender.name as sender_name,
        recipient.name as recipient_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users recipient ON m.recipient_id = recipient.id
      WHERE (m.sender_id = $1 AND m.recipient_id = $2)
         OR (m.sender_id = $2 AND m.recipient_id = $1)
      ORDER BY m.created_at ASC
    `;
    const result = await pool.query(query, [user1Id, user2Id]);
    return result.rows;
  },

  // Get single message by ID
  findById: async (id) => {
    const query = `
      SELECT 
        m.*,
        sender.name as sender_name,
        sender.email as sender_email,
        recipient.name as recipient_name,
        recipient.email as recipient_email,
        l.business_name as listing_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users recipient ON m.recipient_id = recipient.id
      LEFT JOIN listings l ON m.listing_id = l.id
      WHERE m.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Mark message as read
  markAsRead: async (id) => {
    const query = 'UPDATE messages SET read = true WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Delete message
  delete: async (id) => {
    const query = 'DELETE FROM messages WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get unread count for user
  getUnreadCount: async (userId) => {
    const query = 'SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND read = false';
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
};

module.exports = Message;