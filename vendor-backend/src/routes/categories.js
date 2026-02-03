const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getOne);

// Admin routes
router.post('/', authenticate, requireRole('admin'), categoryController.create);
router.patch('/:id', authenticate, requireRole('admin'), categoryController.update);
router.delete('/:id', authenticate, requireRole('admin'), categoryController.delete);

module.exports = router;
