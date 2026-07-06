const express = require('express');
const {
  getApplicationsByMonth,
  getApplicationsByStatus,
  getConversionRates,
  getCompanyWiseApplications,
  getOverview,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// @route   GET /api/analytics/overview
// @desc    Combined dashboard payload (trend, status, rates, top companies)
router.get('/overview', getOverview);

// @route   GET /api/analytics/applications-by-month
// @desc    Application counts per month (?months=1-24, default 12)
router.get('/applications-by-month', getApplicationsByMonth);

// @route   GET /api/analytics/applications-by-status
// @desc    Application counts grouped by status (?includeArchived=true|false)
router.get('/applications-by-status', getApplicationsByStatus);

// @route   GET /api/analytics/conversion-rates
// @desc    Interview conversion rate, offer success rate, rejection rate
router.get('/conversion-rates', getConversionRates);

// @route   GET /api/analytics/company-wise
// @desc    Application counts grouped by company (?limit=1-50, ?includeArchived=true|false)
router.get('/company-wise', getCompanyWiseApplications);

module.exports = router;