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

// Validation for sending a message
const validateSendMessage = [
  body('recipient_id')
    .notEmpty().withMessage('Recipient ID is required')
    .isInt({ min: 1 }).withMessage('Recipient ID must be a positive integer'),
  
  body('listing_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Listing ID must be a positive integer'),
  
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ min: 3, max: 100 }).withMessage('Subject must be 3-100 characters'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateSendMessage
};