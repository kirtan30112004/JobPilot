import React, { useState, useEffect, useCallback } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
} from 'recharts'
import analyticsService from '../services/analyticsService'
import { SectionLoader } from './Loader'
import EmptyState from './EmptyState'
import { TrendingUpIcon, AlertCircleIcon, BriefcaseIcon } from './Icons'

// ── Theme constants (mirror tailwind.config.js palette) ──────────
const GRID_COLOR = '#1E293B' // slate-800
const AXIS_COLOR = '#64748B' // slate-500
const TOTAL_COLOR = '#8B5CF6'      // violet-500
const INTERVIEWED_COLOR = '#22D3EE' // cyan-400

/**
 * Custom dark-themed tooltip for the conversion bar chart.
 */
function ConversionTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null

  const entry = payload[0]

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-card-hover">
      <p className="text-xs font-semibold text-slate-200">{entry.payload.name}</p>
      <p className="text-xs mt-0.5" style={{ color: entry.payload.fill }}>
        <span className="font-bold">{entry.value}</span> application{entry.value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

/**
 * InterviewConversionChart — bar chart comparing total applications
 * against applications that reached at least one interview, alongside
 * a prominent interview conversion rate stat.
 *
 * Can operate in two modes:
 *  1. Self-fetching (default) — calls analyticsService.getConversionRates()
 *     on mount.
 *  2. Controlled — pass `data` (shape matches getConversionRates() result)
 *     and optionally `isLoading` / `error` to render pre-fetched data
 *     without an internal request.
 *
 * @param {{
 *   totalApplications: number,
 *   applicationsWithInterviews: number,
 *   interviewConversionRate: number
 * }} [data]
 * @param {boolean} [isLoading]
 * @param {string} [error]
 */
function InterviewConversionChart({ data: dataProp, isLoading: isLoadingProp, error: errorProp }) {
  const isControlled = dataProp !== undefined

  const [data, setData] = useState(isControlled ? dataProp : null)
  const [isLoading, setIsLoading] = useState(isControlled ? Boolean(isLoadingProp) : true)
  const [error, setError] = useState(isControlled ? (errorProp || '') : '')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await analyticsService.getConversionRates()
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load interview conversion data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isControlled) {
      setData(dataProp)
      setIsLoading(Boolean(isLoadingProp))
      setError(errorProp || '')
      return
    }

    fetchData()
  }, [isControlled, dataProp, isLoadingProp, errorProp, fetchData])

  const totalApplications = data?.totalApplications || 0
  const applicationsWithInterviews = data?.applicationsWithInterviews || 0
  const conversionRate = data?.interviewConversionRate ?? 0

  const chartData = [
    { name: 'Total Applications', value: totalApplications, fill: TOTAL_COLOR },
    { name: 'Interviewed', value: applicationsWithInterviews, fill: INTERVIEWED_COLOR },
  ]

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="font-display text-sm font-bold text-white">Interview Conversion</h3>
          <p className="text-xs text-slate-500 mt-0.5">Applications that reached an interview</p>
        </div>

        {!isLoading && !error && totalApplications > 0 && (
          <div className="text-right shrink-0">
            <p className="font-display text-2xl font-bold text-cyan-400 leading-none">
              {conversionRate}%
            </p>
            <p className="text-2xs text-slate-500 mt-0.5">conversion rate</p>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && <SectionLoader message="Loading conversion data..." />}

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
      {!isLoading && !error && totalApplications === 0 && (
        <EmptyState
          icon={<BriefcaseIcon width={28} height={28} />}
          title="No applications yet"
          description="Add applications and schedule interviews to see your conversion rate."
        />
      )}

      {/* Chart */}
      {!isLoading && !error && totalApplications > 0 && (
        <div className="mt-4" style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis
                dataKey="name"
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
              <Tooltip content={<ConversionTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={72}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  fill="#E2E8F0"
                  fontSize={12}
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Supporting stat row */}
      {!isLoading && !error && totalApplications > 0 && (
        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-800/60">
          <TrendingUpIcon width={13} height={13} className="text-cyan-400" />
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-300">{applicationsWithInterviews}</span> of{' '}
            <span className="font-semibold text-slate-300">{totalApplications}</span> applications led to an interview
          </p>
        </div>
      )}
    </div>
  )
}

export default InterviewConversionChart