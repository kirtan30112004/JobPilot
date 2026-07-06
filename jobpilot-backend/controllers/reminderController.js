const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const Reminder = require('../models/Reminder');
const Job = require('../models/Job');

/**
 * @desc    Create a new reminder
 * @route   POST /api/reminders
 * @access  Private
 */
const createReminder = asyncHandler(async (req, res) => {
  const { title, description, type, dueDate, job, priority } = req.body;

  // If job is provided, verify it belongs to the user
  if (job) {
    const jobDoc = await Job.findOne({ _id: job, user: req.user._id });
    if (!jobDoc) {
      res.status(404);
      throw new Error('Job not found');
    }
  }

  const reminder = await Reminder.create({
    user: req.user._id,
    title,
    description,
    type,
    dueDate,
    job: job || null,
    priority,
  });

  res.status(201).json({
    success: true,
    message: 'Reminder created successfully',
    data: { reminder },
  });
});

/**
 * @desc    Get all reminders for logged-in user
 * @route   GET /api/reminders
 * @access  Private
 *
 * Query params:
 *  - isCompleted: true/false
 *  - type: filter by reminder type
 *  - job: filter by job ID
 *  - overdue: true - only overdue, incomplete reminders
 *  - upcoming: number of days - reminders due within next N days
 *  - page, limit: pagination
 */
const getReminders = asyncHandler(async (req, res) => {
  const { isCompleted, type, job, overdue, upcoming, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };

  if (isCompleted !== undefined) {
    query.isCompleted = isCompleted === 'true';
  }

  if (type) {
    query.type = type;
  }

  if (job) {
    query.job = job;
  }

  if (overdue === 'true') {
    query.dueDate = { $lt: new Date() };
    query.isCompleted = false;
  }

  if (upcoming) {
    const days = parseInt(upcoming, 10);
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    query.dueDate = { $gte: now, $lte: futureDate };
    query.isCompleted = false;
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [reminders, total] = await Promise.all([
    Reminder.find(query)
      .populate('job', 'jobTitle companyName status')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limitNum),
    Reminder.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: reminders.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: { reminders },
  });
});

/**
 * @desc    Get single reminder by ID
 * @route   GET /api/reminders/:id
 * @access  Private
 */
const getReminderById = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate('job', 'jobTitle companyName status');

  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  res.status(200).json({
    success: true,
    data: { reminder },
  });
});

/**
 * @desc    Update reminder
 * @route   PUT /api/reminders/:id
 * @access  Private
 */
const updateReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  // If job is being updated, verify it belongs to the user
  if (req.body.job) {
    const jobDoc = await Job.findOne({ _id: req.body.job, user: req.user._id });
    if (!jobDoc) {
      res.status(404);
      throw new Error('Job not found');
    }
  }

  const allowedFields = ['title', 'description', 'type', 'dueDate', 'job', 'isCompleted', 'priority'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      reminder[field] = req.body[field];
    }
  });

  await reminder.save();

  res.status(200).json({
    success: true,
    message: 'Reminder updated successfully',
    data: { reminder },
  });
});

/**
 * @desc    Mark reminder as complete/incomplete
 * @route   PATCH /api/reminders/:id/complete
 * @access  Private
 */
const toggleComplete = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  reminder.isCompleted = !reminder.isCompleted;
  await reminder.save();

  res.status(200).json({
    success: true,
    message: `Reminder marked as ${reminder.isCompleted ? 'completed' : 'incomplete'}`,
    data: { reminder },
  });
});

/**
 * @desc    Delete reminder
 * @route   DELETE /api/reminders/:id
 * @access  Private
 */
const deleteReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  await reminder.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Reminder deleted successfully',
    data: {},
  });
});

module.exports = {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  toggleComplete,
  deleteReminder,
};