import React from 'react'
import DashboardCard from './DashboardCard'

// ── Icons ────────────────────────────────────────────────────
function BriefcaseIcon(p) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <path d="M2 12h20"/>
    </svg>
  )
}
function CalendarIcon(p) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function AwardIcon(p) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="8" r="7"/>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  )
}
function XCircleIcon(p) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  )
}

/**
 * StatsSection — top-of-dashboard grid of 4 key metrics.
 *
 * @param {Object} summary - { totalApplications, totalInterviews, offers, rejections }
 * @param {boolean} isLoading
 */
function StatsSection({ summary, isLoading }) {
  const cards = [
    {
      label: 'Total Applications',
      value: summary?.totalApplications ?? 0,
      icon: <BriefcaseIcon />,
      colorClass: 'text-violet-400',
      bgClass: 'bg-violet-500/15',
      subtext: 'Active applications in your pipeline',
    },
    {
      label: 'Interviews',
      value: summary?.totalInterviews ?? 0,
      icon: <CalendarIcon />,
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/15',
      subtext: 'Scheduled or completed interviews',
    },
    {
      label: 'Offers Received',
      value: summary?.offers ?? 0,
      icon: <AwardIcon />,
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/15',
      subtext: 'Applications that resulted in an offer',
    },
    {
      label: 'Rejections',
      value: summary?.rejections ?? 0,
      icon: <XCircleIcon />,
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-500/15',
      subtext: 'Applications marked as rejected',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <DashboardCard key={card.label} {...card} isLoading={isLoading} />
      ))}
    </div>
  )
}

export default StatsSection