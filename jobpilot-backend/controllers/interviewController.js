const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const Interview = require('../models/Interview');
const Job = require('../models/Job');

/**
 * @desc    Schedule a new interview
 * @route   POST /api/interviews
 * @access  Private
 */
const createInterview = asyncHandler(async (req, res) => {
  const {
    job,
    title,
    type,
    scheduledDate,
    duration,
    mode,
    location,
    interviewers,
    status,
    preparationNotes,
  } = req.body;

  // Verify job belongs to user
  const jobDoc = await Job.findOne({ _id: job, user: req.user._id });
  if (!jobDoc) {
    res.status(404);
    throw new Error('Job not found');
  }

  const interview = await Interview.create({
    user: req.user._id,
    job,
    title,
    type,
    scheduledDate,
    duration,
    mode,
    location,
    interviewers,
    status,
    preparationNotes,
  });

  // Optionally update job status to "Interviewing" if currently "Applied" or "Screening"
  if (['Applied', 'Screening'].includes(jobDoc.status)) {
    jobDoc.status = 'Interviewing';
    jobDoc.statusHistory.push({
      status: 'Interviewing',
      changedAt: new Date(),
      note: `Interview scheduled: ${title}`,
    });
    await jobDoc.save();
  }

  res.status(201).json({
    success: true,
    message: 'Interview scheduled successfully',
    data: { interview },
  });
});

/**
 * @desc    Get all interviews for logged-in user
 * @route   GET /api/interviews
 * @access  Private
 *
 * Query params:
 *  - job: filter by job ID
 *  - status: filter by status
 *  - type: filter by interview type
 *  - upcoming: true/false - filter for upcoming interviews only
 *  - page, limit: pagination
 */
const getInterviews = asyncHandler(async (req, res) => {
  const { job, status, type, upcoming, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };

  if (job) {
    query.job = job;
  }

  if (status) {
    query.status = status;
  }

  if (type) {
    query.type = type;
  }

  if (upcoming === 'true') {
    query.scheduledDate = { $gte: new Date() };
    query.status = 'Scheduled';
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [interviews, total] = await Promise.all([
    Interview.find(query)
      .populate('job', 'jobTitle companyName status')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(limitNum),
    Interview.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: interviews.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: { interviews },
  });
});

/**
 * @desc    Get single interview by ID
 * @route   GET /api/interviews/:id
 * @access  Private
 */
const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate('job', 'jobTitle companyName status jobUrl');

  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  res.status(200).json({
    success: true,
    data: { interview },
  });
});

/**
 * @desc    Update interview details
 * @route   PUT /api/interviews/:id
 * @access  Private
 */
const updateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  const allowedFields = [
    'title',
    'type',
    'scheduledDate',
    'duration',
    'mode',
    'location',
    'interviewers',
    'status',
    'feedback',
    'rating',
    'preparationNotes',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      interview[field] = req.body[field];
    }
  });

  await interview.save();

  res.status(200).json({
    success: true,
    message: 'Interview updated successfully',
    data: { interview },
  });
});

/**
 * @desc    Update interview status
 * @route   PATCH /api/interviews/:id/status
 * @access  Private
 */
const updateInterviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const interview = await Interview.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  interview.status = status;
  await interview.save();

  res.status(200).json({
    success: true,
    message: 'Interview status updated successfully',
    data: { interview },
  });
});

/**
 * @desc    Add/update feedback and rating for an interview
 * @route   PATCH /api/interviews/:id/feedback
 * @access  Private
 */
const addFeedback = asyncHandler(async (req, res) => {
  const { feedback, rating } = req.body;

  const interview = await Interview.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  interview.feedback = feedback;
  if (rating !== undefined) {
    interview.rating = rating;
  }

  // Auto-mark as completed if feedback is added and status is still Scheduled
  if (interview.status === 'Scheduled') {
    interview.status = 'Completed';
  }

  await interview.save();

  res.status(200).json({
    success: true,
    message: 'Feedback added successfully',
    data: { interview },
  });
});

/**
 * @desc    Delete interview
 * @route   DELETE /api/interviews/:id
 * @access  Private
 */
const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  await interview.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Interview deleted successfully',
    data: {},
  });
});

module.exports = {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  updateInterviewStatus,
  addFeedback,
  deleteInterview,
};