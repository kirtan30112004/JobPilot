import React from 'react'
import { Link } from 'react-router-dom'
import { SectionLoader } from './Loader'

// ── Icons ────────────────────────────────────────────────────
function BriefcaseIcon(p) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <path d="M2 12h20"/>
    </svg>
  )
}
function CalendarIcon(p) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function BellIcon(p) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
function InboxIcon(p) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  )
}

// ── Status → color map (mirrors backend Job status enum) ──────
const STATUS_COLORS = {
  Applied:           'bg-slate-700 text-slate-300',
  Screening:         'bg-cyan-500/15 text-cyan-400',
  Interviewing:      'bg-violet-500/15 text-violet-400',
  'Technical Round': 'bg-violet-500/15 text-violet-400',
  'HR Round':        'bg-amber-500/15 text-amber-400',
  Offer:             'bg-emerald-500/15 text-emerald-400',
  Rejected:          'bg-rose-500/15 text-rose-400',
}

const INTERVIEW_STATUS_COLORS = {
  Scheduled:   'bg-violet-500/15 text-violet-400',
  Completed:   'bg-emerald-500/15 text-emerald-400',
  Cancelled:   'bg-rose-500/15 text-rose-400',
  Rescheduled: 'bg-amber-500/15 text-amber-400',
  'No Show':   'bg-rose-500/15 text-rose-400',
}

const PRIORITY_COLORS = {
  Low:    'bg-slate-700 text-slate-400',
  Medium: 'bg-amber-500/15 text-amber-400',
  High:   'bg-rose-500/15 text-rose-400',
}

// ── Helpers ────────────────────────────────────────────────────
function timeAgo(dateString) {
  if (!dateString) return ''
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function formatDateTime(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Badge({ label, className }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wide ${className}`}>
      {label}
    </span>
  )
}

// ── Section wrapper ────────────────────────────────────────────
function FeedSection({ title, icon, viewAllHref, children, isEmpty, emptyLabel }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <h3 className="font-display text-sm font-bold text-white">{title}</h3>
        </div>
        {viewAllHref && (
          <Link to={viewAllHref} className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors">
            View all
          </Link>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
          <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center mb-3 text-slate-500">
            <InboxIcon />
          </div>
          <p className="text-sm text-slate-500">{emptyLabel}</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-800/60">
          {children}
        </ul>
      )}
    </div>
  )
}

/**
 * RecentActivity — three-part feed showing recently updated job
 * applications, upcoming interviews, and active reminders.
 *
 * @param {Array} recentJobs        - jobs sorted by updatedAt desc
 * @param {Array} upcomingInterviews
 * @param {Array} upcomingReminders
 * @param {boolean} isLoading
 */
function RecentActivity({ recentJobs = [], upcomingInterviews = [], upcomingReminders = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card">
        <SectionLoader message="Loading recent activity..." />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ── Recently updated applications ────────────────── */}
      <FeedSection
        title="Recent Applications"
        icon={<BriefcaseIcon />}
        viewAllHref="/jobs"
        isEmpty={recentJobs.length === 0}
        emptyLabel="No applications yet"
      >
        {recentJobs.map((job) => (
          <li key={job._id} className="px-5 py-3.5 hover:bg-slate-800/30 transition-colors">
            <Link to="/jobs" className="flex items-start justify-between gap-3 group">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-violet-300 transition-colors">
                  {job.jobTitle}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{job.companyName}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge label={job.status} className={STATUS_COLORS[job.status] || 'bg-slate-700 text-slate-300'} />
                <span className="text-2xs text-slate-600">{timeAgo(job.updatedAt)}</span>
              </div>
            </Link>
          </li>
        ))}
      </FeedSection>

      {/* ── Upcoming interviews ──────────────────────────── */}
      <FeedSection
        title="Upcoming Interviews"
        icon={<CalendarIcon />}
        viewAllHref="/interviews"
        isEmpty={upcomingInterviews.length === 0}
        emptyLabel="No interviews scheduled"
      >
        {upcomingInterviews.map((interview) => (
          <li key={interview._id} className="px-5 py-3.5 hover:bg-slate-800/30 transition-colors">
            <Link to="/interviews" className="flex items-start justify-between gap-3 group">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-violet-300 transition-colors">
                  {interview.title}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {interview.job?.jobTitle} · {interview.job?.companyName}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge label={interview.status} className={INTERVIEW_STATUS_COLORS[interview.status] || 'bg-slate-700 text-slate-300'} />
                <span className="text-2xs text-slate-600">{formatDateTime(interview.scheduledDate)}</span>
              </div>
            </Link>
          </li>
        ))}
      </FeedSection>

      {/* ── Active reminders ─────────────────────────────── */}
      <FeedSection
        title="Reminders"
        icon={<BellIcon />}
        viewAllHref="/reminders"
        isEmpty={upcomingReminders.length === 0}
        emptyLabel="No active reminders"
      >
        {upcomingReminders.map((reminder) => (
          <li key={reminder._id} className="px-5 py-3.5 hover:bg-slate-800/30 transition-colors">
            <Link to="/reminders" className="flex items-start justify-between gap-3 group">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-violet-300 transition-colors">
                  {reminder.title}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {reminder.job ? `${reminder.job.jobTitle} · ${reminder.job.companyName}` : reminder.type}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge label={reminder.priority} className={PRIORITY_COLORS[reminder.priority] || 'bg-slate-700 text-slate-400'} />
                <span className="text-2xs text-slate-600">Due {formatDate(reminder.dueDate)}</span>
              </div>
            </Link>
          </li>
        ))}
      </FeedSection>
    </div>
  )
}

export default RecentActivity