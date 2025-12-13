const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Send a message
router.post('/', messageController.sendMessage);

// Get inbox (received messages)
router.get('/inbox', messageController.getInbox);

// Get sent messages
router.get('/sent', messageController.getSent);

// Get unread count
router.get('/unread-count', messageController.getUnreadCount);

// Get conversation with another user
router.get('/conversation/:otherUserId', messageController.getConversation);

// Get single message
router.get('/:id', messageController.getMessage);

// Mark message as read
router.put('/:id/read', messageController.markAsRead);

// Delete message
router.delete('/:id', messageController.deleteMessage);

module.exports = router;