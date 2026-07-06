import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import dashboardService from '../services/dashboardService'
import analyticsService from '../services/analyticsService'

import StatsSection from '../components/StatsSection'
import RecentActivity from '../components/RecentActivity'
import ApplicationsByMonthChart from '../components/ApplicationsByMonthChart'
import ApplicationsByStatusChart from '../components/ApplicationsByStatusChart'
import InterviewConversionChart from '../components/InterviewConversionChart'
import OfferSuccessChart from '../components/OfferSuccessChart'
import CompanyApplicationsChart from '../components/CompanyApplicationsChart'
import TopCompaniesChart from '../components/TopCompaniesChart'

// ── Icons ────────────────────────────────────────────────────
function AlertCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
function RefreshIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  )
}

/**
 * SectionHeading — small label used above each grouped section of
 * the dashboard (Middle / Analytics / Company Analytics / Activity).
 */
function SectionHeading({ children }) {
  return (
    <h2 className="font-display text-lg font-bold text-white mb-4">{children}</h2>
  )
}

/**
 * Dashboard — main landing page after login.
 *
 * Layout (top to bottom):
 *  1. Header — greeting, refresh button, "Add application" CTA
 *  2. Top stats — Total Applications / Interviews / Offers / Rejections
 *  3. Middle — Applications by Month (line) + Applications by Status (pie)
 *  4. Analytics — Interview Conversion (bar) + Offer Success (donut)
 *  5. Company Analytics — Applications by Company (h-bar) + Top 5 Companies (bar)
 *  6. Recent Activity — recent applications, upcoming interviews, reminders
 *
 * Data sources:
 *  - dashboardService: summary stats + recent activity feed (Phase 4A)
 *  - analyticsService.getOverview(): single aggregated payload powering
 *    every chart except ApplicationsByMonthChart, which self-fetches via
 *    its own `months` prop since it only exposes that one input.
 *
 * Responsive grid: 1 column on mobile, 2 columns from `lg` upward for
 * every paired chart section (Middle / Analytics / Company Analytics).
 */
function Dashboard() {
  const { user } = useAuth()

  // ── Top stats + activity feed state (dashboardService) ──────
  const [summary, setSummary] = useState(null)
  const [recentJobs, setRecentJobs] = useState([])
  const [upcomingInterviews, setUpcomingInterviews] = useState([])
  const [upcomingReminders, setUpcomingReminders] = useState([])
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
  const [dashboardError, setDashboardError] = useState('')

  // ── Analytics overview state (analyticsService) ──────────────
  const [overview, setOverview] = useState(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)
  const [analyticsError, setAnalyticsError] = useState('')

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // ── Fetch top stats + recent activity ─────────────────────────
  const loadDashboard = useCallback(async () => {
    setIsLoadingDashboard(true)
    setDashboardError('')

    try {
      const [summaryData, jobs, interviews, reminders] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRecentJobs(6),
        dashboardService.getUpcomingInterviews(5),
        dashboardService.getUpcomingReminders(5),
      ])

      setSummary(summaryData)
      setRecentJobs(jobs)
      setUpcomingInterviews(interviews)
      setUpcomingReminders(reminders)
    } catch (err) {
      setDashboardError(err.message || 'Failed to load dashboard data')
    } finally {
      setIsLoadingDashboard(false)
    }
  }, [])

  // ── Fetch combined analytics overview ─────────────────────────
  const loadAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true)
    setAnalyticsError('')

    try {
      const data = await analyticsService.getOverview({ months: 6, companyLimit: 5 })
      setOverview(data)
    } catch (err) {
      setAnalyticsError(err.message || 'Failed to load analytics')
    } finally {
      setIsLoadingAnalytics(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
    loadAnalytics()
  }, [loadDashboard, loadAnalytics])

  const handleRefreshAll = () => {
    loadDashboard()
    loadAnalytics()
  }

  const isRefreshing = isLoadingDashboard || isLoadingAnalytics

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-slate-400 text-sm">
            Here's an overview of your job search pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="btn-ghost py-2 px-3.5 text-sm disabled:opacity-50"
            aria-label="Refresh dashboard"
            title="Refresh"
          >
            <RefreshIcon className={isRefreshing ? 'animate-spin-slow' : ''} />
          </button>
          <Link to="/jobs" className="btn-primary text-sm">
            <PlusIcon />
            Add application
          </Link>
        </div>
      </div>

      {/* ── Dashboard error banner (stats / activity) ─────────── */}
      {dashboardError && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 animate-fade-in">
          <span className="text-rose-400 mt-0.5 shrink-0"><AlertCircleIcon /></span>
          <div className="flex-1">
            <p className="text-sm text-rose-300">{dashboardError}</p>
          </div>
          <button
            onClick={loadDashboard}
            className="text-xs font-semibold text-rose-300 hover:text-rose-200 underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── 1. Top stats section ──────────────────────────────── */}
      <div className="mb-10">
        <StatsSection summary={summary} isLoading={isLoadingDashboard} />
      </div>

      {/* ── Analytics error banner (charts) ───────────────────── */}
      {analyticsError && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 animate-fade-in">
          <span className="text-rose-400 mt-0.5 shrink-0"><AlertCircleIcon /></span>
          <div className="flex-1">
            <p className="text-sm text-rose-300">{analyticsError}</p>
          </div>
          <button
            onClick={loadAnalytics}
            className="text-xs font-semibold text-rose-300 hover:text-rose-200 underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── 2. Middle section — trend + status breakdown ──────── */}
      <div className="mb-10">
        <SectionHeading>Application Insights</SectionHeading>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Self-fetching: only exposes a `months` prop, no controlled data mode */}
          <ApplicationsByMonthChart months={6} />

          <ApplicationsByStatusChart
            data={overview?.applicationsByStatus}
            isLoading={isLoadingAnalytics}
            error={analyticsError}
          />
        </div>
      </div>

      {/* ── 3. Analytics section — conversion + offer success ──── */}
      <div className="mb-10">
        <SectionHeading>Conversion Analytics</SectionHeading>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <InterviewConversionChart
            data={overview?.conversionRates}
            isLoading={isLoadingAnalytics}
            error={analyticsError}
          />

          <OfferSuccessChart
            data={overview?.conversionRates}
            isLoading={isLoadingAnalytics}
            error={analyticsError}
          />
        </div>
      </div>

      {/* ── 4. Company analytics section ──────────────────────── */}
      <div className="mb-10">
        <SectionHeading>Company Analytics</SectionHeading>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CompanyApplicationsChart
            data={overview?.companyWise}
            isLoading={isLoadingAnalytics}
            error={analyticsError}
          />

          <TopCompaniesChart
            data={overview?.companyWise}
            isLoading={isLoadingAnalytics}
            error={analyticsError}
          />
        </div>
      </div>

      {/* ── 5. Recent activity feed ────────────────────────────── */}
      <div>
        <SectionHeading>Recent Activity</SectionHeading>
        <RecentActivity
          recentJobs={recentJobs}
          upcomingInterviews={upcomingInterviews}
          upcomingReminders={upcomingReminders}
          isLoading={isLoadingDashboard}
        />
      </div>
    </div>
  )
}

export default Dashboard