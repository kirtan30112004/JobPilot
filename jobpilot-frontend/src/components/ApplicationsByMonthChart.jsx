import React, { useState, useEffect, useCallback } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import analyticsService from '../services/analyticsService'
import { SectionLoader } from './Loader'
import EmptyState from './EmptyState'
import { CalendarIcon, AlertCircleIcon, TrendingUpIcon, TrendingDownIcon } from './Icons'

// ── Theme constants (mirror tailwind.config.js palette) ────────
const LINE_COLOR = '#8B5CF6' // violet-500
const GRID_COLOR = '#1E293B' // slate-800
const AXIS_COLOR = '#64748B' // slate-500

/**
 * Custom dark-themed tooltip for the monthly trend line chart.
 */
function MonthTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const value = payload[0].value

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-card-hover">
      <p className="text-xs font-semibold text-slate-200">{label}</p>
      <p className="text-xs text-violet-300 mt-0.5">
        {value} application{value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

/**
 * ApplicationsByMonthChart — line chart of monthly application volume.
 *
 * Fetches data via analyticsService.getApplicationsByMonth(months) and
 * renders a responsive Recharts LineChart. Handles loading, error
 * (with retry), and empty (no applications yet) states.
 *
 * @param {number} [months=6] - number of months of history to display (1-24)
 */
function ApplicationsByMonthChart({ months = 6 }) {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await analyticsService.getApplicationsByMonth(months)
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load application trend')
    } finally {
      setIsLoading(false)
    }
  }, [months])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const total = data.reduce((sum, d) => sum + d.count, 0)

  // Trend indicator: compare the average of the first half of the
  // range to the average of the second half.
  let trend = null
  if (data.length >= 2) {
    const mid = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, mid)
    const secondHalf = data.slice(mid)
    const average = (arr) => arr.reduce((sum, d) => sum + d.count, 0) / arr.length

    const firstAvg = average(firstHalf)
    const secondAvg = average(secondHalf)

    if (firstAvg !== secondAvg) {
      trend = secondAvg > firstAvg ? 'up' : 'down'
    }
  }

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="font-display text-sm font-bold text-white">Application Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">Applications submitted per month</p>
        </div>

        {!isLoading && !error && total > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            {trend && (
              <span className={trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}>
                {trend === 'up' ? (
                  <TrendingUpIcon width={14} height={14} />
                ) : (
                  <TrendingDownIcon width={14} height={14} />
                )}
              </span>
            )}
            <span className="font-display text-lg font-bold text-white leading-none">{total}</span>
            <span className="text-2xs text-slate-500">total</span>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && <SectionLoader message="Loading application trend..." />}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex items-start gap-3 p-3 mt-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-rose-400 mt-0.5 shrink-0"><AlertCircleIcon width={14} height={14} /></span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-rose-300">{error}</p>
            <button
              onClick={fetchData}
              className="text-xs font-semibold text-rose-300 hover:text-rose-200 underline mt-1"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && total === 0 && (
        <EmptyState
          icon={<CalendarIcon width={28} height={28} />}
          title="No applications yet"
          description="Start tracking applications to see your monthly trend here."
        />
      )}

      {/* Chart */}
      {!isLoading && !error && total > 0 && (
        <div className="mt-4" style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis
                dataKey="label"
                stroke={AXIS_COLOR}
                tick={{ fill: AXIS_COLOR, fontSize: 11 }}
                axisLine={{ stroke: GRID_COLOR }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                stroke={AXIS_COLOR}
                tick={{ fill: AXIS_COLOR, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<MonthTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke={LINE_COLOR}
                strokeWidth={2.5}
                dot={{ r: 3, fill: LINE_COLOR, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: LINE_COLOR, stroke: '#0F172A', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default ApplicationsByMonthChart