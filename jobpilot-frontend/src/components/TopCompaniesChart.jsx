import React, { useState, useEffect, useCallback } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
} from 'recharts'
import analyticsService from '../services/analyticsService'
import { SectionLoader } from './Loader'
import EmptyState from './EmptyState'
import { AwardIcon, AlertCircleIcon } from './icons'

const TOP_N = 5

// ── Theme constants (mirror tailwind.config.js palette) ──────────
const GRID_COLOR = '#1E293B' // slate-800
const AXIS_COLOR = '#64748B' // slate-500

// Distinct rank colors so the #1 company visually stands out,
// fading toward slate for lower ranks.
const RANK_COLORS = ['#8B5CF6', '#A78BFA', '#22D3EE', '#34D399', '#94A3B8']

/** Truncates a company name for X-axis tick labels. */
function truncateName(name, max = 12) {
  if (!name) return ''
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

/**
 * Custom X-axis tick — truncated company name, rotated slightly on
 * narrow charts isn't needed here since names are short; kept flat
 * for readability across breakpoints.
 */
function CompanyAxisTick({ x, y, payload }) {
  return (
    <text x={x} y={y} dy={12} textAnchor="middle" fill={AXIS_COLOR} fontSize={11}>
      {truncateName(payload.value)}
    </text>
  )
}

/**
 * Custom dark-themed tooltip showing the full company name, rank,
 * and application count.
 */
function TopCompanyTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null

  const row = payload[0].payload

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-card-hover max-w-[200px]">
      <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
        #{row.rank}
      </p>
      <p className="text-xs font-semibold text-slate-200 break-words mt-0.5">{row.companyName}</p>
      <p className="text-xs mt-1" style={{ color: row.fill }}>
        <span className="font-bold">{row.total}</span> application{row.total !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

/**
 * TopCompaniesChart — bar chart highlighting the top 5 companies by
 * application count, each labeled with its name and count.
 *
 * Can operate in two modes:
 *  1. Self-fetching (default) — calls
 *     analyticsService.getCompanyWiseApplications({ limit: 5 }) on mount
 *     and whenever `includeArchived` changes.
 *  2. Controlled — pass `data` (array of { companyName, total, byStatus },
 *     which may contain more than 5 entries — only the top 5 are
 *     rendered) and optionally `isLoading` / `error` to render
 *     pre-fetched data without an internal request.
 *
 * @param {boolean} [includeArchived=false] - include archived applications
 * @param {Array<{companyName: string, total: number}>} [data]
 * @param {boolean} [isLoading]
 * @param {string} [error]
 */
function TopCompaniesChart({ includeArchived = false, data: dataProp, isLoading: isLoadingProp, error: errorProp }) {
  const isControlled = dataProp !== undefined

  const [data, setData] = useState(isControlled ? dataProp : [])
  const [isLoading, setIsLoading] = useState(isControlled ? Boolean(isLoadingProp) : true)
  const [error, setError] = useState(isControlled ? (errorProp || '') : '')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      // Request exactly TOP_N from the backend — it already sorts by total desc
      const result = await analyticsService.getCompanyWiseApplications({
        limit: TOP_N,
        includeArchived,
      })
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load top companies')
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

  // Defensively sort and cap at TOP_N in case a controlled `data`
  // prop arrives unsorted or with more than 5 entries.
  const topCompanies = [...(data || [])]
    .sort((a, b) => b.total - a.total)
    .slice(0, TOP_N)
    .map((company, index) => ({
      ...company,
      rank: index + 1,
      fill: RANK_COLORS[index] || RANK_COLORS[RANK_COLORS.length - 1],
    }))

  const hasData = topCompanies.length > 0

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-sm font-bold text-white">Top 5 Companies</h3>
          <p className="text-xs text-slate-500 mt-0.5">Most applications submitted</p>
        </div>
        <AwardIcon className="text-slate-500" width={18} height={18} />
      </div>

      {isLoading ? (
        <SectionLoader message="Loading top companies..." />
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
      ) : !hasData ? (
        <EmptyState
          icon={<AwardIcon width={26} height={26} />}
          title="No companies yet"
          description="Add applications to see your top companies by volume."
        />
      ) : (
        <>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCompanies}
                margin={{ top: 24, right: 8, left: -16, bottom: 8 }}
                barCategoryGap="24%"
              >
                <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="companyName"
                  axisLine={{ stroke: GRID_COLOR }}
                  tickLine={false}
                  tick={<CompanyAxisTick />}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  stroke={AXIS_COLOR}
                  tick={{ fill: AXIS_COLOR, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<TopCompanyTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {topCompanies.map((entry) => (
                    <Cell key={entry.companyName} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="total"
                    position="top"
                    fill="#E2E8F0"
                    fontSize={12}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ranked list — reinforces the chart with explicit rank numbers */}
          <ul className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5">
            {topCompanies.map((company) => (
              <li key={company.companyName} className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center text-2xs font-bold text-slate-950 shrink-0"
                    style={{ backgroundColor: company.fill }}
                  >
                    {company.rank}
                  </span>
                  <span className="text-slate-300 truncate">{company.companyName}</span>
                </span>
                <span className="font-semibold text-slate-200 shrink-0">{company.total}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default TopCompaniesChart