/**
 * format.js — shared formatting utilities for JobPilot.
 *
 * Centralises date, currency, and text formatting so every page,
 * table, and form modal renders values consistently. All functions
 * are pure, defensive against null/undefined/invalid input, and
 * return a safe fallback rather than throwing.
 */

// ── Date formatting ──────────────────────────────────────────

/**
 * Formats a date string/Date into a short, readable form.
 * e.g. "Jun 30, 2026"
 *
 * @param {string|Date|null|undefined} dateInput
 * @param {Intl.DateTimeFormatOptions} [options] - override/extend the default format
 * @returns {string} formatted date, or '—' if invalid/missing
 */
export function formatDate(dateInput, options = {}) {
  if (!dateInput) return '—'

  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  })
}

/**
 * Formats a date string/Date into a readable date + time form.
 * e.g. "Jun 30, 2026, 3:45 PM"
 *
 * @param {string|Date|null|undefined} dateInput
 * @param {string} [locale='en-US'] - locale for Intl formatting
 * @returns {string} formatted date-time, or '—' if invalid/missing
 */
export function formatDateTime(dateInput, locale = 'en-US') {
  if (!dateInput) return '—'

  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Converts a date into the value expected by <input type="date">.
 * e.g. "2026-06-30"
 *
 * @param {string|Date|null|undefined} dateInput
 * @returns {string} YYYY-MM-DD, or '' if invalid/missing
 */
export function toDateInput(dateInput) {
  if (!dateInput) return ''

  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Converts a date into the value expected by
 * <input type="datetime-local">.
 * e.g. "2026-06-30T15:45"
 *
 * @param {string|Date|null|undefined} dateInput
 * @returns {string} YYYY-MM-DDTHH:mm, or '' if invalid/missing
 */
export function toDateTimeLocal(dateInput) {
  if (!dateInput) return ''

  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * True if the given date is strictly before the current moment.
 * Used to flag overdue reminders/deadlines.
 *
 * @param {string|Date|null|undefined} dateInput
 * @returns {boolean}
 */
export function isOverdue(dateInput) {
  if (!dateInput) return false

  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return false

  return date.getTime() < Date.now()
}

/**
 * True if the given date falls between now and `days` days from now
 * (inclusive of now, so an overdue date returns false — callers
 * typically check isOverdue() first and only call this when it's
 * false). Used to flag "due soon" reminders.
 *
 * @param {string|Date|null|undefined} dateInput
 * @param {number} [days=7] - how many days ahead counts as "upcoming"
 * @returns {boolean}
 */
export function isUpcoming(dateInput, days = 7) {
  if (!dateInput) return false

  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return false

  const now = Date.now()
  const target = date.getTime()
  const windowEnd = now + days * 24 * 60 * 60 * 1000

  return target >= now && target <= windowEnd
}

// ── Currency / number formatting ─────────────────────────────

/**
 * Generic currency formatter built on Intl.NumberFormat.
 * e.g. formatCurrency(85000) → "$85,000"
 *      formatCurrency(85000, 'EUR') → "€85,000"
 *
 * @param {number|string|null|undefined} value
 * @param {string} [currency='USD'] - ISO 4217 currency code
 * @param {Object} [options] - extra Intl.NumberFormat options (e.g. { maximumFractionDigits: 2 })
 * @returns {string} formatted currency string, or '—' if value is not a finite number
 */
export function formatCurrency(value, currency = 'USD', options = {}) {
  const num = Number(value)
  if (value === null || value === undefined || value === '' || !Number.isFinite(num)) return '—'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
      ...options,
    }).format(num)
  } catch {
    // Unknown/invalid currency code — fall back to a plain number with the code prefixed
    return `${currency} ${num.toLocaleString('en-US')}`
  }
}

/**
 * Formats a job's salary range for display.
 * e.g. formatSalary(80000, 100000, 'USD') → "$80,000 – $100,000"
 *      formatSalary(80000, null, 'USD')   → "$80,000+"
 *      formatSalary(null, 100000, 'USD')  → "Up to $100,000"
 *      formatSalary(null, null)           → "—"
 *
 * @param {number|string|null|undefined} min
 * @param {number|string|null|undefined} max
 * @param {string} [currency='USD']
 * @returns {string}
 */
export function formatSalary(min, max, currency = 'USD') {
  const minNum = Number(min)
  const maxNum = Number(max)
  const hasMin = min !== null && min !== undefined && min !== '' && Number.isFinite(minNum)
  const hasMax = max !== null && max !== undefined && max !== '' && Number.isFinite(maxNum)

  if (!hasMin && !hasMax) return '—'

  const fmt = (n) => formatCurrency(n, currency)

  if (hasMin && hasMax) return `${fmt(minNum)} – ${fmt(maxNum)}`
  if (hasMin) return `${fmt(minNum)}+`
  return `Up to ${fmt(maxNum)}`
}

/**
 * Formats a decimal or whole number as a percentage string.
 * e.g. formatPercentage(37.5) → "37.5%"
 *      formatPercentage(0.375, { fromDecimal: true }) → "37.5%"
 *      formatPercentage(37.456, { decimals: 1 }) → "37.5%"
 *
 * @param {number|string|null|undefined} value
 * @param {Object} [options]
 * @param {boolean} [options.fromDecimal=false] - if true, multiplies value by 100 first (e.g. 0.5 → 50%)
 * @param {number} [options.decimals=1] - number of decimal places to show
 * @returns {string} formatted percentage, or '—' if value is not a finite number
 */
export function formatPercentage(value, options = {}) {
  const { fromDecimal = false, decimals = 1 } = options

  const num = Number(value)
  if (value === null || value === undefined || value === '' || !Number.isFinite(num)) return '—'

  const pct = fromDecimal ? num * 100 : num
  return `${pct.toFixed(decimals)}%`
}

// ── Text formatting ───────────────────────────────────────────

/**
 * Truncates a string to a maximum length, appending an ellipsis
 * when truncation occurs. Safe against null/undefined/non-string
 * input.
 *
 * @param {string|null|undefined} text
 * @param {number} [maxLength=50]
 * @param {string} [suffix='…']
 * @returns {string}
 */
export function truncateText(text, maxLength = 50, suffix = '…') {
  if (!text || typeof text !== 'string') return ''
  if (text.length <= maxLength) return text

  return `${text.slice(0, Math.max(0, maxLength - suffix.length))}${suffix}`
}

/**
 * Capitalizes the first letter of a string, leaving the rest
 * unchanged. Safe against null/undefined/empty input.
 * e.g. capitalize('applied') → 'Applied'
 *      capitalize('HR Round') → 'HR Round'
 *
 * @param {string|null|undefined} text
 * @returns {string}
 */
export function capitalize(text) {
  if (!text || typeof text !== 'string') return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// ── Relative time ─────────────────────────────────────────────

/**
 * Returns a short relative-time label for a past date.
 * e.g. "just now", "5m ago", "3h ago", "2d ago", "3w ago", "4mo ago", "1y ago"
 *
 * @param {string|Date|null|undefined} dateInput
 * @returns {string} relative time label, or '' if invalid/missing
 */
export function timeAgo(dateInput) {
  if (!dateInput) return ''

  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return ''

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 0) return 'just now'
  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`

  const years = Math.floor(days / 365)
  return `${years}y ago`
}