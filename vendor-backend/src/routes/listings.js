const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { authenticate, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer storage (local uploads folder)
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
	filename: (req, file, cb) => {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname || '') || '.jpg';
		cb(null, `listing-${unique}${ext}`);
	},
});
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		const ok = /image\/(png|jpe?g|webp)/.test(file.mimetype);
		cb(ok ? null : new Error('Invalid image type'), ok);
	},
});

// Public routes (no authentication needed)
router.get('/', listingController.getAll);
router.get('/:id', listingController.getOne);

// Protected vendor routes (authentication + vendor role required)
router.post('/', authenticate, requireRole('vendor'), listingController.create);
router.get('/vendor/my-listings', authenticate, requireRole('vendor'), listingController.getMine);
router.patch('/:id', authenticate, requireRole('vendor'), listingController.update);
router.patch('/:id/image', authenticate, requireRole('vendor'), upload.single('image'), listingController.uploadImage);
router.delete('/:id', authenticate, requireRole('vendor'), listingController.delete);

// Admin routes
router.get('/admin/all', authenticate, requireRole('admin'), listingController.getAllAdmin);
router.patch('/admin/:id/status', authenticate, requireRole('admin'), listingController.updateStatusAdmin);

module.exports = router;
