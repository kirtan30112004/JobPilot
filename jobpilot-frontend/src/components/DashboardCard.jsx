import React from 'react'

/**
 * DashboardCard — single metric card for the dashboard stats grid.
 *
 * @param {string} label       - small uppercase label (e.g. "Total Applications")
 * @param {number|string} value - the headline number
 * @param {ReactNode} icon      - icon element rendered inside a colored badge
 * @param {string} colorClass   - tailwind text color class for value + icon
 * @param {string} bgClass      - tailwind bg color class for the icon badge
 * @param {string} subtext      - optional helper text below the value
 * @param {boolean} isLoading   - shows a skeleton placeholder when true
 */
function DashboardCard({
  label,
  value,
  icon,
  colorClass = 'text-violet-400',
  bgClass = 'bg-violet-500/15',
  subtext,
  isLoading = false,
}) {
  return (
    <div className="glass-card p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bgClass} ${colorClass}`}>
            {icon}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-9 w-16 rounded-lg bg-slate-800 animate-pulse" />
      ) : (
        <p className={`font-display text-3xl font-bold leading-none ${colorClass}`}>
          {value}
        </p>
      )}

      {subtext && !isLoading && (
        <p className="text-xs text-slate-500 mt-2">{subtext}</p>
      )}
    </div>
  )
}

export default DashboardCard