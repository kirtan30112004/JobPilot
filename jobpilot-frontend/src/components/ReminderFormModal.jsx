import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import { ButtonSpinner } from './Loader'
import { AlertCircleIcon } from './Icons'
import { REMINDER_TYPES, PRIORITIES } from '../utils/constants'
import { toDateTimeLocal } from '../utils/format'
import { validateReminder } from '../utils/validators'

const EMPTY_FORM = {
  _id: null,
  title: '',
  description: '',
  type: 'Follow-Up',
  dueDate: '',
  job: '',
  priority: 'Medium',
}

/**
 * Converts a Reminder document from the API into form state.
 */
function reminderToFormValues(reminder) {
  if (!reminder) return { ...EMPTY_FORM }

  return {
    _id: reminder._id,
    title: reminder.title || '',
    description: reminder.description || '',
    type: reminder.type || 'Follow-Up',
    dueDate: toDateTimeLocal(reminder.dueDate),
    job: reminder.job?._id || reminder.job || '',
    priority: reminder.priority || 'Medium',
  }
}

/**
 * Converts form state into the payload expected by POST/PUT /api/reminders.
 */
function formValuesToPayload(values) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    type: values.type,
    dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
    job: values.job || null,
    priority: values.priority,
  }
}

/**
 * ReminderFormModal — create/edit modal for a Reminder document.
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {Function} onSubmit - async (id|null, payload) => void. Throws on failure.
 * @param {Object|null} reminder - reminder being edited, or null for create mode
 * @param {Array} jobs - [{ _id, jobTitle, companyName }] for the "linked application" dropdown
 * @param {string|null} defaultJobId - preselected job ID when creating from a job's context
 */
function ReminderFormModal({ isOpen, onClose, onSubmit, reminder, jobs = [], defaultJobId = null }) {
  const [values, setValues]   = useState(() => reminderToFormValues(reminder))
  const [errors, setErrors]   = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = Boolean(reminder?._id)

  // Reset form whenever the modal opens or the target reminder changes
  useEffect(() => {
    if (isOpen) {
      const base = reminderToFormValues(reminder)
      if (!reminder && defaultJobId) base.job = defaultJobId
      setValues(base)
      setErrors({})
      setServerError('')
      setIsSubmitting(false)
    }
  }, [isOpen, reminder, defaultJobId])

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

    const fieldErrors = validateReminder(values)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values._id, formValuesToPayload(values))
    } catch (err) {
      setServerError(err.message || 'Failed to save reminder')
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit reminder' : 'Add reminder'}
      size="md"
      footer={
        <>
          <button type="button" onClick={handleClose} className="btn-ghost py-2 px-4 text-sm" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="reminder-form" className="btn-primary py-2 px-4 text-sm" disabled={isSubmitting}>
            {isSubmitting && <ButtonSpinner />}
            {isEditMode ? 'Save changes' : 'Add reminder'}
          </button>
        </>
      }
    >
      {serverError && (
        <div className="mb-4 flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-rose-400 mt-0.5 shrink-0"><AlertCircleIcon width={14} height={14} /></span>
          <p className="text-sm text-rose-300">{serverError}</p>
        </div>
      )}

      <form id="reminder-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="field-label" htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            value={values.title}
            onChange={handleChange}
            placeholder="Follow up on application status"
            className={`field ${errors.title ? 'field-error' : ''}`}
          />
          {errors.title && (
            <p className="field-error-msg"><AlertCircleIcon width={14} height={14} />{errors.title}</p>
          )}
        </div>

        {/* Type + Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="type">Type</label>
            <select id="type" name="type" value={values.type} onChange={handleChange} className="field cursor-pointer">
              {REMINDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="priority">Priority</label>
            <select id="priority" name="priority" value={values.priority} onChange={handleChange} className="field cursor-pointer">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Due date */}
        <div>
          <label className="field-label" htmlFor="dueDate">Due date &amp; time</label>
          <input
            id="dueDate"
            name="dueDate"
            type="datetime-local"
            value={values.dueDate}
            onChange={handleChange}
            className={`field ${errors.dueDate ? 'field-error' : ''}`}
          />
          {errors.dueDate && (
            <p className="field-error-msg"><AlertCircleIcon width={14} height={14} />{errors.dueDate}</p>
          )}
        </div>

        {/* Linked application */}
        <div>
          <label className="field-label" htmlFor="job">
            Linked application <span className="text-slate-600">(optional)</span>
          </label>
          <select id="job" name="job" value={values.job} onChange={handleChange} className="field cursor-pointer">
            <option value="">— None —</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>{j.jobTitle} · {j.companyName}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="field-label" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleChange}
            rows={3}
            placeholder="Additional details or context for this reminder..."
            className="field resize-none"
          />
        </div>
      </form>
    </Modal>
  )
}

export default ReminderFormModal