import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// ── Axios Instance ──────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,       // Send cookies automatically
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request Interceptor ─────────────────────────────────────
// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ────────────────────────────────────
// Normalize errors and handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status   = error.response?.status
    const message  = error.response?.data?.message || error.message || 'Something went wrong'

    // Unauthorized — token expired or invalid
    if (status === 401) {
      localStorage.removeItem('jp_token')
      localStorage.removeItem('jp_user')

      // Only redirect if we're not already on auth pages
      const pathname = window.location.pathname
      if (pathname !== '/login' && pathname !== '/register') {
        window.location.href = '/login'
      }
    }

    return Promise.reject({ message, status, original: error })
  }
)

// ── Auth Endpoints ──────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
  getMe:    ()     => api.get('/auth/me'),
}

// ── Job Endpoints ───────────────────────────────────────────
export const jobService = {
  create:       (data)         => api.post('/jobs', data),
  getAll:       (params)       => api.get('/jobs', { params }),
  getStats:     ()             => api.get('/jobs/stats'),
  getById:      (id)           => api.get(`/jobs/${id}`),
  update:       (id, data)     => api.put(`/jobs/${id}`, data),
  updateStatus: (id, data)     => api.patch(`/jobs/${id}/status`, data),
  delete:       (id)           => api.delete(`/jobs/${id}`),
}

// ── Company Endpoints ───────────────────────────────────────
export const companyService = {
  create:       (data)         => api.post('/companies', data),
  getAll:       (params)       => api.get('/companies', { params }),
  getById:      (id)           => api.get(`/companies/${id}`),
  update:       (id, data)     => api.put(`/companies/${id}`, data),
  delete:       (id)           => api.delete(`/companies/${id}`),
  addRecruiter: (id, data)     => api.post(`/companies/${id}/recruiters`, data),
}

// ── Interview Endpoints ─────────────────────────────────────
export const interviewService = {
  create:         (data)       => api.post('/interviews', data),
  getAll:         (params)     => api.get('/interviews', { params }),
  getById:        (id)         => api.get(`/interviews/${id}`),
  update:         (id, data)   => api.put(`/interviews/${id}`, data),
  updateStatus:   (id, data)   => api.patch(`/interviews/${id}/status`, data),
  addFeedback:    (id, data)   => api.patch(`/interviews/${id}/feedback`, data),
  delete:         (id)         => api.delete(`/interviews/${id}`),
}

// ── Reminder Endpoints ──────────────────────────────────────
export const reminderService = {
  create:         (data)       => api.post('/reminders', data),
  getAll:         (params)     => api.get('/reminders', { params }),
  getById:        (id)         => api.get(`/reminders/${id}`),
  update:         (id, data)   => api.put(`/reminders/${id}`, data),
  toggleComplete: (id)         => api.patch(`/reminders/${id}/complete`),
  delete:         (id)         => api.delete(`/reminders/${id}`),
}

export default api