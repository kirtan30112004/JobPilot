import api from './api'

/**
 * reminderService
 *
 * Wraps the Reminder endpoints from Phase 2 (`/api/reminders`) —
 * follow-ups and deadlines, including overdue/upcoming queries
 * used to power the notification badge.
 */
const reminderService = {
  /**
   * Fetch a paginated, filterable list of reminders.
   * @param {Object} params - { isCompleted, type, job, overdue, upcoming, page, limit }
   */
  getAll: (params = {}) => api.get('/reminders', { params }),

  /** Fetch a single reminder by ID (includes populated job summary). */
  getById: (id) => api.get(`/reminders/${id}`),

  /** Create a new reminder. */
  create: (data) => api.post('/reminders', data),

  /** Update an existing reminder. */
  update: (id, data) => api.put(`/reminders/${id}`, data),

  /** Toggle the completed state of a reminder. */
  toggleComplete: (id) => api.patch(`/reminders/${id}/complete`),

  /** Delete a reminder. */
  delete: (id) => api.delete(`/reminders/${id}`),

  /**
   * Fetch the count of overdue + due-soon (next N days) incomplete
   * reminders, used to populate the notification badge.
   * @param {number} days - "due soon" window (default: 3 days)
   */
  getNotificationCount: async (days = 3) => {
    const [overdueRes, upcomingRes] = await Promise.all([
      api.get('/reminders', { params: { overdue: true, limit: 1 } }),
      api.get('/reminders', { params: { upcoming: days, limit: 1 } }),
    ])

    return {
      overdue: overdueRes.data.total || 0,
      dueSoon: upcomingRes.data.total || 0,
      total: (overdueRes.data.total || 0) + (upcomingRes.data.total || 0),
    }
  },
}

export default reminderService