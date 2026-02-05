const pool = require('../config/database');

// Helper: try primary query, if missing column error (code 42703), try fallback
async function queryWithFallback(primarySql, fallbackSql, values) {
  try {
    const res = await pool.query(primarySql, values);
    return res;
  } catch (err) {
    // 42703 = undefined_column
    if (err && err.code === '42703' && fallbackSql) {
      const res = await pool.query(fallbackSql, values);
      return res;
    }
    throw err;
  }
}

const Message = {
  // Create a new message via database function (enforces email verification)
  // Can be called in two ways:
  // 1. With listingId: send_message() - automatically resolves vendor from listing
  // 2. Without listingId: send_direct_message() - direct recipient for conversations
  create: async (senderId, recipientId, listingId, subject, content) => {
    try {
      let query;
      let values;

      if (listingId) {
        // Use listing-based message (finds vendor from listing)
        query = `SELECT public.send_message($1, $2, $3, $4) AS id`;
        values = [senderId, listingId, subject || null, content];
      } else if (recipientId) {
        // Use direct message (for existing conversations)
        query = `SELECT public.send_direct_message($1, $2, $3, $4) AS id`;
        values = [senderId, recipientId, subject || null, content];
      } else {
        throw new Error('Either listing ID or recipient ID must be provided');
      }

      const result = await pool.query(query, values);
      
      if (!result.rows[0]) {
        throw new Error('Failed to send message');
      }

      const messageId = result.rows[0].id;

      // Fetch the created message to return
      const fetchQuery = `
        SELECT 
          id,
          listing_id,
          sender_id,
          recipient_id,
          subject,
          content,
          created_at,
          read
        FROM messages
        WHERE id = $1
      `;
      const fetchResult = await pool.query(fetchQuery, [messageId]);
      return fetchResult.rows[0];
    } catch (error) {
      // Check if it's an email verification error
      if (error.code === '42501' || error.message?.includes('Email not verified')) {
        const err = new Error('Email not verified');
        err.code = '42501';
        throw err;
      }
      throw error;
    }
  },

  // Get all messages for a user (inbox)
  getInbox: async (userId) => {
    const primary = `
      SELECT 
        m.id,
        m.listing_id,
        m.sender_user_id    AS sender_id,
        m.receiver_user_id  AS recipient_id,
        m.subject,
        m.body              AS content,
        m.created_at,
        m.is_read           AS read,
        TRIM(CONCAT(COALESCE(sender.first_name, ''), ' ', COALESCE(sender.last_name, ''))) as sender_name,
        sender.email as sender_email,
        l.title as listing_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_user_id = sender.id
      LEFT JOIN listings l ON m.listing_id = l.id
      WHERE m.receiver_user_id = $1
      ORDER BY m.created_at DESC
    `;
    const fallback = `
      SELECT 
        m.id,
        m.listing_id,
        m.sender_id,
        m.recipient_id,
        m.subject,
        m.content,
        m.created_at,
        m.read,
        TRIM(CONCAT(COALESCE(sender.first_name, ''), ' ', COALESCE(sender.last_name, ''))) as sender_name,
        sender.email as sender_email,
        l.title as listing_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN listings l ON m.listing_id = l.id
      WHERE m.recipient_id = $1
      ORDER BY m.created_at DESC
    `;
    const result = await queryWithFallback(primary, fallback, [userId]);
    return result.rows;
  },

  // Get all messages sent by a user
  getSent: async (userId) => {
    const primary = `
      SELECT 
        m.id,
        m.listing_id,
        m.sender_user_id    AS sender_id,
        m.receiver_user_id  AS recipient_id,
        m.subject,
        m.body              AS content,
        m.created_at,
        m.is_read           AS read,
        TRIM(CONCAT(COALESCE(recipient.first_name, ''), ' ', COALESCE(recipient.last_name, ''))) as recipient_name,
        recipient.email as recipient_email,
        l.title as listing_name
      FROM messages m
      LEFT JOIN users recipient ON m.receiver_user_id = recipient.id
      LEFT JOIN listings l ON m.listing_id = l.id
      WHERE m.sender_user_id = $1
      ORDER BY m.created_at DESC
    `;
    const fallback = `
      SELECT 
        m.id,
        m.listing_id,
        m.sender_id,
        m.recipient_id,
        m.subject,
        m.content,
        m.created_at,
        m.read,
        TRIM(CONCAT(COALESCE(recipient.first_name, ''), ' ', COALESCE(recipient.last_name, ''))) as recipient_name,
        recipient.email as recipient_email,
        l.title as listing_name
      FROM messages m
      LEFT JOIN users recipient ON m.recipient_id = recipient.id
      LEFT JOIN listings l ON m.listing_id = l.id
      WHERE m.sender_id = $1
      ORDER BY m.created_at DESC
    `;
    const result = await queryWithFallback(primary, fallback, [userId]);
    return result.rows;
  },

  // Get conversation between two users
  getConversation: async (user1Id, user2Id) => {
    const primary = `
      SELECT 
        m.id,
        m.listing_id,
        m.sender_user_id    AS sender_id,
        m.receiver_user_id  AS recipient_id,
        m.subject,
        m.body              AS content,
        m.created_at,
        m.is_read           AS read,
        TRIM(CONCAT(COALESCE(sender.first_name, ''), ' ', COALESCE(sender.last_name, ''))) as sender_name,
        TRIM(CONCAT(COALESCE(recipient.first_name, ''), ' ', COALESCE(recipient.last_name, ''))) as recipient_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_user_id = sender.id
      LEFT JOIN users recipient ON m.receiver_user_id = recipient.id
      WHERE (m.sender_user_id = $1 AND m.receiver_user_id = $2)
         OR (m.sender_user_id = $2 AND m.receiver_user_id = $1)
      ORDER BY m.created_at ASC
    `;
    const fallback = `
      SELECT 
        m.id,
        m.listing_id,
        m.sender_id,
        m.recipient_id,
        m.subject,
        m.content,
        m.created_at,
        m.read,
        TRIM(CONCAT(COALESCE(sender.first_name, ''), ' ', COALESCE(sender.last_name, ''))) as sender_name,
        TRIM(CONCAT(COALESCE(recipient.first_name, ''), ' ', COALESCE(recipient.last_name, ''))) as recipient_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users recipient ON m.recipient_id = recipient.id
      WHERE (m.sender_id = $1 AND m.recipient_id = $2)
         OR (m.sender_id = $2 AND m.recipient_id = $1)
      ORDER BY m.created_at ASC
    `;
    const result = await queryWithFallback(primary, fallback, [user1Id, user2Id]);
    return result.rows;
  },

  // Get single message by ID
  findById: async (id) => {
    const primary = `
      SELECT 
        m.id,
        m.listing_id,
        m.sender_user_id    AS sender_id,
        m.receiver_user_id  AS recipient_id,
        m.subject,
        m.body              AS content,
        m.created_at,
        m.is_read           AS read,
        TRIM(CONCAT(COALESCE(sender.first_name, ''), ' ', COALESCE(sender.last_name, ''))) as sender_name,
        sender.email as sender_email,
        TRIM(CONCAT(COALESCE(recipient.first_name, ''), ' ', COALESCE(recipient.last_name, ''))) as recipient_name,
        recipient.email as recipient_email,
        l.title as listing_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_user_id = sender.id
      LEFT JOIN users recipient ON m.receiver_user_id = recipient.id
      LEFT JOIN listings l ON m.listing_id = l.id
      WHERE m.id = $1
    `;
    const fallback = `
      SELECT 
        m.id,
        m.listing_id,
        m.sender_id,
        m.recipient_id,
        m.subject,
        m.content,
        m.created_at,
        m.read,
        TRIM(CONCAT(COALESCE(sender.first_name, ''), ' ', COALESCE(sender.last_name, ''))) as sender_name,
        sender.email as sender_email,
        TRIM(CONCAT(COALESCE(recipient.first_name, ''), ' ', COALESCE(recipient.last_name, ''))) as recipient_name,
        recipient.email as recipient_email,
        l.title as listing_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users recipient ON m.recipient_id = recipient.id
      LEFT JOIN listings l ON m.listing_id = l.id
      WHERE m.id = $1
    `;
    const result = await queryWithFallback(primary, fallback, [id]);
    return result.rows[0];
  },

  // Mark message as read
  markAsRead: async (id) => {
    const primary = 'UPDATE messages SET is_read = true WHERE id = $1 RETURNING id, listing_id, sender_user_id AS sender_id, receiver_user_id AS recipient_id, subject, body AS content, created_at, is_read AS read';
    const fallback = 'UPDATE messages SET read = true WHERE id = $1 RETURNING id, listing_id, sender_id, recipient_id, subject, content, created_at, read';
    const result = await queryWithFallback(primary, fallback, [id]);
    return result.rows[0];
  },

  // Delete message
  delete: async (id) => {
    const query = 'DELETE FROM messages WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get unread count for user
  getUnreadCount: async (userId) => {
    const primary = 'SELECT COUNT(*) as count FROM messages WHERE receiver_user_id = $1 AND is_read = false';
    const fallback = 'SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND read = false';
    const result = await queryWithFallback(primary, fallback, [userId]);
    return parseInt(result.rows[0].count, 10);
  }
};

module.exports = Message;