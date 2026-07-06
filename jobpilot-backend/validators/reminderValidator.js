const { body, param, validationResult } = require('express-validator');
const { REMINDER_TYPES } = require('../models/Reminder');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

const createReminderValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Reminder title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('type')
    .optional()
    .isIn(REMINDER_TYPES)
    .withMessage(`Type must be one of: ${REMINDER_TYPES.join(', ')}`),

  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date'),

  body('job')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid job ID'),

  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),

  validate,
];

const updateReminderValidator = [
  param('id').isMongoId().withMessage('Invalid reminder ID'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('type')
    .optional()
    .isIn(REMINDER_TYPES)
    .withMessage(`Type must be one of: ${REMINDER_TYPES.join(', ')}`),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),

  body('job')
    .optional({ checkFalsy: true, nullable: true })
    .isMongoId()
    .withMessage('Invalid job ID'),

  body('isCompleted')
    .optional()
    .isBoolean()
    .withMessage('isCompleted must be a boolean'),

  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),

  validate,
];

const mongoIdValidator = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];

module.exports = {
  createReminderValidator,
  updateReminderValidator,
  mongoIdValidator,
};