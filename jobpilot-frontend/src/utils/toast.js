import toast from 'react-hot-toast'

/**
 * Centralized toast helpers — thin wrappers around react-hot-toast
 * with JobPilot's dark theme baked in, so every page calls the same
 * four functions instead of repeating style objects everywhere.
 */

const baseStyle = {
  background: '#1E293B',  // slate-800
  color: '#F1F5F9',        // slate-100
  border: '1px solid #334155', // slate-700
  borderRadius: '0.75rem',
  fontSize: '0.875rem',
  padding: '10px 14px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)',
}

/** Generic success toast (e.g. "Application updated"). */
export const showSuccess = (message) =>
  toast.success(message, {
    style: baseStyle,
    iconTheme: { primary: '#10B981', secondary: '#1E293B' }, // emerald-500
  })

/** Generic error toast (e.g. failed API calls). */
export const showError = (message) =>
  toast.error(message || 'Something went wrong', {
    style: baseStyle,
    iconTheme: { primary: '#F43F5E', secondary: '#1E293B' }, // rose-500
  })

/**
 * Delete-specific toast — same visual language as showSuccess but
 * kept as a distinct helper so call sites read intent clearly
 * (e.g. `showDeleteSuccess('Application deleted')`) and so the
 * icon/wording can diverge later without touching every call site.
 */
export const showDeleteSuccess = (message = 'Deleted successfully') =>
  toast.success(message, {
    style: baseStyle,
    icon: '🗑️',
  })

/** Authentication-specific toast (login, register, logout). */
export const showAuthSuccess = (message) =>
  toast.success(message, {
    style: baseStyle,
    iconTheme: { primary: '#8B5CF6', secondary: '#1E293B' }, // violet-500
    duration: 3000,
  })