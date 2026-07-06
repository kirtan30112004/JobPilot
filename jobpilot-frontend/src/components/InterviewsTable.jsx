import React from 'react'
import { SectionLoader } from './Loader'
import EmptyState from './EmptyState'
import Badge from './Badge'
import {
  CalendarIcon, EditIcon, TrashIcon, PlusIcon, ClockIcon,
  VideoIcon, MapPinIcon, PhoneIcon, StarIcon, BriefcaseIcon,
} from './Icons'
import { INTERVIEW_STATUS_COLORS } from '../utils/constants'
import { formatDateTime } from '../utils/format'

/**
 * Splits a "bg-x text-y" class string into { bg, text } for the Badge component.
 */
function splitColorClasses(classString = '') {
  const parts = classString.split(' ')
  const bg = parts.find((p) => p.startsWith('bg-')) || 'bg-slate-700'
  const text = parts.find((p) => p.startsWith('text-')) || 'text-slate-300'
  return { bg, text }
}

/** Returns the appropriate mode icon for an interview. */
function ModeIcon({ mode, ...rest }) {
  if (mode === 'Phone') return <PhoneIcon {...rest} />
  if (mode === 'In-Person') return <MapPinIcon {...rest} />
  return <VideoIcon {...rest} />
}

/**
 * InterviewsTable — responsive table of scheduled/completed interviews.
 *
 * @param {Array} data - array of interview objects (with populated `job`)
 * @param {boolean} isLoading
 * @param {Function} onEdit - called with the row's interview object
 * @param {Function} onDelete - called with the row's interview object
 * @param {Function} onStatusChange - (interview, newStatus) => void — quick status update
 * @param {Object} emptyAction - { hasActiveFilters, onCreate }
 */
function InterviewsTable({ data, isLoading, onEdit, onDelete, onStatusChange, emptyAction }) {
  if (isLoading) {
    return (
      <div className="glass-card">
        <SectionLoader message="Loading interviews..." />
      </div>
    )
  }

  if (!data || data.length === 0) {
    const { hasActiveFilters, onCreate } = emptyAction || {}

    return (
      <div className="glass-card">
        <EmptyState
          icon={<CalendarIcon width={28} height={28} />}
          title={hasActiveFilters ? 'No matching interviews' : 'No interviews scheduled'}
          description={
            hasActiveFilters
              ? 'Try adjusting your filters to find what you’re looking for.'
              : 'Schedule an interview to keep track of upcoming conversations and feedback.'
          }
          action={
            !hasActiveFilters && onCreate && (
              <button onClick={onCreate} className="btn-primary">
                <PlusIcon />
                Schedule interview
              </button>
            )
          }
        />
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Interview</th>
              <th className="hidden sm:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Application</th>
              <th className="text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Scheduled</th>
              <th className="hidden md:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Mode</th>
              <th className="hidden lg:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Rating</th>
              <th className="text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Status</th>
              <th className="text-right px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.map((interview) => {
              const statusColors = splitColorClasses(INTERVIEW_STATUS_COLORS[interview.status])

              return (
                <tr
                  key={interview._id}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => onEdit(interview)}
                >
                  {/* Title + Type */}
                  <td className="px-4 py-3.5 align-middle">
                    <div className="min-w-0 max-w-[200px]">
                      <p className="font-semibold text-slate-100 truncate">{interview.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{interview.type}</p>
                    </div>
                  </td>

                  {/* Linked job */}
                  <td className="hidden sm:table-cell px-4 py-3.5 align-middle">
                    {interview.job ? (
                      <div className="min-w-0 max-w-[180px] flex items-center gap-1.5">
                        <BriefcaseIcon width={13} height={13} className="text-slate-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-300 truncate">{interview.job.jobTitle}</p>
                          <p className="text-2xs text-slate-500 truncate">{interview.job.companyName}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Scheduled date */}
                  <td className="px-4 py-3.5 align-middle">
                    <span className="flex items-center gap-1.5 text-slate-300 text-xs whitespace-nowrap">
                      <ClockIcon width={13} height={13} className="text-slate-500 shrink-0" />
                      {formatDateTime(interview.scheduledDate)}
                    </span>
                    {interview.duration ? (
                      <p className="text-2xs text-slate-500 mt-0.5 ml-[19px]">{interview.duration} min</p>
                    ) : null}
                  </td>

                  {/* Mode */}
                  <td className="hidden md:table-cell px-4 py-3.5 align-middle">
                    <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <ModeIcon mode={interview.mode} width={13} height={13} className="shrink-0" />
                      {interview.mode || '—'}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="hidden lg:table-cell px-4 py-3.5 align-middle">
                    {interview.rating ? (
                      <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                        <StarIcon width={13} height={13} filled />
                        {interview.rating}/5
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Status — quick-change dropdown */}
                  <td className="px-4 py-3.5 align-middle">
                    <select
                      value={interview.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { e.stopPropagation(); onStatusChange(interview, e.target.value) }}
                      className={`text-2xs font-semibold uppercase tracking-wide rounded-full pl-2.5 pr-6 py-1 border-0 cursor-pointer appearance-none bg-no-repeat ${statusColors.bg} ${statusColors.text}`}
                      style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                        backgroundPosition: 'right 6px center',
                        backgroundSize: '9px 9px',
                      }}
                      aria-label="Update interview status"
                    >
                      {['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'].map((s) => (
                        <option key={s} value={s} className="bg-slate-800 text-slate-100">{s}</option>
                      ))}
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(interview) }}
                        className="p-2 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-slate-800 transition-colors"
                        aria-label="Edit interview"
                        title="Edit"
                      >
                        <EditIcon width={15} height={15} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(interview) }}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        aria-label="Delete interview"
                        title="Delete"
                      >
                        <TrashIcon width={15} height={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InterviewsTable