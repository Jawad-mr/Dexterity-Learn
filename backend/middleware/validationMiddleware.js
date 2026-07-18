import { body, param, validationResult } from 'express-validator';

// Helper to run validations and return errors
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.param, message: e.msg })),
    });
  };
};

// Auth validators
export const signupValidator = validate([
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
]);

export const loginValidator = validate([
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password is required'),
]);

export const forgotPasswordValidator = validate([
  body('email').trim().isEmail().withMessage('Valid email required'),
]);

export const resetPasswordValidator = validate([
  body('token').exists().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]);

// Admin validators (example for courses)
export const adminCreateCourseValidator = validate([
  body('title').trim().notEmpty().withMessage('Course title is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
]);

export const adminUpdateCourseValidator = validate([
  param('id').isMongoId().withMessage('Valid course ID required'),
  body('title').optional().trim().notEmpty().withMessage('If provided, title cannot be empty'),
]);

// Export other validators as needed
