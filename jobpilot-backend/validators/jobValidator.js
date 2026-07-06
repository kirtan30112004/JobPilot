const { body, param, query, validationResult } = require('express-validator');
const { JOB_STATUSES } = require('../models/Job');

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

const VALID_JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Hybrid', ''];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

const createJobValidator = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),

  body('jobTitle')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ max: 150 })
    .withMessage('Job title cannot exceed 150 characters'),

  body('company')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid company ID'),

  body('jobDescription')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Job description cannot exceed 5000 characters'),

  body('jobUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Please provide a valid job URL'),

  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Location cannot exceed 150 characters'),

  body('jobType')
    .optional({ checkFalsy: true })
    .isIn(VALID_JOB_TYPES)
    .withMessage(`Job type must be one of: ${VALID_JOB_TYPES.filter(Boolean).join(', ')}`),

  body('salaryRange.min')
    .optional({ checkFalsy: true, nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Minimum salary cannot be negative'),

  body('salaryRange.max')
    .optional({ checkFalsy: true, nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Maximum salary cannot be negative')
    .custom((value, { req }) => {
      const min = req.body.salaryRange?.min;
      if (min !== undefined && min !== null && value !== undefined && value !== null) {
        if (Number(value) < Number(min)) {
          throw new Error('Maximum salary cannot be less than minimum salary');
        }
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(JOB_STATUSES)
    .withMessage(`Status must be one of: ${JOB_STATUSES.join(', ')}`),

  body('appliedDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Applied date must be a valid date'),

  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters'),

  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Notes cannot exceed 3000 characters'),

  validate,
];

const updateJobValidator = [
  param('id').isMongoId().withMessage('Invalid job ID'),

  body('companyName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),

  body('jobTitle')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Job title cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Job title cannot exceed 150 characters'),

  body('company')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid company ID'),

  body('jobDescription')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Job description cannot exceed 5000 characters'),

  body('jobUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Please provide a valid job URL'),

  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Location cannot exceed 150 characters'),

  body('jobType')
    .optional({ checkFalsy: true })
    .isIn(VALID_JOB_TYPES)
    .withMessage(`Job type must be one of: ${VALID_JOB_TYPES.filter(Boolean).join(', ')}`),

  body('salaryRange.min')
    .optional({ checkFalsy: true, nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Minimum salary cannot be negative'),

  body('salaryRange.max')
    .optional({ checkFalsy: true, nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Maximum salary cannot be negative'),

  body('status')
    .optional()
    .isIn(JOB_STATUSES)
    .withMessage(`Status must be one of: ${JOB_STATUSES.join(', ')}`),

  body('appliedDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Applied date must be a valid date'),

  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Notes cannot exceed 3000 characters'),

  body('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean'),

  validate,
];

const updateJobStatusValidator = [
  param('id').isMongoId().withMessage('Invalid job ID'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(JOB_STATUSES)
    .withMessage(`Status must be one of: ${JOB_STATUSES.join(', ')}`),

  body('note')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),

  validate,
];

const getJobsQueryValidator = [
  query('status')
    .optional()
    .custom((value) => {
      const statuses = Array.isArray(value) ? value : [value];
      const invalid = statuses.filter((s) => !JOB_STATUSES.includes(s));
      if (invalid.length > 0) {
        throw new Error(`Invalid status value(s): ${invalid.join(', ')}`);
      }
      return true;
    }),

  query('jobType')
    .optional()
    .isIn(VALID_JOB_TYPES.filter(Boolean))
    .withMessage(`Job type must be one of: ${VALID_JOB_TYPES.filter(Boolean).join(', ')}`),

  query('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'appliedDate', 'jobTitle', 'companyName', 'priority'])
    .withMessage('Invalid sortBy field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  validate,
];

const mongoIdValidator = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];

module.exports = {
  createJobValidator,
  updateJobValidator,
  updateJobStatusValidator,
  getJobsQueryValidator,
  mongoIdValidator,
};