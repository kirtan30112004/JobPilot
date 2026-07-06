const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Recruiter name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid recruiter email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters'],
    },
  },
  { _id: false }
);

const companySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    website: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, 'Industry cannot exceed 100 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },
    size: {
      type: String,
      enum: {
        values: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+', ''],
        message: '{VALUE} is not a valid company size',
      },
      default: '',
    },
    recruiters: {
      type: [recruiterSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate company names per user (case-insensitive handled at controller level)
companySchema.index({ user: 1, name: 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;