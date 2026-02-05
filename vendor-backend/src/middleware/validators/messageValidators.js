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
  body('recipientId')
    .notEmpty().withMessage('Recipient ID is required')
    .isInt({ min: 1 }).withMessage('Recipient ID must be a positive integer'),
  
  body('listingId')
    .optional()
    .isInt({ min: 1 }).withMessage('Listing ID must be a positive integer'),
  
  body('subject')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Subject must be 3-100 characters'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateSendMessage
};