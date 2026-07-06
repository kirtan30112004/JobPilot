import React from 'react'

// ── Icons ────────────────────────────────────────────────────
function AlertCircleIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
function AlertTriangleIcon(props) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
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
 * ErrorState — reusable error display with two visual variants.
 *
 * **Inline (default)** — a compact rose-tinted banner with an icon,
 * message, and optional "Retry" link. Matches the inline error
 * banners used throughout the app (Applications, Companies,
 * Interviews, Reminders, Dashboard) so all pages can share one
 * implementation instead of duplicating the markup.
 *
 * **Block** — a larger centered panel (icon in a circle, heading,
 * description, retry button) for when an error replaces an entire
 * section's content rather than sitting above it — e.g. a chart or
 * table that failed to load and has nothing else to show.
 *
 * @param {string} message - the error text to display (required)
 * @param {Function} [onRetry] - if provided, renders a retry action
 * @param {'inline'|'block'} [variant='inline']
 * @param {string} [title] - heading text, block variant only (default: 'Something went wrong')
 * @param {string} [className] - extra classes for the outer wrapper
 */
function ErrorState({ message, onRetry, variant = 'inline', title = 'Something went wrong', className = '' }) {
  if (!message) return null

  if (variant === 'block') {
    return (
      <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`} role="alert">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 flex items-center justify-center mb-4 text-rose-400">
          <AlertTriangleIcon />
        </div>
        <h3 className="font-display text-base font-bold text-white mb-1.5">{title}</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-5">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-ghost py-2 px-4 text-sm">
            <RefreshIcon />
            Try again
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 ${className}`}
      role="alert"
    >
      <span className="text-rose-400 mt-0.5 shrink-0">
        <AlertCircleIcon />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-rose-300">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold text-rose-300 hover:text-rose-200 underline shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  )
}

export default ErrorState