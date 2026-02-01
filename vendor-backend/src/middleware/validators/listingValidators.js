const { body, validationResult } = require('express-validator');

// Middleware to check validation results
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

// Validation rules for creating a listing
const validateCreateListing = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  
  body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ max: 50 }).withMessage('City name too long'),
  
  body('contactEmail')
    .trim()
    .notEmpty().withMessage('Contact email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('contactPhone')
    .trim()
    .notEmpty().withMessage('Contact phone is required')
    .matches(/^[\d\s\+\-\(\)]+$/).withMessage('Invalid phone number format'),
  
  body('openingHours')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Opening hours too long'),
  
  body('categoryIds')
    .isArray({ min: 1 }).withMessage('At least one category is required')
    .custom((value) => {
      if (!value.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('Category IDs must be positive integers');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validation rules for updating a listing
const validateUpdateListing = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  
  body('city')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('City name too long'),
  
  body('contact_email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('contact_phone')
    .optional()
    .trim()
    .matches(/^[\d\s\+\-\(\)]+$/).withMessage('Invalid phone number format'),
  
  body('opening_hours')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Opening hours too long'),
  
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status value'),
  
  body('categoryIds')
    .optional()
    .isArray().withMessage('Category IDs must be an array')
    .custom((value) => {
      if (value && !value.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('Category IDs must be positive integers');
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  validateCreateListing,
  validateUpdateListing
};