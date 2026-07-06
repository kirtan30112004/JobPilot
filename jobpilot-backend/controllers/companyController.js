const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const Company = require('../models/Company');
const Job = require('../models/Job');

/**
 * @desc    Create a new company
 * @route   POST /api/companies
 * @access  Private
 */
const createCompany = asyncHandler(async (req, res) => {
  const { name, website, industry, location, size, recruiters, notes } = req.body;

  // Check for duplicate (case-insensitive) company name for this user
  const existing = await Company.findOne({
    user: req.user._id,
    name: { $regex: `^${name.trim()}$`, $options: 'i' },
  });

  if (existing) {
    res.status(400);
    throw new Error('A company with this name already exists in your list');
  }

  const company = await Company.create({
    user: req.user._id,
    name,
    website,
    industry,
    location,
    size,
    recruiters,
    notes,
  });

  res.status(201).json({
    success: true,
    message: 'Company created successfully',
    data: { company },
  });
});

/**
 * @desc    Get all companies for logged-in user
 * @route   GET /api/companies
 * @access  Private
 */
const getCompanies = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [companies, total] = await Promise.all([
    Company.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Company.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: companies.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: { companies },
  });
});

/**
 * @desc    Get single company by ID
 * @route   GET /api/companies/:id
 * @access  Private
 */
const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  // Get associated jobs count
  const jobsCount = await Job.countDocuments({
    company: company._id,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: {
      company,
      jobsCount,
    },
  });
});

/**
 * @desc    Update company
 * @route   PUT /api/companies/:id
 * @access  Private
 */
const updateCompany = asyncHandler(async (req, res) => {
  let company = await Company.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  const allowedFields = ['name', 'website', 'industry', 'location', 'size', 'recruiters', 'notes'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      company[field] = req.body[field];
    }
  });

  await company.save();

  res.status(200).json({
    success: true,
    message: 'Company updated successfully',
    data: { company },
  });
});

/**
 * @desc    Delete company
 * @route   DELETE /api/companies/:id
 * @access  Private
 */
const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  // Unlink company from associated jobs (do not delete jobs)
  await Job.updateMany(
    { company: company._id, user: req.user._id },
    { $set: { company: null } }
  );

  await company.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Company deleted successfully',
    data: {},
  });
});

/**
 * @desc    Add a recruiter to a company
 * @route   POST /api/companies/:id/recruiters
 * @access  Private
 */
const addRecruiter = asyncHandler(async (req, res) => {
  const company = await Company.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  const { name, email, phone, linkedIn, designation } = req.body;

  company.recruiters.push({ name, email, phone, linkedIn, designation });
  await company.save();

  res.status(201).json({
    success: true,
    message: 'Recruiter added successfully',
    data: { company },
  });
});

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  addRecruiter,
};