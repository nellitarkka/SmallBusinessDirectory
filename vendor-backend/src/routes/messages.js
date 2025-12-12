const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// IMPORTANT: Static routes MUST come before parameterized routes
// Get unread count
router.get('/unread/count', messageController.getUnreadCount);

// Get received messages
router.get('/received', messageController.getReceived);

// Get sent messages
router.get('/sent', messageController.getSent);

// Mark all messages as read
router.patch('/read/all', messageController.markAllAsRead);

// Get conversation between two users
router.get('/conversation/:otherUserId/:listingId', messageController.getConversation);

// Create a new message
router.post('/', messageController.create);

// Get all messages for current user
router.get('/', messageController.getAll);

// Get single message by ID
router.get('/:id', messageController.getOne);

// Mark message as read
router.patch('/:id/read', messageController.markAsRead);

// Delete message
router.delete('/:id', messageController.delete);

module.exports = router;
