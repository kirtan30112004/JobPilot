import React from 'react'
import { SectionLoader } from './Loader'
import EmptyState from './EmptyState'
import Badge from './Badge'
import {
  BellIcon, EditIcon, TrashIcon, PlusIcon, CheckCircleIcon, CircleIcon,
  BriefcaseIcon, ClockIcon,
} from './icons'
import { REMINDER_TYPE_COLORS, PRIORITY_COLORS } from '../utils/constants'
import { formatDate, isOverdue, isUpcoming } from '../utils/format'

/**
 * CompleteToggle — shared circle/check toggle button, used by both
 * the desktop table row and the mobile card.
 */
function CompleteToggle({ reminder, onToggleComplete, isToggling, size = 19 }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggleComplete(reminder) }}
      disabled={isToggling}
      className={`transition-colors disabled:opacity-50 shrink-0 ${
        reminder.isCompleted ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-emerald-400'
      }`}
      aria-label={reminder.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      title={reminder.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {reminder.isCompleted ? <CheckCircleIcon width={size} height={size} /> : <CircleIcon width={size} height={size} />}
    </button>
  )
}

/**
 * RowActions — shared edit/delete action buttons, used by both the
 * desktop table row and the mobile card.
 */
function RowActions({ reminder, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(reminder) }}
        className="p-2 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-slate-800 transition-colors"
        aria-label="Edit reminder"
        title="Edit"
      >
        <EditIcon width={15} height={15} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(reminder) }}
        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
        aria-label="Delete reminder"
        title="Delete"
      >
        <TrashIcon width={15} height={15} />
      </button>
    </div>
  )
}

/**
 * DueBadges — overdue / due-soon notification pills, shared by both
 * the desktop table row and the mobile card.
 */
function DueBadges({ overdue, dueSoon }) {
  if (!overdue && !dueSoon) return null

  return (
    <>
      {overdue && <Badge label="Overdue" colors={{ text: 'text-rose-300', bg: 'bg-rose-500/15' }} dot />}
      {dueSoon && <Badge label="Due soon" colors={{ text: 'text-amber-300', bg: 'bg-amber-500/15' }} dot />}
    </>
  )
}

/**
 * ReminderCard — mobile-only stacked card representation of a single
 * reminder row. Shown below `sm` (640px) instead of the table, since
 * a horizontally-scrolling table is a poor fit for narrow phone
 * viewports — every field the table would hide at small widths
 * (linked application, type, priority) is instead given its own line
 * here, fully visible without scrolling.
 */
function ReminderCard({ reminder, onEdit, onDelete, onToggleComplete, isToggling }) {
  const overdue = !reminder.isCompleted && isOverdue(reminder.dueDate)
  const dueSoon = !reminder.isCompleted && !overdue && isUpcoming(reminder.dueDate, 3)

  return (
    <div
      onClick={() => onEdit(reminder)}
      className={`p-4 active:bg-slate-800/40 transition-colors cursor-pointer ${reminder.isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="pt-0.5">
            <CompleteToggle reminder={reminder} onToggleComplete={onToggleComplete} isToggling={isToggling} />
          </div>
          <div className="min-w-0">
            <p className={`font-semibold truncate ${reminder.isCompleted ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
              {reminder.title}
            </p>
            {reminder.description && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{reminder.description}</p>
            )}
          </div>
        </div>
        <RowActions reminder={reminder} onEdit={onEdit} onDelete={onDelete} />
      </div>

      {reminder.job && (
        <div className="flex items-center gap-1.5 mb-2.5 pl-8">
          <BriefcaseIcon width={13} height={13} className="text-slate-500 shrink-0" />
          <p className="text-xs text-slate-400 truncate">
            {reminder.job.jobTitle} · {reminder.job.companyName}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-8">
        <span className={`flex items-center gap-1.5 text-xs whitespace-nowrap ${overdue ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
          <ClockIcon width={13} height={13} className="shrink-0" />
          {formatDate(reminder.dueDate)}
        </span>
        <DueBadges overdue={overdue} dueSoon={dueSoon} />
        <Badge label={reminder.type} colors={REMINDER_TYPE_COLORS[reminder.type]} />
        <Badge label={reminder.priority} colors={PRIORITY_COLORS[reminder.priority]} />
      </div>
    </div>
  )
}

/**
 * RemindersTable — responsive list of follow-up & deadline reminders.
 *
 * Layout strategy:
 *  - Mobile  (< sm, < 640px): stacked cards (`ReminderCard`) — the
 *    complete toggle, title, linked application, type, due date with
 *    overdue/due-soon badges, and priority all get their own visible
 *    space, no horizontal scrolling required.
 *  - Tablet  (sm – lg, 640–1023px): table with linked Application
 *    visible from `sm`; Type reappears at `md`.
 *  - Desktop (lg+): full table, Priority column also visible.
 *
 * @param {Array} data - array of reminder objects (with optional populated `job`)
 * @param {boolean} isLoading
 * @param {Function} onEdit - called with the row's reminder object
 * @param {Function} onDelete - called with the row's reminder object
 * @param {Function} onToggleComplete - called with the row's reminder object
 * @param {string|null} togglingId - id of a reminder currently being toggled (disables checkbox)
 * @param {Object} emptyAction - { hasActiveFilters, onCreate }
 */
function RemindersTable({ data, isLoading, onEdit, onDelete, onToggleComplete, togglingId, emptyAction }) {
  if (isLoading) {
    return (
      <div className="glass-card">
        <SectionLoader message="Loading reminders..." />
      </div>
    )
  }

  if (!data || data.length === 0) {
    const { hasActiveFilters, onCreate } = emptyAction || {}

    return (
      <div className="glass-card">
        <EmptyState
          icon={<BellIcon width={28} height={28} />}
          title={hasActiveFilters ? 'No matching reminders' : 'No reminders yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your filters to find what you’re looking for.'
              : 'Set follow-up and deadline reminders so nothing slips through the cracks.'
          }
          action={
            !hasActiveFilters && onCreate && (
              <button onClick={onCreate} className="btn-primary">
                <PlusIcon />
                Add reminder
              </button>
            )
          }
        />
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* ── Mobile card list (< sm) ──────────────────────────── */}
      <div className="sm:hidden divide-y divide-slate-800/60">
        {data.map((reminder) => (
          <ReminderCard
            key={reminder._id}
            reminder={reminder}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
            isToggling={togglingId === reminder._id}
          />
        ))}
      </div>

      {/* ── Table (sm and up) ────────────────────────────────── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="px-4 py-3 w-10"></th>
              <th className="text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Reminder</th>
              <th className="hidden sm:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Application</th>
              <th className="hidden md:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Type</th>
              <th className="text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Due</th>
              <th className="hidden lg:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Priority</th>
              <th className="text-right px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.map((reminder) => {
              const overdue = !reminder.isCompleted && isOverdue(reminder.dueDate)
              const dueSoon = !reminder.isCompleted && !overdue && isUpcoming(reminder.dueDate, 3)

              return (
                <tr
                  key={reminder._id}
                  className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${reminder.isCompleted ? 'opacity-60' : ''}`}
                  onClick={() => onEdit(reminder)}
                >
                  {/* Complete toggle */}
                  <td className="px-4 py-3.5 align-middle">
                    <CompleteToggle
                      reminder={reminder}
                      onToggleComplete={onToggleComplete}
                      isToggling={togglingId === reminder._id}
                    />
                  </td>

                  {/* Title + description */}
                  <td className="px-4 py-3.5 align-middle">
                    <div className="min-w-0 max-w-[220px]">
                      <p className={`font-semibold truncate ${reminder.isCompleted ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                        {reminder.title}
                      </p>
                      {reminder.description && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{reminder.description}</p>
                      )}
                    </div>
                  </td>

                  {/* Linked job */}
                  <td className="hidden sm:table-cell px-4 py-3.5 align-middle">
                    {reminder.job ? (
                      <div className="min-w-0 max-w-[180px] flex items-center gap-1.5">
                        <BriefcaseIcon width={13} height={13} className="text-slate-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-300 truncate">{reminder.job.jobTitle}</p>
                          <p className="text-2xs text-slate-500 truncate">{reminder.job.companyName}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Type */}
                  <td className="hidden md:table-cell px-4 py-3.5 align-middle">
                    <Badge label={reminder.type} colors={REMINDER_TYPE_COLORS[reminder.type]} />
                  </td>

                  {/* Due date — with overdue / due-soon notification badges */}
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 text-xs whitespace-nowrap ${overdue ? 'text-rose-400 font-semibold' : 'text-slate-300'}`}>
                        <ClockIcon width={13} height={13} className="shrink-0" />
                        {formatDate(reminder.dueDate)}
                      </span>
                      <DueBadges overdue={overdue} dueSoon={dueSoon} />
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="hidden lg:table-cell px-4 py-3.5 align-middle">
                    <Badge label={reminder.priority} colors={PRIORITY_COLORS[reminder.priority]} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <RowActions reminder={reminder} onEdit={onEdit} onDelete={onDelete} />
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

export default RemindersTable