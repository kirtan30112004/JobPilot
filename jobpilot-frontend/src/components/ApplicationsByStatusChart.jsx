import React, { useState, useEffect, useCallback } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import analyticsService from '../services/analyticsService'
import { SectionLoader } from './Loader'
import EmptyState from './EmptyState'
import { BriefcaseIcon, AlertCircleIcon } from './Icons'
import { JOB_STATUSES } from '../utils/constants'

// ── Status color palette (hex, for Recharts fill values) ────────
// Mirrors the Tailwind palette in tailwind.config.js so this chart
// stays visually consistent with status badges used elsewhere.
const STATUS_COLOR_HEX = {
  Applied:           '#94A3B8', // slate-400
  Screening:         '#22D3EE', // cyan-400
  Interviewing:      '#8B5CF6', // violet-500
  'Technical Round': '#A78BFA', // violet-400
  'HR Round':        '#FBBF24', // amber-400
  Offer:             '#10B981', // emerald-500
  Rejected:          '#F43F5E', // rose-500
}

const FALLBACK_COLOR = '#64748B' // slate-500

/**
 * Custom dark-themed tooltip for the status pie chart.
 * `total` is captured via closure from the parent component.
 */
function StatusTooltip({ active, payload, total }) {
  if (!active || !payload || !payload.length) return null

  const entry = payload[0]
  const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0'

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-card-hover">
      <p className="text-xs font-semibold text-slate-200">{entry.name}</p>
      <p className="text-xs mt-0.5" style={{ color: entry.payload.fill }}>
        <span className="font-bold">{entry.value}</span> ({pct}%)
      </p>
    </div>
  )
}

/**
 * ApplicationsByStatusChart — pie chart breaking down applications by
 * their current pipeline status (Applied, Screening, Interviewing,
 * Technical Round, HR Round, Offer, Rejected).
 *
 * Can operate in two modes:
 *  1. Self-fetching (default) — calls analyticsService.getApplicationsByStatus()
 *     on mount.
 *  2. Controlled — pass `data` (shape: { total, byStatus }) and optionally
 *     `isLoading` / `error` to render pre-fetched data without an
 *     internal request.
 *
 * @param {boolean} [includeArchived=false] - include archived applications (self-fetch mode only)
 * @param {{ total: number, byStatus: Array<{status: string, count: number}> }} [data]
 * @param {boolean} [isLoading]
 * @param {string} [error]
 */
function ApplicationsByStatusChart({ includeArchived = false, data: dataProp, isLoading: isLoadingProp, error: errorProp }) {
  const isControlled = dataProp !== undefined

  const [data, setData] = useState(isControlled ? dataProp : { total: 0, byStatus: [] })
  const [isLoading, setIsLoading] = useState(isControlled ? Boolean(isLoadingProp) : true)
  const [error, setError] = useState(isControlled ? (errorProp || '') : '')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await analyticsService.getApplicationsByStatus({ includeArchived })
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load status breakdown')
    } finally {
      setIsLoading(false)
    }
  }, [includeArchived])

  useEffect(() => {
    if (isControlled) {
      setData(dataProp)
      setIsLoading(Boolean(isLoadingProp))
      setError(errorProp || '')
      return
    }

    fetchData()
  }, [isControlled, dataProp, isLoadingProp, errorProp, fetchData])

  const total = data?.total || 0
  const byStatus = data?.byStatus || []

  // Lookup map for quick count access in the legend
  const countMap = new Map(byStatus.map((s) => [s.status, s.count]))

  // Pie only renders segments with count > 0
  const pieData = JOB_STATUSES
    .map((status) => ({
      status,
      count: countMap.get(status) || 0,
      fill: STATUS_COLOR_HEX[status] || FALLBACK_COLOR,
    }))
    .filter((d) => d.count > 0)

  const renderTooltip = (props) => <StatusTooltip {...props} total={total} />

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-sm font-bold text-white">Applications by Status</h3>
          <p className="text-xs text-slate-500 mt-0.5">Where your pipeline stands today</p>
        </div>
        <BriefcaseIcon className="text-slate-500" width={18} height={18} />
      </div>

      {isLoading ? (
        <SectionLoader message="Loading status breakdown..." />
      ) : error ? (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-rose-400 mt-0.5 shrink-0">
            <AlertCircleIcon width={14} height={14} />
          </span>
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={<BriefcaseIcon width={26} height={26} />}
          title="No applications yet"
          description="Add applications to see how your pipeline is distributed by status."
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Pie chart */}
          <div className="w-full sm:w-1/2 h-56 sm:h-64 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom legend — always lists all 7 statuses */}
          <ul className="w-full sm:w-1/2 space-y-2">
            {JOB_STATUSES.map((status) => {
              const count = countMap.get(status) || 0
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const color = STATUS_COLOR_HEX[status] || FALLBACK_COLOR

              return (
                <li key={status} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className={`truncate ${count > 0 ? 'text-slate-300' : 'text-slate-600'}`}>
                      {status}
                    </span>
                  </span>
                  <span className={`font-semibold shrink-0 ${count > 0 ? 'text-slate-200' : 'text-slate-600'}`}>
                    {count}
                    <span className="text-2xs text-slate-500 font-normal ml-1">({pct}%)</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ApplicationsByStatusChart