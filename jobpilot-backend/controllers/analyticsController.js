const mongoose = require('mongoose');
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const Job = require('../models/Job');
const Interview = require('../models/Interview');

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Builds an ordered array of { year, month } objects for the last
 * `count` months, including the current month.
 * month is 1-indexed (1 = January) to match MongoDB's $month operator.
 */
const buildMonthRange = (count) => {
  const range = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    range.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  return range;
};

/**
 * Safely computes a percentage, returning 0 when the denominator is 0.
 * Result is rounded to 1 decimal place.
 */
const toPercent = (numerator, denominator) => {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
};

/**
 * @desc    Applications submitted per month (default: last 12 months)
 * @route   GET /api/analytics/applications-by-month
 * @access  Private
 *
 * Query params:
 *  - months: number of months to include (1-24, default 12)
 */
const getApplicationsByMonth = asyncHandler(async (req, res) => {
  let months = parseInt(req.query.months, 10);
  if (!Number.isInteger(months) || months < 1) months = 12;
  if (months > 24) months = 24;

  const monthRange = buildMonthRange(months);
  const earliest = monthRange[0];
  const startDate = new Date(earliest.year, earliest.month - 1, 1);

  const results = await Job.aggregate([
    {
      $match: {
        user: req.user._id,
        appliedDate: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$appliedDate' },
          month: { $month: '$appliedDate' },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // Build a lookup so we can fill in months with zero applications
  const countMap = new Map();
  results.forEach((r) => {
    countMap.set(`${r._id.year}-${r._id.month}`, r.count);
  });

  const data = monthRange.map(({ year, month }) => ({
    year,
    month,
    label: `${MONTH_LABELS[month - 1]} ${year}`,
    count: countMap.get(`${year}-${month}`) || 0,
  }));

  res.status(200).json({
    success: true,
    data,
  });
});

/**
 * @desc    Application counts grouped by current status
 * @route   GET /api/analytics/applications-by-status
 * @access  Private
 *
 * Query params:
 *  - includeArchived: 'true' to include archived applications (default: false)
 */
const getApplicationsByStatus = asyncHandler(async (req, res) => {
  const matchStage = { user: req.user._id };

  if (req.query.includeArchived !== 'true') {
    matchStage.isArchived = false;
  }

  const results = await Job.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  const total = results.reduce((sum, r) => sum + r.count, 0);

  res.status(200).json({
    success: true,
    data: {
      total,
      byStatus: results,
    },
  });
});

/**
 * @desc    Interview conversion rate and offer success rate
 * @route   GET /api/analytics/conversion-rates
 * @access  Private
 *
 * Definitions:
 *  - interviewConversionRate   = (applications with >=1 interview) / totalApplications * 100
 *  - offerSuccessRate          = (applications with status "Offer") / totalApplications * 100
 *  - offerRateAmongInterviewed = offers / applicationsWithInterviews * 100
 *  - rejectionRate             = (applications with status "Rejected") / totalApplications * 100
 */
const getConversionRates = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalApplications, statusCounts, interviewedJobsAgg] = await Promise.all([
    // Total non-archived applications
    Job.countDocuments({ user: userId, isArchived: false }),

    // Counts for Offer and Rejected statuses
    Job.aggregate([
      {
        $match: {
          user: userId,
          status: { $in: ['Offer', 'Rejected'] },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),

    // Distinct jobs that have at least one interview
    Interview.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$job' } },
      { $count: 'count' },
    ]),
  ]);

  const totalOffers = statusCounts.find((s) => s._id === 'Offer')?.count || 0;
  const totalRejections = statusCounts.find((s) => s._id === 'Rejected')?.count || 0;
  const applicationsWithInterviews = interviewedJobsAgg[0]?.count || 0;

  res.status(200).json({
    success: true,
    data: {
      totalApplications,
      applicationsWithInterviews,
      totalOffers,
      totalRejections,
      interviewConversionRate: toPercent(applicationsWithInterviews, totalApplications),
      offerSuccessRate: toPercent(totalOffers, totalApplications),
      offerRateAmongInterviewed: toPercent(totalOffers, applicationsWithInterviews),
      rejectionRate: toPercent(totalRejections, totalApplications),
    },
  });
});

/**
 * @desc    Application counts grouped by company, with per-status breakdown
 * @route   GET /api/analytics/company-wise
 * @access  Private
 *
 * Query params:
 *  - limit: max number of companies to return (1-50, default 10)
 *  - includeArchived: 'true' to include archived applications (default: false)
 */
const getCompanyWiseApplications = asyncHandler(async (req, res) => {
  let limit = parseInt(req.query.limit, 10);
  if (!Number.isInteger(limit) || limit < 1) limit = 10;
  if (limit > 50) limit = 50;

  const matchStage = { user: req.user._id };

  if (req.query.includeArchived !== 'true') {
    matchStage.isArchived = false;
  }

  const results = await Job.aggregate([
    { $match: matchStage },
    {
      // First group by company + status to get per-status sub-counts
      $group: {
        _id: { companyName: '$companyName', status: '$status' },
        count: { $sum: 1 },
      },
    },
    {
      // Then collapse into one document per company with a status breakdown
      $group: {
        _id: '$_id.companyName',
        total: { $sum: '$count' },
        byStatus: {
          $push: {
            status: '$_id.status',
            count: '$count',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        companyName: '$_id',
        total: 1,
        byStatus: 1,
      },
    },
    { $sort: { total: -1, companyName: 1 } },
    { $limit: limit },
  ]);

  res.status(200).json({
    success: true,
    count: results.length,
    data: results,
  });
});

/**
 * @desc    Combined analytics overview — bundles all dashboard metrics
 *          into a single response to minimize round-trips.
 * @route   GET /api/analytics/overview
 * @access  Private
 *
 * Query params:
 *  - months: months of history for the trend chart (1-24, default 6)
 *  - companyLimit: max companies in the breakdown (1-50, default 5)
 */
const getOverview = asyncHandler(async (req, res) => {
  let months = parseInt(req.query.months, 10);
  if (!Number.isInteger(months) || months < 1) months = 6;
  if (months > 24) months = 24;

  let companyLimit = parseInt(req.query.companyLimit, 10);
  if (!Number.isInteger(companyLimit) || companyLimit < 1) companyLimit = 5;
  if (companyLimit > 50) companyLimit = 50;

  const userId = req.user._id;
  const monthRange = buildMonthRange(months);
  const earliest = monthRange[0];
  const startDate = new Date(earliest.year, earliest.month - 1, 1);

  const [
    monthlyAgg,
    statusAgg,
    totalApplications,
    offerRejectAgg,
    interviewedJobsAgg,
    companyAgg,
  ] = await Promise.all([
    Job.aggregate([
      { $match: { user: userId, appliedDate: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$appliedDate' }, month: { $month: '$appliedDate' } },
          count: { $sum: 1 },
        },
      },
    ]),

    Job.aggregate([
      { $match: { user: userId, isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]),

    Job.countDocuments({ user: userId, isArchived: false }),

    Job.aggregate([
      { $match: { user: userId, status: { $in: ['Offer', 'Rejected'] } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    Interview.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$job' } },
      { $count: 'count' },
    ]),

    Job.aggregate([
      { $match: { user: userId, isArchived: false } },
      { $group: { _id: { companyName: '$companyName', status: '$status' }, count: { $sum: 1 } } },
      {
        $group: {
          _id: '$_id.companyName',
          total: { $sum: '$count' },
          byStatus: { $push: { status: '$_id.status', count: '$count' } },
        },
      },
      { $project: { _id: 0, companyName: '$_id', total: 1, byStatus: 1 } },
      { $sort: { total: -1, companyName: 1 } },
      { $limit: companyLimit },
    ]),
  ]);

  // Fill in zero-count months for the trend chart
  const monthCountMap = new Map();
  monthlyAgg.forEach((r) => {
    monthCountMap.set(`${r._id.year}-${r._id.month}`, r.count);
  });

  const applicationsByMonth = monthRange.map(({ year, month }) => ({
    year,
    month,
    label: `${MONTH_LABELS[month - 1]} ${year}`,
    count: monthCountMap.get(`${year}-${month}`) || 0,
  }));

  const totalOffers = offerRejectAgg.find((s) => s._id === 'Offer')?.count || 0;
  const totalRejections = offerRejectAgg.find((s) => s._id === 'Rejected')?.count || 0;
  const applicationsWithInterviews = interviewedJobsAgg[0]?.count || 0;

  res.status(200).json({
    success: true,
    data: {
      applicationsByMonth,
      applicationsByStatus: {
        total: totalApplications,
        byStatus: statusAgg,
      },
      conversionRates: {
        totalApplications,
        applicationsWithInterviews,
        totalOffers,
        totalRejections,
        interviewConversionRate: toPercent(applicationsWithInterviews, totalApplications),
        offerSuccessRate: toPercent(totalOffers, totalApplications),
        offerRateAmongInterviewed: toPercent(totalOffers, applicationsWithInterviews),
        rejectionRate: toPercent(totalRejections, totalApplications),
      },
      companyWise: companyAgg,
    },
  });
});

module.exports = {
  getApplicationsByMonth,
  getApplicationsByStatus,
  getConversionRates,
  getCompanyWiseApplications,
  getOverview,
};