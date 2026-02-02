const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation for user registration
const validateRegister = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['customer', 'vendor']).withMessage('Role must be customer or vendor'),
  
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  
  // Conditional validation for vendors
  body('businessName')
    .if(body('role').equals('vendor'))
    .trim()
    .notEmpty().withMessage('Business name is required for vendors')
    .isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters'),
  
  body('city')
    .if(body('role').equals('vendor'))
    .trim()
    .notEmpty().withMessage('City is required for vendors'),
  
  body('vatNumber')
    .if(body('role').equals('vendor'))
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('VAT number too long'),
  
  handleValidationErrors
];

// Validation for login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

// Validation for resend verification
const validateResendVerification = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateResendVerification
};