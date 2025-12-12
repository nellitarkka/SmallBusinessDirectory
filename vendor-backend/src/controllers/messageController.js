const Message = require('../models/message');

module.exports = {
  // Create a new message
  async create(req, res, next) {
    try {
      const { receiverUserId, listingId, subject, body } = req.body;
      const senderUserId = req.user.id;

      if (!receiverUserId || !listingId || !body) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields: receiverUserId, listingId, body'
        });
      }

      const message = await Message.create(senderUserId, receiverUserId, listingId, subject || null, body);
      
      res.status(201).json({
        status: 'success',
        data: message
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all messages for current user
  async getAll(req, res, next) {
    try {
      const userId = req.user.id;
      const messages = await Message.findByUserId(userId);
      
      res.json({
        status: 'success',
        data: messages
      });
    } catch (error) {
      next(error);
    }
  },

  // Get received messages
  async getReceived(req, res, next) {
    try {
      const userId = req.user.id;
      const messages = await Message.findReceivedByUserId(userId);
      
      res.json({
        status: 'success',
        data: messages
      });
    } catch (error) {
      next(error);
    }
  },

  // Get sent messages
  async getSent(req, res, next) {
    try {
      const userId = req.user.id;
      const messages = await Message.findSentByUserId(userId);
      
      res.json({
        status: 'success',
        data: messages
      });
    } catch (error) {
      next(error);
    }
  },

  // Get conversation with another user for a listing
  async getConversation(req, res, next) {
    try {
      const userId = req.user.id;
      const { otherUserId, listingId } = req.params;

      if (!otherUserId || !listingId) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required parameters: otherUserId, listingId'
        });
      }

      const messages = await Message.findConversation(userId, otherUserId, listingId);
      
      res.json({
        status: 'success',
        data: messages
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single message by ID
  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const message = await Message.findById(id);

      if (!message) {
        return res.status(404).json({
          status: 'error',
          message: 'Message not found'
        });
      }

      res.json({
        status: 'success',
        data: message
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark message as read
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const message = await Message.markAsRead(id);

      if (!message) {
        return res.status(404).json({
          status: 'error',
          message: 'Message not found'
        });
      }

      res.json({
        status: 'success',
        data: message
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark all messages as read
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const messages = await Message.markAllAsReadForUser(userId);
      
      res.json({
        status: 'success',
        data: messages
      });
    } catch (error) {
      next(error);
    }
  },

  // Get unread count
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const count = await Message.getUnreadCount(userId);
      
      res.json({
        status: 'success',
        data: { unreadCount: count }
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete a message
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const message = await Message.delete(id);

      if (!message) {
        return res.status(404).json({
          status: 'error',
          message: 'Message not found'
        });
      }

      res.json({
        status: 'success',
        data: message
      });
    } catch (error) {
      next(error);
    }
  }
};
