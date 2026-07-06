import api from './api'

/**
 * interviewService
 *
 * Wraps the Interview endpoints from Phase 2 (`/api/interviews`) —
 * scheduling, editing, status tracking, feedback, and deletion.
 */
const interviewService = {
  /**
   * Fetch a paginated, filterable list of interviews.
   * @param {Object} params - { job, status, type, upcoming, page, limit }
   */
  getAll: (params = {}) => api.get('/interviews', { params }),

  /** Fetch a single interview by ID (includes populated job summary). */
  getById: (id) => api.get(`/interviews/${id}`),

  /** Schedule a new interview. */
  create: (data) => api.post('/interviews', data),

  /** Update interview details (date, type, mode, interviewers, etc.). */
  update: (id, data) => api.put(`/interviews/${id}`, data),

  /** Update only the interview status. */
  updateStatus: (id, status) => api.patch(`/interviews/${id}/status`, { status }),

  /** Add/update feedback and rating for a completed interview. */
  addFeedback: (id, data) => api.patch(`/interviews/${id}/feedback`, data),

  /** Delete an interview. */
  delete: (id) => api.delete(`/interviews/${id}`),
}

export default interviewService