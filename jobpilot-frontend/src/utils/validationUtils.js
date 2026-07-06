/**
 * validationUtils
 *
 * Low-level, reusable validation primitives shared by every form
 * validator in the app (validators.js). Each function here checks
 * ONE thing and returns either `null` (valid) or a human-readable
 * error message string (invalid) — never throws, never mutates.
 *
 * Form-level validators (validateLogin, validateJob, etc. in
 * validators.js) compose these primitives instead of re-implementing
 * regexes or ad hoc checks inline, so:
 *   - error message wording stays consistent across every form
 *   - a fix or refinement here (e.g. a better email regex) propagates
 *     everywhere automatically
 *   - new forms can be validated correctly without copy-pasting logic
 */

// ── Regex patterns ──────────────────────────────────────────────
// Practical (not fully RFC 5322-compliant) email pattern — matches
// what the backend's express-validator isEmail() accepts in practice
// and what users actually expect "looks like an email" to mean.
const EMAIL_PATTERN = /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/

// At least one digit — used for password strength checks.
const HAS_DIGIT_PATTERN = /\d/

// At least one letter — used for password strength checks.
const HAS_LETTER_PATTERN = /[a-zA-Z]/

// ── Required ─────────────────────────────────────────────────────
/**
 * Checks that a value is present and, for strings, non-blank after
 * trimming. Works for strings, numbers, and booleans (0 and false
 * are treated as "present" — only null/undefined/empty-string fail).
 *
 * @param {*} value
 * @param {string} [fieldLabel='This field'] - used in the default message
 * @returns {string|null}
 */
export function isRequired(value, fieldLabel = 'This field') {
  if (value === null || value === undefined) {
    return `${fieldLabel} is required`
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldLabel} is required`
  }
  return null
}

// ── Email ────────────────────────────────────────────────────────
/**
 * Validates an email address format. Does NOT check whether the
 * field is required — combine with isRequired() for that, since
 * many email fields (e.g. a recruiter contact) are optional.
 *
 * @param {string} value
 * @returns {string|null}
 */
export function isValidEmail(value) {
  if (!value) return null // not required by this check alone
  if (!EMAIL_PATTERN.test(value.trim())) {
    return 'Enter a valid email address'
  }
  return null
}

/**
 * Convenience composite: required AND valid email in one call.
 * Use this for fields that must always be a real email (login,
 * register). For optional email fields (recruiter contact), call
 * isValidEmail() alone.
 *
 * @param {string} value
 * @param {string} [fieldLabel='Email']
 * @returns {string|null}
 */
export function isRequiredEmail(value, fieldLabel = 'Email') {
  const requiredError = isRequired(value, fieldLabel)
  if (requiredError) return requiredError
  return isValidEmail(value)
}

// ── URL ──────────────────────────────────────────────────────────
/**
 * Validates a URL using the native URL constructor (handles full
 * RFC validation — scheme, host, etc. — far more reliably than a
 * hand-rolled regex). Requires an explicit scheme (https://, http://)
 * since that's what users are expected to paste from a browser bar
 * and what the backend's express-validator isURL() also expects.
 *
 * @param {string} value
 * @returns {string|null}
 */
export function isValidURL(value) {
  if (!value || !value.trim()) return null // not required by this check alone

  const trimmed = value.trim()

  try {
    const url = new URL(trimmed)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'URL must start with http:// or https://'
    }
    return null
  } catch {
    return 'Enter a valid URL (include https://)'
  }
}

/**
 * Convenience composite: required AND valid URL.
 *
 * @param {string} value
 * @param {string} [fieldLabel='URL']
 * @returns {string|null}
 */
export function isRequiredURL(value, fieldLabel = 'URL') {
  const requiredError = isRequired(value, fieldLabel)
  if (requiredError) return requiredError
  return isValidURL(value)
}

// ── Length ───────────────────────────────────────────────────────
/**
 * Checks a string's trimmed length falls within [min, max] (inclusive).
 * Pass only `min` or only `max` to check a single bound.
 *
 * @param {string} value
 * @param {Object} options
 * @param {number} [options.min]
 * @param {number} [options.max]
 * @param {string} [options.fieldLabel='This field']
 * @returns {string|null}
 */
export function hasValidLength(value, { min, max, fieldLabel = 'This field' } = {}) {
  if (!value) return null
  const length = value.trim().length

  if (min !== undefined && length < min) {
    return `${fieldLabel} must be at least ${min} character${min === 1 ? '' : 's'}`
  }
  if (max !== undefined && length > max) {
    return `${fieldLabel} cannot exceed ${max} characters`
  }
  return null
}

// ── Number / range ───────────────────────────────────────────────
/**
 * Checks that a value, when coerced to a number, falls within an
 * optional [min, max] range. Empty values pass (combine with
 * isRequired() to enforce presence).
 *
 * @param {string|number} value
 * @param {Object} options
 * @param {number} [options.min]
 * @param {number} [options.max]
 * @param {string} [options.fieldLabel='This field']
 * @returns {string|null}
 */
export function isValidNumber(value, { min, max, fieldLabel = 'This field' } = {}) {
  if (value === '' || value === null || value === undefined) return null

  const num = Number(value)
  if (Number.isNaN(num)) {
    return `${fieldLabel} must be a number`
  }
  if (min !== undefined && num < min) {
    return `${fieldLabel} cannot be less than ${min}`
  }
  if (max !== undefined && num > max) {
    return `${fieldLabel} cannot exceed ${max}`
  }
  return null
}

/**
 * Compares two numeric values (e.g. salary min/max, date ranges
 * expressed as numbers) and ensures `maxValue` is not less than
 * `minValue`. Both empty values pass.
 *
 * @param {string|number} minValue
 * @param {string|number} maxValue
 * @param {string} [message]
 * @returns {string|null}
 */
export function isRangeValid(minValue, maxValue, message = 'Maximum cannot be less than minimum') {
  if (minValue === '' || minValue === null || minValue === undefined) return null
  if (maxValue === '' || maxValue === null || maxValue === undefined) return null

  if (Number(maxValue) < Number(minValue)) {
    return message
  }
  return null
}

// ── Password strength ───────────────────────────────────────────
/**
 * Validates password strength: minimum length plus at least one
 * digit. Mirrors the backend's express-validator password rule
 * exactly, so client and server never disagree about what's valid.
 *
 * @param {string} value
 * @param {Object} [options]
 * @param {number} [options.minLength=6]
 * @returns {string|null}
 */
export function isValidPassword(value, { minLength = 6 } = {}) {
  if (!value) return 'Password is required'
  if (value.length < minLength) {
    return `Password must be at least ${minLength} characters`
  }
  if (!HAS_DIGIT_PATTERN.test(value)) {
    return 'Password must include at least one number'
  }
  return null
}

/**
 * Checks two password fields match. Use after isValidPassword() has
 * already confirmed the primary password is valid.
 *
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {string|null}
 */
export function passwordsMatch(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return null
}

// ── Date ─────────────────────────────────────────────────────────
/**
 * Checks that a value is a valid, parseable date.
 *
 * @param {string} value
 * @param {string} [fieldLabel='Date']
 * @returns {string|null}
 */
export function isValidDate(value, fieldLabel = 'Date') {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return `${fieldLabel} is not a valid date`
  }
  return null
}

// ── MongoDB ObjectId ─────────────────────────────────────────────
/**
 * Checks that a value looks like a valid MongoDB ObjectId (24 hex
 * characters). Used for "select an existing record" dropdowns
 * (linked company, linked job) where the value is an _id string.
 *
 * @param {string} value
 * @param {string} [fieldLabel='Selection']
 * @returns {string|null}
 */
export function isValidObjectId(value, fieldLabel = 'Selection') {
  if (!value) return null
  if (!/^[a-f\d]{24}$/i.test(value)) {
    return `${fieldLabel} is invalid`
  }
  return null
}

// ── Composition helper ───────────────────────────────────────────
/**
 * Runs a list of validator functions in order against a single
 * value and returns the FIRST non-null error message (or null if
 * all pass). Lets call sites chain multiple checks tersely:
 *
 *   errors.email = runValidators(email, [
 *     (v) => isRequired(v, 'Email'),
 *     isValidEmail,
 *   ])
 *
 * @param {*} value
 * @param {Array<Function>} validatorFns - each: (value) => string|null
 * @returns {string|null}
 */
export function runValidators(value, validatorFns) {
  for (const fn of validatorFns) {
    const error = fn(value)
    if (error) return error
  }
  return null
}

/**
 * Returns true if an errors object (as produced by any form
 * validator) has no entries — i.e. the form is valid. Filters out
 * falsy values so `{ email: '' }` (cleared error) still counts as
 * valid, matching how every form's handleChange clears errors.
 *
 * @param {Object} errors
 * @returns {boolean}
 */
export function isValid(errors) {
  return Object.values(errors).every((msg) => !msg)
}