/**
 * Form-level validators for JobPilot.
 *
 * Each function takes a form's `values` object and returns
 * { fieldName: errorMessage } — an empty object means the form is
 * valid. These compose the low-level primitives in validationUtils.js
 * rather than re-implementing checks, so every form shares identical
 * email/URL/required-field logic and error wording.
 */

import {
  isRequired,
  isValidEmail,
  isRequiredEmail,
  isValidURL,
  hasValidLength,
  isValidNumber,
  isRangeValid,
  isValidPassword,
  passwordsMatch,
  isValidObjectId,
} from './validationUtils'

// ── Register Validator ────────────────────────────────────────
export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {}

  errors.name =
    isRequired(name, 'Name') ||
    hasValidLength(name, { min: 2, max: 50, fieldLabel: 'Name' })

  errors.email = isRequiredEmail(email, 'Email')

  errors.password = isValidPassword(password)

  errors.confirmPassword = passwordsMatch(password, confirmPassword)

  // Strip null entries so the returned object only contains real errors
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v))
}

// ── Login Validator ───────────────────────────────────────────
export function validateLogin({ email, password }) {
  const errors = {}

  errors.email = isRequiredEmail(email, 'Email')
  errors.password = isRequired(password, 'Password')

  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v))
}

// ── Job (Application) Validator ─────────────────────────────────
export function validateJob({ companyName, jobTitle, jobUrl, salaryMin, salaryMax }) {
  const errors = {}

  errors.companyName =
    isRequired(companyName, 'Company name') ||
    hasValidLength(companyName, { max: 100, fieldLabel: 'Company name' })

  errors.jobTitle =
    isRequired(jobTitle, 'Job title') ||
    hasValidLength(jobTitle, { max: 150, fieldLabel: 'Job title' })

  errors.jobUrl = isValidURL(jobUrl)

  errors.salaryMin = isValidNumber(salaryMin, { min: 0, fieldLabel: 'Minimum salary' })

  errors.salaryMax =
    isValidNumber(salaryMax, { min: 0, fieldLabel: 'Maximum salary' }) ||
    isRangeValid(salaryMin, salaryMax, 'Maximum salary cannot be less than minimum salary')

  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v))
}

// ── Company Validator ────────────────────────────────────────
export function validateCompany({ name, website }) {
  const errors = {}

  errors.name =
    isRequired(name, 'Company name') ||
    hasValidLength(name, { max: 100, fieldLabel: 'Company name' })

  errors.website = isValidURL(website)

  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v))
}

/**
 * Validates a single recruiter contact row (used inside
 * CompanyFormModal's dynamic recruiter list). Only validates email —
 * name/designation/phone are free text and intentionally unconstrained.
 *
 * @param {{ email?: string }} recruiter
 * @returns {string|null} - error message, or null if valid
 */
export function validateRecruiterEmail({ email }) {
  return isValidEmail(email)
}

// ── Interview Validator ──────────────────────────────────────
export function validateInterview({ job, title, scheduledDate, mode, location }) {
  const errors = {}

  errors.job = isRequired(job, 'Application') || isValidObjectId(job, 'Application')

  errors.title =
    isRequired(title, 'Title') ||
    hasValidLength(title, { max: 150, fieldLabel: 'Title' })

  errors.scheduledDate = isRequired(scheduledDate, 'Scheduled date')

  // The "location" field doubles as a meeting link when mode is
  // Online — only enforce URL format in that case, since for
  // In-Person/Phone modes it's a free-text address or phone note.
  if (mode === 'Online') {
    errors.location = isValidURL(location)
  }

  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v))
}

/**
 * Validates a single interviewer contact row (used inside
 * InterviewFormModal's dynamic interviewer list). Only validates
 * email — name/designation are free text.
 *
 * @param {{ email?: string }} interviewer
 * @returns {string|null}
 */
export function validateInterviewerEmail({ email }) {
  return isValidEmail(email)
}

// ── Reminder Validator ───────────────────────────────────────
export function validateReminder({ title, dueDate }) {
  const errors = {}

  errors.title =
    isRequired(title, 'Title') ||
    hasValidLength(title, { max: 150, fieldLabel: 'Title' })

  errors.dueDate = isRequired(dueDate, 'Due date')

  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v))
}