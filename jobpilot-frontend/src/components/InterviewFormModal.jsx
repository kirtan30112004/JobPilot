import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import { ButtonSpinner } from './Loader'
import { AlertCircleIcon, PlusIcon, TrashIcon, StarIcon } from './Icons'
import {
  INTERVIEW_TYPES, INTERVIEW_STATUSES, INTERVIEW_MODES,
} from '../utils/constants'
import { toDateTimeLocal } from '../utils/format'
import { validateInterview, validateInterviewerEmail } from '../utils/validators'

const EMPTY_INTERVIEWER = { name: '', designation: '', email: '' }

const EMPTY_FORM = {
  _id: null,
  job: '',
  title: '',
  type: 'Phone Screen',
  scheduledDate: '',
  duration: 60,
  mode: 'Online',
  location: '',
  interviewers: [],
  status: 'Scheduled',
  feedback: '',
  rating: '',
  preparationNotes: '',
}

/**
 * Converts an Interview document from the API into form state.
 */
function interviewToFormValues(interview) {
  if (!interview) return { ...EMPTY_FORM }

  return {
    _id: interview._id,
    job: interview.job?._id || interview.job || '',
    title: interview.title || '',
    type: interview.type || 'Phone Screen',
    scheduledDate: toDateTimeLocal(interview.scheduledDate),
    duration: interview.duration ?? 60,
    mode: interview.mode || 'Online',
    location: interview.location || '',
    interviewers: (interview.interviewers || []).map((i) => ({
      name: i.name || '',
      designation: i.designation || '',
      email: i.email || '',
    })),
    status: interview.status || 'Scheduled',
    feedback: interview.feedback || '',
    rating: interview.rating ?? '',
    preparationNotes: interview.preparationNotes || '',
  }
}

/**
 * Converts form state into the payload expected by POST/PUT /api/interviews.
 * Drops fully-empty interviewer rows.
 */
function formValuesToPayload(values) {
  return {
    job: values.job,
    title: values.title.trim(),
    type: values.type,
    scheduledDate: values.scheduledDate
      ? new Date(values.scheduledDate).toISOString()
      : undefined,
    duration: values.duration !== '' ? Number(values.duration) : undefined,
    mode: values.mode,
    location: values.location.trim(),
    interviewers: values.interviewers
      .filter((i) => Object.values(i).some((v) => v.trim() !== ''))
      .map((i) => ({
        name: i.name.trim(),
        designation: i.designation.trim(),
        email: i.email.trim(),
      })),
    status: values.status,
    feedback: values.feedback.trim(),
    rating: values.rating !== '' ? Number(values.rating) : null,
    preparationNotes: values.preparationNotes.trim(),
  }
}

/**
 * InterviewFormModal — schedule/edit modal for an Interview document.
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {Function} onSubmit - async (id|null, payload) => void. Throws on failure.
 * @param {Object|null} interview - interview being edited, or null for create mode
 * @param {Array} jobs - [{ _id, jobTitle, companyName }] for the "application" dropdown
 * @param {string|null} defaultJobId - preselected job ID when scheduling from a job's context
 */
function InterviewFormModal({ isOpen, onClose, onSubmit, interview, jobs = [], defaultJobId = null }) {
  const [values, setValues]   = useState(() => interviewToFormValues(interview))
  const [errors, setErrors]   = useState({})
  const [interviewerErrors, setInterviewerErrors] = useState([])
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = Boolean(interview?._id)

  // Reset form whenever the modal opens or the target interview changes
  useEffect(() => {
    if (isOpen) {
      const base = interviewToFormValues(interview)
      if (!interview && defaultJobId) base.job = defaultJobId
      setValues(base)
      setErrors({})
      setInterviewerErrors([])
      setServerError('')
      setIsSubmitting(false)
    }
  }, [isOpen, interview, defaultJobId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // ── Interviewer row helpers ──────────────────────────────────
  const addInterviewer = () => {
    setValues((prev) => ({ ...prev, interviewers: [...prev.interviewers, { ...EMPTY_INTERVIEWER }] }))
  }

  const removeInterviewer = (index) => {
    setValues((prev) => ({
      ...prev,
      interviewers: prev.interviewers.filter((_, i) => i !== index),
    }))
    setInterviewerErrors((prev) => prev.filter((_, i) => i !== index))
  }

  const handleInterviewerChange = (index, field, value) => {
    setValues((prev) => ({
      ...prev,
      interviewers: prev.interviewers.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    }))
    setInterviewerErrors((prev) => {
      if (!prev[index]) return prev
      const next = [...prev]
      next[index] = { ...next[index], [field]: '' }
      return next
    })
  }

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    const fieldErrors = validateInterview(values)

    // Validate each interviewer row's email format.
    // Name/designation remain free text by design.
    const interviewerFieldErrors = values.interviewers.map((person) => {
      const rowErrors = {}
      const emailError = validateInterviewerEmail(person)
      if (emailError) rowErrors.email = emailError
      return rowErrors
    })

    const hasInterviewerErrors = interviewerFieldErrors.some((row) => Object.keys(row).length > 0)

    if (Object.keys(fieldErrors).length > 0 || hasInterviewerErrors) {
      setErrors(fieldErrors)
      setInterviewerErrors(interviewerFieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values._id, formValuesToPayload(values))
    } catch (err) {
      setServerError(err.message || 'Failed to save interview')
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit interview' : 'Schedule interview'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={handleClose} className="btn-ghost py-2 px-4 text-sm" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="interview-form" className="btn-primary py-2 px-4 text-sm" disabled={isSubmitting}>
            {isSubmitting && <ButtonSpinner />}
            {isEditMode ? 'Save changes' : 'Schedule interview'}
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

      <form id="interview-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Application + Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="job">Application</label>
            <select
              id="job"
              name="job"
              value={values.job}
              onChange={handleChange}
              className={`field cursor-pointer ${errors.job ? 'field-error' : ''}`}
              disabled={isEditMode}
            >
              <option value="">— Select application —</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>{j.jobTitle} · {j.companyName}</option>
              ))}
            </select>
            {errors.job && (
              <p className="field-error-msg"><AlertCircleIcon width={14} height={14} />{errors.job}</p>
            )}
          </div>
          <div>
            <label className="field-label" htmlFor="title">Interview title</label>
            <input
              id="title"
              name="title"
              value={values.title}
              onChange={handleChange}
              placeholder="Technical Screen - Round 1"
              className={`field ${errors.title ? 'field-error' : ''}`}
            />
            {errors.title && (
              <p className="field-error-msg"><AlertCircleIcon width={14} height={14} />{errors.title}</p>
            )}
          </div>
        </div>

        {/* Type + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="type">Interview type</label>
            <select id="type" name="type" value={values.type} onChange={handleChange} className="field cursor-pointer">
              {INTERVIEW_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="status">Status</label>
            <select id="status" name="status" value={values.status} onChange={handleChange} className="field cursor-pointer">
              {INTERVIEW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Scheduled date + Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="scheduledDate">Scheduled date &amp; time</label>
            <input
              id="scheduledDate"
              name="scheduledDate"
              type="datetime-local"
              value={values.scheduledDate}
              onChange={handleChange}
              className={`field ${errors.scheduledDate ? 'field-error' : ''}`}
            />
            {errors.scheduledDate && (
              <p className="field-error-msg"><AlertCircleIcon width={14} height={14} />{errors.scheduledDate}</p>
            )}
          </div>
          <div>
            <label className="field-label" htmlFor="duration">Duration (minutes)</label>
            <input
              id="duration"
              name="duration"
              type="number"
              min="0"
              step="5"
              value={values.duration}
              onChange={handleChange}
              placeholder="60"
              className="field"
            />
          </div>
        </div>

        {/* Mode + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="mode">Mode</label>
            <select id="mode" name="mode" value={values.mode} onChange={handleChange} className="field cursor-pointer">
              {INTERVIEW_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="location">
              {values.mode === 'Online' ? 'Meeting link' : 'Location'}
            </label>
            <input
              id="location"
              name="location"
              value={values.location}
              onChange={handleChange}
              placeholder={values.mode === 'Online' ? 'https://meet.google.com/...' : 'Office address'}
              className="field"
            />
          </div>
        </div>

        {/* Interviewers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="field-label mb-0">Interviewers</label>
            <button
              type="button"
              onClick={addInterviewer}
              className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              <PlusIcon width={14} height={14} />
              Add interviewer
            </button>
          </div>

          {values.interviewers.length === 0 ? (
            <p className="text-xs text-slate-600 py-2">No interviewers added.</p>
          ) : (
            <div className="space-y-3">
              {values.interviewers.map((person, index) => (
                <div key={index} className="p-3 rounded-xl border border-slate-700/60 bg-slate-900/40 relative">
                  <button
                    type="button"
                    onClick={() => removeInterviewer(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    aria-label="Remove interviewer"
                    title="Remove"
                  >
                    <TrashIcon width={14} height={14} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pr-8">
                    <input
                      value={person.name}
                      onChange={(e) => handleInterviewerChange(index, 'name', e.target.value)}
                      placeholder="Name"
                      className="field py-2 text-sm"
                    />
                    <input
                      value={person.designation}
                      onChange={(e) => handleInterviewerChange(index, 'designation', e.target.value)}
                      placeholder="Designation"
                      className="field py-2 text-sm"
                    />
                    <input
                      value={person.email}
                      onChange={(e) => handleInterviewerChange(index, 'email', e.target.value)}
                      placeholder="Email"
                      type="email"
                      className="field py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preparation notes */}
        <div>
          <label className="field-label" htmlFor="preparationNotes">Preparation notes</label>
          <textarea
            id="preparationNotes"
            name="preparationNotes"
            value={values.preparationNotes}
            onChange={handleChange}
            rows={3}
            placeholder="Topics to review, questions to ask, things to bring..."
            className="field resize-none"
          />
        </div>

        {/* Feedback + Rating (shown once scheduled / after the fact) */}
        <div className="pt-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-3 pt-3">
            <label className="field-label mb-0">Feedback &amp; rating</label>
            <span className="text-2xs text-slate-600">Add after the interview</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start">
            <textarea
              name="feedback"
              value={values.feedback}
              onChange={handleChange}
              rows={3}
              placeholder="How did it go? Strengths, weaknesses, follow-up items..."
              className="field resize-none"
            />

            {/* Rating selector */}
            <div className="flex sm:flex-col items-center sm:items-start gap-2">
              <span className="text-2xs text-slate-500 uppercase tracking-wider hidden sm:block">Rating</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setValues((prev) => ({ ...prev, rating: prev.rating === n ? '' : n }))}
                    className={`transition-colors ${Number(values.rating) >= n ? 'text-amber-400' : 'text-slate-700 hover:text-slate-500'}`}
                    aria-label={`Rate ${n} out of 5`}
                  >
                    <StarIcon width={20} height={20} filled={Number(values.rating) >= n} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default InterviewFormModal