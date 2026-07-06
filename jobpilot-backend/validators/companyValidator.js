const { body, param, validationResult } = require('express-validator');

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

const VALID_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+', ''];

const createCompanyValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),

  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('industry')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Industry cannot exceed 100 characters'),

  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Location cannot exceed 150 characters'),

  body('size')
    .optional({ checkFalsy: true })
    .isIn(VALID_SIZES)
    .withMessage(`Size must be one of: ${VALID_SIZES.filter(Boolean).join(', ')}`),

  body('recruiters')
    .optional()
    .isArray()
    .withMessage('Recruiters must be an array'),

  body('recruiters.*.name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Recruiter name cannot exceed 100 characters'),

  body('recruiters.*.email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid recruiter email'),

  body('recruiters.*.phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),

  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),

  validate,
];

const updateCompanyValidator = [
  param('id').isMongoId().withMessage('Invalid company ID'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),

  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('industry')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Industry cannot exceed 100 characters'),

  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Location cannot exceed 150 characters'),

  body('size')
    .optional({ checkFalsy: true })
    .isIn(VALID_SIZES)
    .withMessage(`Size must be one of: ${VALID_SIZES.filter(Boolean).join(', ')}`),

  body('recruiters')
    .optional()
    .isArray()
    .withMessage('Recruiters must be an array'),

  body('recruiters.*.email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid recruiter email'),

  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),

  validate,
];

const mongoIdValidator = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];

module.exports = {
  createCompanyValidator,
  updateCompanyValidator,
  mongoIdValidator,
};