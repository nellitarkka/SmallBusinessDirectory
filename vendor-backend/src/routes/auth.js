const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin, validateResendVerification } = require('../middleware/validators/authValidators');
const { registrationLimiter, loginLimiter } = require('../middleware/rateLimiter');

router.post('/register', registrationLimiter, validateRegister, authController.register);
router.post('/login', loginLimiter, validateLogin, authController.login);
router.get('/profile', authenticate, authController.getProfile);

// Email verification routes
router.get('/verify-email/:token', loginLimiter, authController.verifyEmail);
router.post('/resend-verification', loginLimiter, validateResendVerification, authController.resendVerification);

module.exports = router;