import api from './api'

/**
 * applicationService
 *
 * Wraps the Job endpoints from Phase 2 (`/api/jobs`) for use by the
 * Applications module — create, read, update, delete, search & filter.
 */
const applicationService = {
  /**
   * Fetch a paginated, filtered list of applications.
   *
   * @param {Object} params
   *   - search: text search (title, company, notes, tags)
   *   - status, jobType, priority: filters
   *   - page, limit: pagination
   *   - sortBy, sortOrder: sorting
   */
  getAll: (params = {}) => api.get('/jobs', { params }),

  /** Fetch a single application by ID (includes related interviews/reminders). */
  getById: (id) => api.get(`/jobs/${id}`),

  /** Create a new application. */
  create: (data) => api.post('/jobs', data),

  /** Update an existing application. */
  update: (id, data) => api.put(`/jobs/${id}`, data),

  /** Update only the status (tracked in statusHistory). */
  updateStatus: (id, data) => api.patch(`/jobs/${id}/status`, data),

  /** Delete an application (cascades to its interviews/reminders). */
  delete: (id) => api.delete(`/jobs/${id}`),

  /** Aggregate stats — counts grouped by status. */
  getStats: () => api.get('/jobs/stats'),
}

export default applicationService