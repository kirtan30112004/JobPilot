const mongoose = require('mongoose');

const JOB_STATUSES = [
  'Applied',
  'Screening',
  'Interviewing',
  'Technical Round',
  'HR Round',
  'Offer',
  'Rejected',
];

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: false,
      default: null,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    jobDescription: {
      type: String,
      trim: true,
      default: '',
      maxlength: [5000, 'Job description cannot exceed 5000 characters'],
    },
    jobUrl: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
      default: '',
    },
    jobType: {
      type: String,
      enum: {
        values: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Hybrid', ''],
        message: '{VALUE} is not a valid job type',
      },
      default: '',
    },
    salaryRange: {
      min: {
        type: Number,
        min: [0, 'Minimum salary cannot be negative'],
        default: null,
      },
      max: {
        type: Number,
        min: [0, 'Maximum salary cannot be negative'],
        default: null,
      },
      currency: {
        type: String,
        trim: true,
        default: 'USD',
        maxlength: [10, 'Currency code cannot exceed 10 characters'],
      },
    },
    status: {
      type: String,
      enum: {
        values: JOB_STATUSES,
        message: '{VALUE} is not a valid job status',
      },
      default: 'Applied',
      index: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: JOB_STATUSES,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          trim: true,
          maxlength: [500, 'Status note cannot exceed 500 characters'],
          default: '',
        },
      },
    ],
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [3000, 'Notes cannot exceed 3000 characters'],
      default: '',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
jobSchema.index({
  jobTitle: 'text',
  companyName: 'text',
  notes: 'text',
  tags: 'text',
});

// Add initial status to history on creation
jobSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      note: 'Application created',
    });
  }
  next();
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
module.exports.JOB_STATUSES = JOB_STATUSES;