const Message = require('../models/message');

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    // Frontend payload: { recipient_id, content, listing_id, subject }
    const { recipient_id, content, listing_id, subject } = req.body;

    if (!recipient_id || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Recipient ID and content are required'
      });
    }

    const message = await Message.create(
      senderId,
      Number(recipient_id),
      listing_id ? Number(listing_id) : null,
      subject || '',
      content
    );

    res.status(201).json({
      status: 'success',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get inbox (received messages)
exports.getInbox = async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = await Message.getInbox(userId);

    res.json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get sent messages
exports.getSent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = await Message.getSent(userId);

    res.json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    console.error('Get sent messages error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get conversation with another user
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otherUserId } = req.params;

    const messages = await Message.getConversation(userId, parseInt(otherUserId));

    res.json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single message
exports.getMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Check if user is sender or recipient
    if (message.sender_id !== userId && message.recipient_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have access to this message'
      });
    }

    res.json({
      status: 'success',
      data: { message }
    });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Only recipient can mark as read
    if (message.recipient_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the recipient can mark message as read'
      });
    }

    const updatedMessage = await Message.markAsRead(id);

    res.json({
      status: 'success',
      data: { message: updatedMessage }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Only sender or recipient can delete
    if (message.sender_id !== userId && message.recipient_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this message'
      });
    }

    await Message.delete(id);

    res.json({
      status: 'success',
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await Message.getUnreadCount(userId);

    res.json({
      status: 'success',
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};