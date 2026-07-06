import api from './api'

/**
 * analyticsService
 *
 * Wraps the analytics endpoints built in Phase 5A
 * (`/api/analytics/*`) — application trends, status breakdowns,
 * conversion/offer rates, and company-wise stats. Used to power
 * the JobPilot analytics dashboard.
 *
 * All methods are async and return the `data` portion of the API
 * response (already unwrapped from `{ success, data }`). Errors
 * are normalized by the shared Axios instance's response
 * interceptor (see services/api.js) into `{ message, status, original }`
 * and rethrown for callers to handle with try/catch.
 */
const analyticsService = {
  /**
   * Fetch application counts grouped by month.
   *
   * @param {number} [months=12] - number of months of history (1-24)
   * @returns {Promise<Array<{ year: number, month: number, label: string, count: number }>>}
   */
  getApplicationsByMonth: async (months = 12) => {
    try {
      const res = await api.get('/analytics/applications-by-month', {
        params: { months },
      })
      return res.data.data
    } catch (err) {
      throw new Error(err.message || 'Failed to load applications-by-month analytics')
    }
  },

  /**
   * Fetch application counts grouped by current status.
   *
   * @param {Object} [options]
   * @param {boolean} [options.includeArchived=false] - include archived applications
   * @returns {Promise<{ total: number, byStatus: Array<{ status: string, count: number }> }>}
   */
  getApplicationsByStatus: async ({ includeArchived = false } = {}) => {
    try {
      const res = await api.get('/analytics/applications-by-status', {
        params: { includeArchived: includeArchived ? 'true' : 'false' },
      })
      return res.data.data
    } catch (err) {
      throw new Error(err.message || 'Failed to load applications-by-status analytics')
    }
  },

  /**
   * Fetch interview conversion rate and offer success rate, along
   * with the supporting raw counts.
   *
   * @returns {Promise<{
   *   totalApplications: number,
   *   applicationsWithInterviews: number,
   *   totalOffers: number,
   *   totalRejections: number,
   *   interviewConversionRate: number,
   *   offerSuccessRate: number,
   *   offerRateAmongInterviewed: number,
   *   rejectionRate: number
   * }>}
   */
  getConversionRates: async () => {
    try {
      const res = await api.get('/analytics/conversion-rates')
      return res.data.data
    } catch (err) {
      throw new Error(err.message || 'Failed to load conversion rate analytics')
    }
  },

  /**
   * Convenience accessor for just the interview conversion rate.
   *
   * @returns {Promise<number>} percentage (0-100, rounded to 1 decimal)
   */
  getInterviewConversionRate: async () => {
    const data = await analyticsService.getConversionRates()
    return data.interviewConversionRate
  },

  /**
   * Convenience accessor for just the offer success rate.
   *
   * @returns {Promise<number>} percentage (0-100, rounded to 1 decimal)
   */
  getOfferSuccessRate: async () => {
    const data = await analyticsService.getConversionRates()
    return data.offerSuccessRate
  },

  /**
   * Fetch application counts grouped by company, with a per-status
   * breakdown for each company.
   *
   * @param {Object} [options]
   * @param {number} [options.limit=10] - max companies to return (1-50)
   * @param {boolean} [options.includeArchived=false] - include archived applications
   * @returns {Promise<Array<{
   *   companyName: string,
   *   total: number,
   *   byStatus: Array<{ status: string, count: number }>
   * }>>}
   */
  getCompanyWiseApplications: async ({ limit = 10, includeArchived = false } = {}) => {
    try {
      const res = await api.get('/analytics/company-wise', {
        params: { limit, includeArchived: includeArchived ? 'true' : 'false' },
      })
      return res.data.data
    } catch (err) {
      throw new Error(err.message || 'Failed to load company-wise analytics')
    }
  },

  /**
   * Fetch the combined analytics overview in a single request —
   * applications-by-month, applications-by-status, conversion
   * rates, and company-wise breakdown.
   *
   * Prefer this over calling the individual methods separately
   * when rendering a full analytics dashboard, since it's served
   * by a single aggregated backend endpoint.
   *
   * @param {Object} [options]
   * @param {number} [options.months=6] - months of history for the trend chart (1-24)
   * @param {number} [options.companyLimit=5] - max companies in the breakdown (1-50)
   * @returns {Promise<{
   *   applicationsByMonth: Array<{ year: number, month: number, label: string, count: number }>,
   *   applicationsByStatus: { total: number, byStatus: Array<{ status: string, count: number }> },
   *   conversionRates: {
   *     totalApplications: number,
   *     applicationsWithInterviews: number,
   *     totalOffers: number,
   *     totalRejections: number,
   *     interviewConversionRate: number,
   *     offerSuccessRate: number,
   *     offerRateAmongInterviewed: number,
   *     rejectionRate: number
   *   },
   *   companyWise: Array<{ companyName: string, total: number, byStatus: Array<{ status: string, count: number }> }>
   * }>}
   */
  getOverview: async ({ months = 6, companyLimit = 5 } = {}) => {
    try {
      const res = await api.get('/analytics/overview', {
        params: { months, companyLimit },
      })
      return res.data.data
    } catch (err) {
      throw new Error(err.message || 'Failed to load analytics overview')
    }
  },
}

export default analyticsService