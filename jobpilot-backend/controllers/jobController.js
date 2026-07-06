const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const Job = require('../models/Job');
const Company = require('../models/Company');
const Interview = require('../models/Interview');
const Reminder = require('../models/Reminder');

/**
 * @desc    Create a new job application
 * @route   POST /api/jobs
 * @access  Private
 */
const createJob = asyncHandler(async (req, res) => {
  const {
    company,
    companyName,
    jobTitle,
    jobDescription,
    jobUrl,
    location,
    jobType,
    salaryRange,
    status,
    appliedDate,
    priority,
    tags,
    notes,
  } = req.body;

  // If company ID is provided, verify it belongs to the user
  if (company) {
    const companyDoc = await Company.findOne({ _id: company, user: req.user._id });
    if (!companyDoc) {
      res.status(404);
      throw new Error('Referenced company not found');
    }
  }

  const job = await Job.create({
    user: req.user._id,
    company: company || null,
    companyName,
    jobTitle,
    jobDescription,
    jobUrl,
    location,
    jobType,
    salaryRange,
    status,
    appliedDate,
    priority,
    tags,
    notes,
  });

  res.status(201).json({
    success: true,
    message: 'Job application created successfully',
    data: { job },
  });
});

/**
 * @desc    Get all jobs for logged-in user with search, filter, pagination
 * @route   GET /api/jobs
 * @access  Private
 *
 * Query params:
 *  - search: text search across jobTitle, companyName, notes, tags
 *  - status: filter by status (can be array via status=Applied&status=Offer)
 *  - jobType: filter by job type
 *  - priority: filter by priority
 *  - company: filter by company ID
 *  - isArchived: filter archived jobs (true/false)
 *  - page, limit: pagination
 *  - sortBy, sortOrder: sorting
 */
const getJobs = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    jobType,
    priority,
    company,
    isArchived,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = { user: req.user._id };

  // Text search
  if (search) {
    query.$or = [
      { jobTitle: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  // Status filter (supports single value or array)
  if (status) {
    query.status = Array.isArray(status) ? { $in: status } : status;
  }

  // Job type filter
  if (jobType) {
    query.jobType = jobType;
  }

  // Priority filter
  if (priority) {
    query.priority = priority;
  }

  // Company filter
  if (company) {
    query.company = company;
  }

  // Archived filter (default: exclude archived)
  if (isArchived !== undefined) {
    query.isArchived = isArchived === 'true';
  } else {
    query.isArchived = false;
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortObj = { [sortBy]: sortDirection };

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('company', 'name website industry location')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Job.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: jobs.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: { jobs },
  });
});

/**
 * @desc    Get job statistics (count by status)
 * @route   GET /api/jobs/stats
 * @access  Private
 */
const getJobStats = asyncHandler(async (req, res) => {
  const stats = await Job.aggregate([
    { $match: { user: req.user._id, isArchived: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } },
  ]);

  const totalApplications = await Job.countDocuments({
    user: req.user._id,
    isArchived: false,
  });

  res.status(200).json({
    success: true,
    data: {
      total: totalApplications,
      byStatus: stats,
    },
  });
});

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Private
 */
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate('company', 'name website industry location size recruiters notes');

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Get related interviews and reminders
  const [interviews, reminders] = await Promise.all([
    Interview.find({ job: job._id, user: req.user._id }).sort({ scheduledDate: 1 }),
    Reminder.find({ job: job._id, user: req.user._id }).sort({ dueDate: 1 }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      job,
      interviews,
      reminders,
    },
  });
});

/**
 * @desc    Update job application
 * @route   PUT /api/jobs/:id
 * @access  Private
 */
const updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const allowedFields = [
    'company',
    'companyName',
    'jobTitle',
    'jobDescription',
    'jobUrl',
    'location',
    'jobType',
    'salaryRange',
    'appliedDate',
    'priority',
    'tags',
    'notes',
    'isArchived',
  ];

  // If company ID is provided, verify it belongs to the user
  if (req.body.company) {
    const companyDoc = await Company.findOne({ _id: req.body.company, user: req.user._id });
    if (!companyDoc) {
      res.status(404);
      throw new Error('Referenced company not found');
    }
  }

  // Handle status change separately to maintain history
  if (req.body.status && req.body.status !== job.status) {
    job.statusHistory.push({
      status: req.body.status,
      changedAt: new Date(),
      note: req.body.statusNote || '',
    });
    job.status = req.body.status;
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  });

  await job.save();

  res.status(200).json({
    success: true,
    message: 'Job updated successfully',
    data: { job },
  });
});

/**
 * @desc    Update job status only (with history tracking)
 * @route   PATCH /api/jobs/:id/status
 * @access  Private
 */
const updateJobStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const job = await Job.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  job.status = status;
  job.statusHistory.push({
    status,
    changedAt: new Date(),
    note: note || '',
  });

  await job.save();

  res.status(200).json({
    success: true,
    message: 'Job status updated successfully',
    data: { job },
  });
});

/**
 * @desc    Delete job application
 * @route   DELETE /api/jobs/:id
 * @access  Private
 */
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Cascade delete related interviews and reminders
  await Promise.all([
    Interview.deleteMany({ job: job._id, user: req.user._id }),
    Reminder.deleteMany({ job: job._id, user: req.user._id }),
  ]);

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Job and related records deleted successfully',
    data: {},
  });
});

module.exports = {
  createJob,
  getJobs,
  getJobStats,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob,
};