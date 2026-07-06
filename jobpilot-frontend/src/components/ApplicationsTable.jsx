import React from 'react'
import { SectionLoader } from './Loader'
import EmptyState from './EmptyState'
import Badge from './Badge'
import {
  BriefcaseIcon, EditIcon, TrashIcon, ExternalLinkIcon, MapPinIcon, PlusIcon,
} from './icons'
import { JOB_STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants'
import { formatDate, formatSalary } from '../utils/format'

/**
 * Splits a "bg-x text-y" class string into { bg, text } for the Badge component.
 */
function splitColorClasses(classString = '') {
  const parts = classString.split(' ')
  const bg = parts.find((p) => p.startsWith('bg-')) || 'bg-slate-700'
  const text = parts.find((p) => p.startsWith('text-')) || 'text-slate-300'
  return { bg, text }
}

/**
 * ApplicationsTable — responsive table of job applications.
 *
 * @param {Array} data - array of job objects
 * @param {boolean} isLoading
 * @param {Function} onEdit - called with the row's job object
 * @param {Function} onDelete - called with the row's job object
 * @param {Object} emptyAction - { hasActiveFilters, onCreate }
 */
function ApplicationsTable({ data, isLoading, onEdit, onDelete, emptyAction }) {
  if (isLoading) {
    return (
      <div className="glass-card">
        <SectionLoader message="Loading applications..." />
      </div>
    )
  }

  if (!data || data.length === 0) {
    const { hasActiveFilters, onCreate } = emptyAction || {}

    return (
      <div className="glass-card">
        <EmptyState
          icon={<BriefcaseIcon width={28} height={28} />}
          title={hasActiveFilters ? 'No matching applications' : 'No applications yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search or filters to find what you’re looking for.'
              : 'Start tracking your job search by adding your first application.'
          }
          action={
            !hasActiveFilters && onCreate && (
              <button onClick={onCreate} className="btn-primary">
                <PlusIcon />
                Add application
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
              <th className="text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Role</th>
              <th className="text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Status</th>
              <th className="hidden sm:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Priority</th>
              <th className="hidden md:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Location</th>
              <th className="hidden lg:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Salary</th>
              <th className="hidden md:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Applied</th>
              <th className="text-right px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.map((job) => {
              const statusColors   = splitColorClasses(JOB_STATUS_COLORS[job.status])
              const priorityColors = splitColorClasses(PRIORITY_COLORS[job.priority])

              return (
                <tr
                  key={job._id}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => onEdit(job)}
                >
                  {/* Role + Company */}
                  <td className="px-4 py-3.5 align-middle">
                    <div className="min-w-0 max-w-[220px]">
                      <p className="font-semibold text-slate-100 truncate">{job.jobTitle}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{job.companyName}</p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 align-middle">
                    <Badge label={job.status} colors={statusColors} />
                  </td>

                  {/* Priority */}
                  <td className="hidden sm:table-cell px-4 py-3.5 align-middle">
                    <Badge label={job.priority} colors={priorityColors} />
                  </td>

                  {/* Location */}
                  <td className="hidden md:table-cell px-4 py-3.5 align-middle">
                    {job.location ? (
                      <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <MapPinIcon width={13} height={13} className="shrink-0" />
                        <span className="truncate max-w-[140px]">{job.location}</span>
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Salary */}
                  <td className="hidden lg:table-cell px-4 py-3.5 align-middle">
                    <span className="text-slate-400 text-xs font-mono whitespace-nowrap">
                      {formatSalary(job.salaryRange?.min, job.salaryRange?.max, job.salaryRange?.currency)}
                    </span>
                  </td>

                  {/* Applied date */}
                  <td className="hidden md:table-cell px-4 py-3.5 align-middle">
                    <span className="text-slate-400 text-xs whitespace-nowrap">{formatDate(job.appliedDate)}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center justify-end gap-1">
                      {job.jobUrl && (
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          aria-label="Open job posting"
                          title="Open job posting"
                        >
                          <ExternalLinkIcon width={15} height={15} />
                        </a>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(job) }}
                        className="p-2 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-slate-800 transition-colors"
                        aria-label="Edit application"
                        title="Edit"
                      >
                        <EditIcon width={15} height={15} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(job) }}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        aria-label="Delete application"
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

export default ApplicationsTable