import React from 'react'
import { SectionLoader } from './Loader'
import EmptyState from './EmptyState'
import Badge from './Badge'
import {
  BuildingIcon, EditIcon, TrashIcon, ExternalLinkIcon, MapPinIcon, PlusIcon,
  EyeIcon, Users2Icon, BriefcaseIcon,
} from './icons'

/**
 * CompaniesTable — responsive table of companies.
 *
 * @param {Array} data - array of company objects (with optional jobsCount)
 * @param {boolean} isLoading
 * @param {Function} onView - called with the row's company object
 * @param {Function} onEdit - called with the row's company object
 * @param {Function} onDelete - called with the row's company object
 * @param {Object} emptyAction - { hasActiveFilters, onCreate }
 */
function CompaniesTable({ data, isLoading, onView, onEdit, onDelete, emptyAction }) {
  if (isLoading) {
    return (
      <div className="glass-card">
        <SectionLoader message="Loading companies..." />
      </div>
    )
  }

  if (!data || data.length === 0) {
    const { hasActiveFilters, onCreate } = emptyAction || {}

    return (
      <div className="glass-card">
        <EmptyState
          icon={<BuildingIcon width={28} height={28} />}
          title={hasActiveFilters ? 'No matching companies' : 'No companies yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search to find what you’re looking for.'
              : 'Add companies you’re interested in to keep recruiter contacts and notes organized.'
          }
          action={
            !hasActiveFilters && onCreate && (
              <button onClick={onCreate} className="btn-primary">
                <PlusIcon />
                Add company
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
              <th className="text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Company</th>
              <th className="hidden sm:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Industry</th>
              <th className="hidden md:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Location</th>
              <th className="hidden lg:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Size</th>
              <th className="hidden md:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Recruiters</th>
              <th className="hidden lg:table-cell text-left px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Applications</th>
              <th className="text-right px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.map((company) => (
              <tr
                key={company._id}
                className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => onView(company)}
              >
                {/* Name */}
                <td className="px-4 py-3.5 align-middle">
                  <div className="flex items-center gap-3 min-w-0 max-w-[240px]">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {company.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-100 truncate">{company.name}</p>
                      {company.website && (
                        <p className="text-xs text-slate-500 truncate">{company.website.replace(/^https?:\/\//, '')}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Industry */}
                <td className="hidden sm:table-cell px-4 py-3.5 align-middle">
                  {company.industry ? (
                    <span className="text-slate-300 text-xs">{company.industry}</span>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>

                {/* Location */}
                <td className="hidden md:table-cell px-4 py-3.5 align-middle">
                  {company.location ? (
                    <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <MapPinIcon width={13} height={13} className="shrink-0" />
                      <span className="truncate max-w-[160px]">{company.location}</span>
                    </span>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>

                {/* Size */}
                <td className="hidden lg:table-cell px-4 py-3.5 align-middle">
                  {company.size ? (
                    <Badge label={company.size} colors={{ bg: 'bg-slate-700', text: 'text-slate-300' }} />
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>

                {/* Recruiters count */}
                <td className="hidden md:table-cell px-4 py-3.5 align-middle">
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Users2Icon width={13} height={13} className="shrink-0" />
                    {company.recruiters?.length || 0}
                  </span>
                </td>

                {/* Jobs count */}
                <td className="hidden lg:table-cell px-4 py-3.5 align-middle">
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <BriefcaseIcon width={13} height={13} className="shrink-0" />
                    {company.jobsCount ?? 0}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 align-middle">
                  <div className="flex items-center justify-end gap-1">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        aria-label="Open company website"
                        title="Open website"
                      >
                        <ExternalLinkIcon width={15} height={15} />
                      </a>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onView(company) }}
                      className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      aria-label="View company"
                      title="View"
                    >
                      <EyeIcon width={15} height={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(company) }}
                      className="p-2 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-slate-800 transition-colors"
                      aria-label="Edit company"
                      title="Edit"
                    >
                      <EditIcon width={15} height={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(company) }}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      aria-label="Delete company"
                      title="Delete"
                    >
                      <TrashIcon width={15} height={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CompaniesTable