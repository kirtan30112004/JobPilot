import React, { useState, useEffect, useCallback } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
} from 'recharts'
import analyticsService from '../services/analyticsService'
import { SectionLoader } from './Loader'
import EmptyState from './EmptyState'
import { BuildingIcon, AlertCircleIcon } from './icons'

// ── Theme constants (mirror tailwind.config.js palette) ──────────
const GRID_COLOR = '#1E293B'  // slate-800
const AXIS_COLOR = '#64748B'  // slate-500
const BAR_COLOR = '#8B5CF6'   // violet-500

// ── Status color palette for tooltip breakdowns ───────────────────
const STATUS_COLOR_HEX = {
  Applied:           '#94A3B8', // slate-400
  Screening:         '#22D3EE', // cyan-400
  Interviewing:      '#8B5CF6', // violet-500
  'Technical Round': '#A78BFA', // violet-400
  'HR Round':        '#FBBF24', // amber-400
  Offer:             '#10B981', // emerald-500
  Rejected:          '#F43F5E', // rose-500
}

const MAX_NAME_LENGTH = 16

/** Truncates a company name for axis labels, preserving full name for tooltips. */
function truncateName(name, max = MAX_NAME_LENGTH) {
  if (!name) return ''
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

/**
 * Custom Y-axis tick — right-aligned, truncated company name.
 */
function CompanyAxisTick({ x, y, payload }) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill={AXIS_COLOR} fontSize={11}>
      {truncateName(payload.value)}
    </text>
  )
}

/**
 * Custom dark-themed tooltip — shows full company name, total count,
 * and a per-status breakdown.
 */
function CompanyTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null

  const row = payload[0].payload
  const byStatus = (row.byStatus || []).filter((s) => s.count > 0)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-card-hover max-w-[220px]">
      <p className="text-xs font-semibold text-slate-200 break-words">{row.companyName}</p>
      <p className="text-xs text-violet-300 mt-0.5">
        <span className="font-bold">{row.total}</span> application{row.total !== 1 ? 's' : ''}
      </p>

      {byStatus.length > 0 && (
        <ul className="mt-1.5 pt-1.5 border-t border-slate-700 space-y-0.5">
          {byStatus.map((s) => (
            <li key={s.status} className="flex items-center justify-between gap-3 text-2xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLOR_HEX[s.status] || '#64748B' }}
                />
                {s.status}
              </span>
              <span className="font-semibold text-slate-300">{s.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * CompanyApplicationsChart — horizontal bar chart of application
 * counts per company, sorted descending.
 *
 * Can operate in two modes:
 *  1. Self-fetching (default) — calls analyticsService.getCompanyWiseApplications()
 *     on mount and whenever `limit` / `includeArchived` change.
 *  2. Controlled — pass `data` (array from getCompanyWiseApplications) and
 *     optionally `isLoading` / `error` to render pre-fetched data without
 *     an internal request.
 *
 * @param {number} [limit=10] - max companies to display (1-50)
 * @param {boolean} [includeArchived=false] - include archived applications
 * @param {Array<{companyName: string, total: number, byStatus: Array<{status:string, count:number}>}>} [data]
 * @param {boolean} [isLoading]
 * @param {string} [error]
 */
function CompanyApplicationsChart({ limit = 10, includeArchived = false, data: dataProp, isLoading: isLoadingProp, error: errorProp }) {
  const isControlled = dataProp !== undefined

  const [data, setData] = useState(isControlled ? dataProp : [])
  const [isLoading, setIsLoading] = useState(isControlled ? Boolean(isLoadingProp) : true)
  const [error, setError] = useState(isControlled ? (errorProp || '') : '')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await analyticsService.getCompanyWiseApplications({ limit, includeArchived })
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load company breakdown')
    } finally {
      setIsLoading(false)
    }
  }, [limit, includeArchived])

  useEffect(() => {
    if (isControlled) {
      setData(dataProp)
      setIsLoading(Boolean(isLoadingProp))
      setError(errorProp || '')
      return
    }

    fetchData()
  }, [isControlled, dataProp, isLoadingProp, errorProp, fetchData])

  // Defensive sort — always show highest application count first,
  // regardless of the order the data arrives in.
  const sortedData = [...(data || [])].sort((a, b) => b.total - a.total)

  // Dynamic height so bars stay readable regardless of company count
  const chartHeight = Math.max(sortedData.length * 38, 180)

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-sm font-bold text-white">Applications by Company</h3>
          <p className="text-xs text-slate-500 mt-0.5">Where you've applied the most</p>
        </div>
        <BuildingIcon className="text-slate-500" width={18} height={18} />
      </div>

      {isLoading ? (
        <SectionLoader message="Loading company breakdown..." />
      ) : error ? (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-rose-400 mt-0.5 shrink-0">
            <AlertCircleIcon width={14} height={14} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-rose-300">{error}</p>
            {!isControlled && (
              <button
                onClick={fetchData}
                className="text-xs font-semibold text-rose-300 hover:text-rose-200 underline mt-1"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      ) : sortedData.length === 0 ? (
        <EmptyState
          icon={<BuildingIcon width={26} height={26} />}
          title="No applications yet"
          description="Add applications to see how they're distributed across companies."
        />
      ) : (
        <div style={{ width: '100%', height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
            >
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                stroke={AXIS_COLOR}
                tick={{ fill: AXIS_COLOR, fontSize: 11 }}
                axisLine={{ stroke: GRID_COLOR }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="companyName"
                width={100}
                axisLine={{ stroke: GRID_COLOR }}
                tickLine={false}
                tick={<CompanyAxisTick />}
              />
              <Tooltip content={<CompanyTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }} />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {sortedData.map((entry) => (
                  <Cell key={entry.companyName} fill={BAR_COLOR} />
                ))}
                <LabelList
                  dataKey="total"
                  position="right"
                  fill="#E2E8F0"
                  fontSize={11}
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default CompanyApplicationsChart