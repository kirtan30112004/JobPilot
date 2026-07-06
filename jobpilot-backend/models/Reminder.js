const mongoose = require('mongoose');

const REMINDER_TYPES = ['Follow-Up', 'Deadline', 'Interview Prep', 'Document Submission', 'Other'];

const reminderSchema = new mongoose.Schema(
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
      required: false,
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Reminder title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: {
        values: REMINDER_TYPES,
        message: '{VALUE} is not a valid reminder type',
      },
      default: 'Follow-Up',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
  },
  {
    timestamps: true,
  }
);

reminderSchema.index({ user: 1, dueDate: 1 });
reminderSchema.index({ user: 1, isCompleted: 1 });

// Auto-set completedAt when isCompleted is set to true
reminderSchema.pre('save', function (next) {
  if (this.isModified('isCompleted')) {
    if (this.isCompleted && !this.completedAt) {
      this.completedAt = new Date();
    } else if (!this.isCompleted) {
      this.completedAt = null;
    }
  }
  next();
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
module.exports.REMINDER_TYPES = REMINDER_TYPES;