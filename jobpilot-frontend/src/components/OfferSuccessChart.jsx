import React, { useState, useEffect, useCallback } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import analyticsService from '../services/analyticsService'
import { SectionLoader } from './Loader'
import EmptyState from './EmptyState'
import { AwardIcon, AlertCircleIcon } from './Icons'

// ── Theme constants (mirror tailwind.config.js palette) ──────────
const OFFER_COLOR = '#10B981'    // emerald-500
const REJECTED_COLOR = '#F43F5E' // rose-500

/**
 * Custom dark-themed tooltip for the offers vs rejections pie chart.
 * `total` is captured via closure from the parent component.
 */
function OfferTooltip({ active, payload, total }) {
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
 * OfferSuccessChart — donut chart comparing offers received against
 * rejections, with the overall offer success rate shown as a center
 * label and supporting stat row.
 *
 * "Success Percentage" reflects `offerSuccessRate` from the API,
 * defined as (offers / total applications) * 100 — i.e. how many of
 * ALL applications resulted in an offer, not just decided ones.
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
 *   totalOffers: number,
 *   totalRejections: number,
 *   offerSuccessRate: number
 * }} [data]
 * @param {boolean} [isLoading]
 * @param {string} [error]
 */
function OfferSuccessChart({ data: dataProp, isLoading: isLoadingProp, error: errorProp }) {
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
      setError(err.message || 'Failed to load offer outcome data')
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

  const totalOffers = data?.totalOffers || 0
  const totalRejections = data?.totalRejections || 0
  const successRate = data?.offerSuccessRate ?? 0
  const decided = totalOffers + totalRejections

  const pieData = [
    { name: 'Offers', value: totalOffers, fill: OFFER_COLOR },
    { name: 'Rejections', value: totalRejections, fill: REJECTED_COLOR },
  ].filter((d) => d.value > 0)

  const renderTooltip = (props) => <OfferTooltip {...props} total={decided} />

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-sm font-bold text-white">Offer Outcomes</h3>
          <p className="text-xs text-slate-500 mt-0.5">Offers received vs. rejections</p>
        </div>
        <AwardIcon className="text-slate-500" width={18} height={18} />
      </div>

      {isLoading ? (
        <SectionLoader message="Loading offer outcomes..." />
      ) : error ? (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-rose-400 mt-0.5 shrink-0">
            <AlertCircleIcon width={14} height={14} />
          </span>
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      ) : decided === 0 ? (
        <EmptyState
          icon={<AwardIcon width={26} height={26} />}
          title="No decisions yet"
          description="Once applications result in an offer or rejection, the breakdown will appear here."
        />
      ) : (
        <>
          {/* Donut with centered success-rate label */}
          <div className="relative h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="62%"
                  outerRadius="85%"
                  paddingAngle={pieData.length > 1 ? 2 : 0}
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="font-display text-3xl font-bold text-emerald-400 leading-none">
                {successRate}%
              </p>
              <p className="text-2xs text-slate-500 mt-1 uppercase tracking-wider">Success rate</p>
            </div>
          </div>

          {/* Legend / stat row */}
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: OFFER_COLOR }} />
              <span className="text-xs text-slate-400">
                Offers: <span className="font-semibold text-slate-200">{totalOffers}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: REJECTED_COLOR }} />
              <span className="text-xs text-slate-400">
                Rejections: <span className="font-semibold text-slate-200">{totalRejections}</span>
              </span>
            </div>
          </div>

          <p className="text-2xs text-slate-600 text-center mt-3 pt-3 border-t border-slate-800/60">
            Success rate is calculated against all applications submitted, not just decided ones.
          </p>
        </>
      )}
    </div>
  )
}

export default OfferSuccessChart