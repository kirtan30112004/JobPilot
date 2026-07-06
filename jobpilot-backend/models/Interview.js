const mongoose = require('mongoose');

const INTERVIEW_TYPES = [
  'Phone Screen',
  'Technical',
  'HR',
  'Behavioral',
  'System Design',
  'Coding Challenge',
  'Onsite',
  'Final Round',
  'Other',
];

const INTERVIEW_STATUSES = [
  'Scheduled',
  'Completed',
  'Cancelled',
  'Rescheduled',
  'No Show',
];

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Interview must be linked to a job'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Interview title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    type: {
      type: String,
      enum: {
        values: INTERVIEW_TYPES,
        message: '{VALUE} is not a valid interview type',
      },
      default: 'Other',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    duration: {
      type: Number, // in minutes
      min: [0, 'Duration cannot be negative'],
      default: 60,
    },
    mode: {
      type: String,
      enum: {
        values: ['Online', 'In-Person', 'Phone', ''],
        message: '{VALUE} is not a valid mode',
      },
      default: 'Online',
    },
    location: {
      type: String,
      trim: true,
      default: '',
      maxlength: [255, 'Location cannot exceed 255 characters'],
    },
    interviewers: {
      type: [
        {
          name: { type: String, trim: true, maxlength: 100 },
          designation: { type: String, trim: true, maxlength: 100 },
          email: { type: String, trim: true, lowercase: true },
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: INTERVIEW_STATUSES,
        message: '{VALUE} is not a valid interview status',
      },
      default: 'Scheduled',
      index: true,
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
      maxlength: [3000, 'Feedback cannot exceed 3000 characters'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: null,
    },
    preparationNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [3000, 'Preparation notes cannot exceed 3000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ user: 1, scheduledDate: 1 });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
module.exports.INTERVIEW_TYPES = INTERVIEW_TYPES;
module.exports.INTERVIEW_STATUSES = INTERVIEW_STATUSES;