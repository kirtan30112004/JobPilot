import api from './api'

/**
 * dashboardService
 *
 * Aggregates data from the Jobs, Interviews, and Reminders endpoints
 * (built in Phase 2) into the shapes the Dashboard UI needs.
 * No new backend routes required — this composes existing endpoints.
 */
const dashboardService = {
  /**
   * Returns job counts grouped by status, plus a total.
   * Backed by GET /api/jobs/stats
   */
  getJobStats: async () => {
    const res = await api.get('/jobs/stats')
    return res.data.data // { total, byStatus: [{ status, count }] }
  },

  /**
   * Returns a derived summary used by the dashboard stat cards:
   * totalApplications, totalInterviews, offers, rejections.
   */
  getSummary: async () => {
    const [jobStats, interviewsRes] = await Promise.all([
      api.get('/jobs/stats'),
      api.get('/interviews', { params: { limit: 1 } }),
    ])

    const { total: totalApplications, byStatus } = jobStats.data.data

    const findCount = (status) =>
      byStatus.find((s) => s.status === status)?.count || 0

    const offers     = findCount('Offer')
    const rejections = findCount('Rejected')
    const totalInterviews = interviewsRes.data.total || 0

    return {
      totalApplications,
      totalInterviews,
      offers,
      rejections,
      byStatus,
    }
  },

  /**
   * Returns the most recently updated job applications, used to
   * build the "Recent Activity" feed (status changes, new applications).
   */
  getRecentJobs: async (limit = 6) => {
    const res = await api.get('/jobs', {
      params: { limit, sortBy: 'updatedAt', sortOrder: 'desc', isArchived: false },
    })
    return res.data.data.jobs
  },

  /**
   * Returns upcoming scheduled interviews (next 30 days by default
   * via the `upcoming=true` filter on the interviews endpoint).
   */
  getUpcomingInterviews: async (limit = 5) => {
    const res = await api.get('/interviews', {
      params: { upcoming: true, limit },
    })
    return res.data.data.interviews
  },

  /**
   * Returns active (incomplete) reminders sorted by due date.
   */
  getUpcomingReminders: async (limit = 5) => {
    const res = await api.get('/reminders', {
      params: { isCompleted: false, limit },
    })
    return res.data.data.reminders
  },
}

export default dashboardService