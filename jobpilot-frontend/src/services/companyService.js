import api from './api'

/**
 * companyService
 *
 * Wraps the Company endpoints from Phase 2 (`/api/companies`) for use
 * by the Companies module — create, read, update, delete, recruiters.
 */
const companyService = {
  /**
   * Fetch a paginated, searchable list of companies.
   * @param {Object} params - { search, page, limit }
   */
  getAll: (params = {}) => api.get('/companies', { params }),

  /** Fetch a single company by ID (includes linked jobsCount). */
  getById: (id) => api.get(`/companies/${id}`),

  /** Create a new company. */
  create: (data) => api.post('/companies', data),

  /** Update an existing company. */
  update: (id, data) => api.put(`/companies/${id}`, data),

  /** Delete a company (unlinks — does not delete — associated jobs). */
  delete: (id) => api.delete(`/companies/${id}`),

  /** Add a recruiter to a company's recruiters array. */
  addRecruiter: (id, data) => api.post(`/companies/${id}/recruiters`, data),
}

export default companyService