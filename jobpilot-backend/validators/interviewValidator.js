const { body, param, validationResult } = require('express-validator');
const { INTERVIEW_TYPES, INTERVIEW_STATUSES } = require('../models/Interview');

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

const VALID_MODES = ['Online', 'In-Person', 'Phone', ''];

const createInterviewValidator = [
  body('job')
    .notEmpty()
    .withMessage('Job ID is required')
    .isMongoId()
    .withMessage('Invalid job ID'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Interview title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),

  body('type')
    .optional()
    .isIn(INTERVIEW_TYPES)
    .withMessage(`Type must be one of: ${INTERVIEW_TYPES.join(', ')}`),

  body('scheduledDate')
    .notEmpty()
    .withMessage('Scheduled date is required')
    .isISO8601()
    .withMessage('Scheduled date must be a valid date'),

  body('duration')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive number (minutes)'),

  body('mode')
    .optional({ checkFalsy: true })
    .isIn(VALID_MODES)
    .withMessage(`Mode must be one of: ${VALID_MODES.filter(Boolean).join(', ')}`),

  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location cannot exceed 255 characters'),

  body('interviewers')
    .optional()
    .isArray()
    .withMessage('Interviewers must be an array'),

  body('interviewers.*.email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid interviewer email'),

  body('status')
    .optional()
    .isIn(INTERVIEW_STATUSES)
    .withMessage(`Status must be one of: ${INTERVIEW_STATUSES.join(', ')}`),

  body('preparationNotes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Preparation notes cannot exceed 3000 characters'),

  validate,
];

const updateInterviewValidator = [
  param('id').isMongoId().withMessage('Invalid interview ID'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),

  body('type')
    .optional()
    .isIn(INTERVIEW_TYPES)
    .withMessage(`Type must be one of: ${INTERVIEW_TYPES.join(', ')}`),

  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid date'),

  body('duration')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive number (minutes)'),

  body('mode')
    .optional({ checkFalsy: true })
    .isIn(VALID_MODES)
    .withMessage(`Mode must be one of: ${VALID_MODES.filter(Boolean).join(', ')}`),

  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location cannot exceed 255 characters'),

  body('interviewers')
    .optional()
    .isArray()
    .withMessage('Interviewers must be an array'),

  body('status')
    .optional()
    .isIn(INTERVIEW_STATUSES)
    .withMessage(`Status must be one of: ${INTERVIEW_STATUSES.join(', ')}`),

  body('feedback')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Feedback cannot exceed 3000 characters'),

  body('rating')
    .optional({ checkFalsy: true, nullable: true })
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('preparationNotes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Preparation notes cannot exceed 3000 characters'),

  validate,
];

const updateInterviewStatusValidator = [
  param('id').isMongoId().withMessage('Invalid interview ID'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(INTERVIEW_STATUSES)
    .withMessage(`Status must be one of: ${INTERVIEW_STATUSES.join(', ')}`),

  validate,
];

const addFeedbackValidator = [
  param('id').isMongoId().withMessage('Invalid interview ID'),

  body('feedback')
    .trim()
    .notEmpty()
    .withMessage('Feedback is required')
    .isLength({ max: 3000 })
    .withMessage('Feedback cannot exceed 3000 characters'),

  body('rating')
    .optional({ checkFalsy: true, nullable: true })
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  validate,
];

const mongoIdValidator = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];

module.exports = {
  createInterviewValidator,
  updateInterviewValidator,
  updateInterviewStatusValidator,
  addFeedbackValidator,
  mongoIdValidator,
};