// ── Job ──────────────────────────────────────────────────────
export const JOB_STATUSES = [
  'Applied',
  'Screening',
  'Interviewing',
  'Technical Round',
  'HR Round',
  'Offer',
  'Rejected',
]

// NOTE: flat "bg-x text-y" strings — consumed via splitColorClasses()
// in ApplicationsTable.jsx, which calls .split(' ') on these values.
export const JOB_STATUS_COLORS = {
  'Applied':          'bg-slate-500/15 text-slate-300',
  'Screening':        'bg-cyan-500/15 text-cyan-300',
  'Interviewing':     'bg-violet-500/15 text-violet-300',
  'Technical Round':  'bg-violet-500/15 text-violet-300',
  'HR Round':         'bg-amber-500/15 text-amber-300',
  'Offer':            'bg-emerald-500/15 text-emerald-300',
  'Rejected':         'bg-rose-500/15 text-rose-300',
}

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Hybrid']

export const PRIORITIES = ['Low', 'Medium', 'High']

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR']

// NOTE: { text, bg } objects — passed directly as the `colors` prop to
// <Badge> in RemindersTable.jsx (no splitColorClasses involved there).
export const PRIORITY_COLORS = {
  Low:    { text: 'text-slate-400',  bg: 'bg-slate-500/15'  },
  Medium: { text: 'text-amber-300',  bg: 'bg-amber-500/15'  },
  High:   { text: 'text-rose-300',   bg: 'bg-rose-500/15'   },
}

// ── Company ──────────────────────────────────────────────────
export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+']

// ── Interview ────────────────────────────────────────────────
export const INTERVIEW_TYPES = [
  'Phone Screen',
  'Technical',
  'HR',
  'Behavioral',
  'System Design',
  'Coding Challenge',
  'Onsite',
  'Final Round',
  'Other',
]

export const INTERVIEW_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No Show']

// NOTE: flat "bg-x text-y" strings — consumed via splitColorClasses()
// in InterviewsTable.jsx, which calls .split(' ') on these values.
export const INTERVIEW_STATUS_COLORS = {
  'Scheduled':    'bg-violet-500/15 text-violet-300',
  'Completed':    'bg-emerald-500/15 text-emerald-300',
  'Cancelled':    'bg-rose-500/15 text-rose-300',
  'Rescheduled':  'bg-amber-500/15 text-amber-300',
  'No Show':      'bg-slate-500/15 text-slate-400',
}

export const INTERVIEW_MODES = ['Online', 'In-Person', 'Phone']

// ── Reminder ─────────────────────────────────────────────────
export const REMINDER_TYPES = ['Follow-Up', 'Deadline', 'Interview Prep', 'Document Submission', 'Other']

// NOTE: { text, bg } objects — passed directly as the `colors` prop to
// <Badge> in RemindersTable.jsx (no splitColorClasses involved there).
export const REMINDER_TYPE_COLORS = {
  'Follow-Up':            { text: 'text-cyan-300',    bg: 'bg-cyan-500/15'    },
  'Deadline':             { text: 'text-rose-300',    bg: 'bg-rose-500/15'    },
  'Interview Prep':       { text: 'text-violet-300',  bg: 'bg-violet-500/15'  },
  'Document Submission':  { text: 'text-amber-300',   bg: 'bg-amber-500/15'   },
  'Other':                { text: 'text-slate-400',   bg: 'bg-slate-500/15'   },
}