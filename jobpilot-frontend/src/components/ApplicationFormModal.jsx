import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import { ButtonSpinner } from './Loader'
import { AlertCircleIcon } from './icons'
import {
  JOB_STATUSES, JOB_TYPES, PRIORITIES, CURRENCIES,
} from '../utils/constants'
import { toDateInput } from '../utils/format'
import { validateJob } from '../utils/validators'

const EMPTY_FORM = {
  _id: null,
  company: '',
  companyName: '',
  jobTitle: '',
  jobDescription: '',
  jobUrl: '',
  location: '',
  jobType: '',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  status: 'Applied',
  appliedDate: toDateInput(new Date().toISOString()),
  priority: 'Medium',
  tags: '',
  notes: '',
}

/**
 * Converts a Job document from the API into form state.
 */
function jobToFormValues(job) {
  if (!job) return { ...EMPTY_FORM, appliedDate: toDateInput(new Date().toISOString()) }

  return {
    _id: job._id,
    company: job.company?._id || job.company || '',
    companyName: job.companyName || '',
    jobTitle: job.jobTitle || '',
    jobDescription: job.jobDescription || '',
    jobUrl: job.jobUrl || '',
    location: job.location || '',
    jobType: job.jobType || '',
    salaryMin: job.salaryRange?.min ?? '',
    salaryMax: job.salaryRange?.max ?? '',
    currency: job.salaryRange?.currency || 'USD',
    status: job.status || 'Applied',
    appliedDate: toDateInput(job.appliedDate),
    priority: job.priority || 'Medium',
    tags: (job.tags || []).join(', '),
    notes: job.notes || '',
  }
}

/**
 * Converts form state into the payload expected by POST/PUT /api/jobs.
 */
function formValuesToPayload(values) {
  return {
    company: values.company || null,
    companyName: values.companyName.trim(),
    jobTitle: values.jobTitle.trim(),
    jobDescription: values.jobDescription.trim(),
    jobUrl: values.jobUrl.trim(),
    location: values.location.trim(),
    jobType: values.jobType,
    salaryRange: {
      min: values.salaryMin !== '' ? Number(values.salaryMin) : null,
      max: values.salaryMax !== '' ? Number(values.salaryMax) : null,
      currency: values.currency,
    },
    status: values.status,
    appliedDate: values.appliedDate || undefined,
    priority: values.priority,
    tags: values.tags
      ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    notes: values.notes.trim(),
  }
}

/**
 * ApplicationFormModal — create/edit modal for a Job application.
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {Function} onSubmit - async (id|null, payload) => void. Throws on failure.
 * @param {Object|null} job - job being edited, or null for create mode
 * @param {Array} companies - [{ _id, name }] for the "linked company" dropdown
 */
function ApplicationFormModal({ isOpen, onClose, onSubmit, job, companies = [] }) {
  const [values, setValues]   = useState(() => jobToFormValues(job))
  const [errors, setErrors]   = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = Boolean(job?._id)

  // Reset form whenever the modal opens or the target job changes
  useEffect(() => {
    if (isOpen) {
      setValues(jobToFormValues(job))
      setErrors({})
      setServerError('')
      setIsSubmitting(false)
    }
  }, [isOpen, job])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    const fieldErrors = validateJob(values)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values._id, formValuesToPayload(values))
    } catch (err) {
      setServerError(err.message || 'Failed to save application')
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit application' : 'Add application'}
      size="xl"
      footer={
        <>
          <button type="button" onClick={handleClose} className="btn-ghost py-2 px-4 text-sm" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="application-form" className="btn-primary py-2 px-4 text-sm" disabled={isSubmitting}>
            {isSubmitting && <ButtonSpinner />}
            {isEditMode ? 'Save changes' : 'Add application'}
          </button>
        </>
      }
    >
      {isEditMode && (
        <p className="text-xs text-slate-500 mb-4 -mt-1">{values.jobTitle} · {values.companyName}</p>
      )}

      {serverError && (
        <div className="mb-4 flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-rose-400 mt-0.5 shrink-0"><AlertCircleIcon width={14} height={14} /></span>
          <p className="text-sm text-rose-300">{serverError}</p>
        </div>
      )}

      <form id="application-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Job title + Company name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="jobTitle">Job title</label>
            <input
              id="jobTitle"
              name="jobTitle"
              value={values.jobTitle}
              onChange={handleChange}
              placeholder="Senior Frontend Engineer"
              maxLength={150}
              className={`field ${errors.jobTitle ? 'field-error' : ''}`}
            />
            {errors.jobTitle && (
              <p className="field-error-msg"><AlertCircleIcon width={14} height={14} />{errors.jobTitle}</p>
            )}
          </div>
          <div>
            <label className="field-label" htmlFor="companyName">Company name</label>
            <input
              id="companyName"
              name="companyName"
              value={values.companyName}
              onChange={handleChange}
              placeholder="Acme Inc."
              maxLength={100}
              className={`field ${errors.companyName ? 'field-error' : ''}`}
            />
            {errors.companyName && (
              <p className="field-error-msg"><AlertCircleIcon width={14} height={14} />{errors.companyName}</p>
            )}
          </div>
        </div>

        {/* Linked company + Job URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="company">
              Linked company <span className="text-slate-600">(optional)</span>
            </label>
            <select id="company" name="company" value={values.company} onChange={handleChange} className="field cursor-pointer">
              <option value="">— None —</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="jobUrl">Job posting URL</label>
            <input
              id="jobUrl"
              name="jobUrl"
              type="url"
              value={values.jobUrl}
              onChange={handleChange}
              placeholder="https://..."
              className={`field ${errors.jobUrl ? 'field-error' : ''}`}
            />
            {errors.jobUrl && (
              <p className="field-error-msg"><AlertCircleIcon width={14} height={14} />{errors.jobUrl}</p>
            )}
          </div>
        </div>

        {/* Location + Job type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={values.location}
              onChange={handleChange}
              placeholder="San Francisco, CA (Remote)"
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="jobType">Job type</label>
            <select id="jobType" name="jobType" value={values.jobType} onChange={handleChange} className="field cursor-pointer">
              <option value="">— Select —</option>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Salary range */}
        <div>
          <label className="field-label">Salary range</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              name="salaryMin"
              type="number"
              min="0"
              value={values.salaryMin}
              onChange={handleChange}
              placeholder="Min"
              aria-label="Minimum salary"
              className={`field ${errors.salaryMin ? 'field-error' : ''}`}
            />
            <input
              name="salaryMax"
              type="number"
              min="0"
              value={values.salaryMax}
              onChange={handleChange}
              placeholder="Max"
              aria-label="Maximum salary"
              className={`field ${errors.salaryMax ? 'field-error' : ''}`}
            />
            <select name="currency" value={values.currency} onChange={handleChange} className="field cursor-pointer" aria-label="Currency">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {errors.salaryMin && (
            <p className="field-error-msg"><AlertCircleIcon width={14} height={14} />{errors.salaryMin}</p>
          )}
          {errors.salaryMax && (
            <p className="field-error-msg"><AlertCircleIcon width={14} height={14} />{errors.salaryMax}</p>
          )}
        </div>

        {/* Status + Priority + Applied date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="field-label" htmlFor="status">Status</label>
            <select id="status" name="status" value={values.status} onChange={handleChange} className="field cursor-pointer">
              {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="priority">Priority</label>
            <select id="priority" name="priority" value={values.priority} onChange={handleChange} className="field cursor-pointer">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="appliedDate">Applied date</label>
            <input
              id="appliedDate"
              name="appliedDate"
              type="date"
              value={values.appliedDate}
              onChange={handleChange}
              className="field"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="field-label" htmlFor="tags">
            Tags <span className="text-slate-600">(comma separated)</span>
          </label>
          <input
            id="tags"
            name="tags"
            value={values.tags}
            onChange={handleChange}
            placeholder="remote, dream-job, referral"
            className="field"
          />
        </div>

        {/* Job description */}
        <div>
          <label className="field-label" htmlFor="jobDescription">Job description</label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            value={values.jobDescription}
            onChange={handleChange}
            rows={3}
            placeholder="Paste the job description or key responsibilities..."
            className="field resize-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="field-label" htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={values.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Referral details, recruiter contact, prep notes..."
            className="field resize-none"
          />
        </div>
      </form>
    </Modal>
  )
}

export default ApplicationFormModal