import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import { ButtonSpinner } from './Loader'
import { AlertCircleIcon, PlusIcon, TrashIcon } from './Icons'
import { COMPANY_SIZES } from '../utils/constants'
import { validateCompany, validateRecruiterEmail } from '../utils/validators'
import { isValidURL } from '../utils/validationUtils'

const EMPTY_RECRUITER = { name: '', email: '', phone: '', designation: '', linkedIn: '' }

const EMPTY_FORM = {
  _id: null,
  name: '',
  website: '',
  industry: '',
  location: '',
  size: '',
  recruiters: [],
  notes: '',
}

/**
 * Converts a Company document from the API into form state.
 */
function companyToFormValues(company) {
  if (!company) return { ...EMPTY_FORM }

  return {
    _id: company._id,
    name: company.name || '',
    website: company.website || '',
    industry: company.industry || '',
    location: company.location || '',
    size: company.size || '',
    recruiters: (company.recruiters || []).map((r) => ({
      name: r.name || '',
      email: r.email || '',
      phone: r.phone || '',
      designation: r.designation || '',
      linkedIn: r.linkedIn || '',
    })),
    notes: company.notes || '',
  }
}

/**
 * Converts form state into the payload expected by POST/PUT /api/companies.
 * Drops fully-empty recruiter rows.
 */
function formValuesToPayload(values) {
  return {
    name: values.name.trim(),
    website: values.website.trim(),
    industry: values.industry.trim(),
    location: values.location.trim(),
    size: values.size,
    recruiters: values.recruiters
      .filter((r) => Object.values(r).some((v) => v.trim() !== ''))
      .map((r) => ({
        name: r.name.trim(),
        email: r.email.trim(),
        phone: r.phone.trim(),
        designation: r.designation.trim(),
        linkedIn: r.linkedIn.trim(),
      })),
    notes: values.notes.trim(),
  }
}

/**
 * CompanyFormModal — create/edit modal for a Company document.
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {Function} onSubmit - async (id|null, payload) => void. Throws on failure.
 * @param {Object|null} company - company being edited, or null for create mode
 */
function CompanyFormModal({ isOpen, onClose, onSubmit, company }) {
  const [values, setValues]   = useState(() => companyToFormValues(company))
  const [errors, setErrors]   = useState({})
  const [recruiterErrors, setRecruiterErrors] = useState([])
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = Boolean(company?._id)

  // Reset form whenever the modal opens or the target company changes
  useEffect(() => {
    if (isOpen) {
      setValues(companyToFormValues(company))
      setErrors({})
      setRecruiterErrors([])
      setServerError('')
      setIsSubmitting(false)
    }
  }, [isOpen, company])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // ── Recruiter row helpers ───────────────────────────────────
  const addRecruiter = () => {
    setValues((prev) => ({ ...prev, recruiters: [...prev.recruiters, { ...EMPTY_RECRUITER }] }))
  }

  const removeRecruiter = (index) => {
    setValues((prev) => ({
      ...prev,
      recruiters: prev.recruiters.filter((_, i) => i !== index),
    }))
    setRecruiterErrors((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRecruiterChange = (index, field, value) => {
    setValues((prev) => ({
      ...prev,
      recruiters: prev.recruiters.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }))
    setRecruiterErrors((prev) => {
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

    const fieldErrors = validateCompany(values)

    // Validate each recruiter row's email and LinkedIn URL format.
    // Name/designation/phone remain free text by design.
    const recruiterFieldErrors = values.recruiters.map((recruiter) => {
      const rowErrors = {}
      const emailError = validateRecruiterEmail(recruiter)
      if (emailError) rowErrors.email = emailError

      const linkedInError = isValidURL(recruiter.linkedIn)
      if (linkedInError) rowErrors.linkedIn = linkedInError

      return rowErrors
    })

    const hasRecruiterErrors = recruiterFieldErrors.some((row) => Object.keys(row).length > 0)

    if (Object.keys(fieldErrors).length > 0 || hasRecruiterErrors) {
      setErrors(fieldErrors)
      setRecruiterErrors(recruiterFieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values._id, formValuesToPayload(values))
    } catch (err) {
      setServerError(err.message || 'Failed to save company')
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit company' : 'Add company'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={handleClose} className="btn-ghost py-2 px-4 text-sm" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" form="company-form" className="btn-primary py-2 px-4 text-sm" disabled={isSubmitting}>
            {isSubmitting && <ButtonSpinner />}
            {isEditMode ? 'Save changes' : 'Add company'}
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

      <form id="company-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Name + Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="name">Company name</label>
            <input
              id="name"
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder="Acme Inc."
              maxLength={100}
              className={`field ${errors.name ? 'field-error' : ''}`}
            />
            {errors.name && (
              <p className="field-error-msg"><AlertCircleIcon width={14} height={14} />{errors.name}</p>
            )}
          </div>
          <div>
            <label className="field-label" htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              value={values.website}
              onChange={handleChange}
              placeholder="https://acme.com"
              className={`field ${errors.website ? 'field-error' : ''}`}
            />
            {errors.website && (
              <p className="field-error-msg"><AlertCircleIcon width={14} height={14} />{errors.website}</p>
            )}
          </div>
        </div>

        {/* Industry + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="industry">Industry</label>
            <input
              id="industry"
              name="industry"
              value={values.industry}
              onChange={handleChange}
              placeholder="Technology, Finance, Healthcare..."
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={values.location}
              onChange={handleChange}
              placeholder="San Francisco, CA"
              className="field"
            />
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="field-label" htmlFor="size">Company size</label>
          <select id="size" name="size" value={values.size} onChange={handleChange} className="field cursor-pointer">
            <option value="">— Select —</option>
            {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
          </select>
        </div>

        {/* Recruiters */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="field-label mb-0">Recruiter contacts</label>
            <button
              type="button"
              onClick={addRecruiter}
              className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              <PlusIcon width={14} height={14} />
              Add recruiter
            </button>
          </div>

          {values.recruiters.length === 0 ? (
            <p className="text-xs text-slate-600 py-2">No recruiter contacts added.</p>
          ) : (
            <div className="space-y-3">
              {values.recruiters.map((recruiter, index) => (
                <div key={index} className="p-3 rounded-xl border border-slate-700/60 bg-slate-900/40 relative">
                  <button
                    type="button"
                    onClick={() => removeRecruiter(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    aria-label="Remove recruiter"
                    title="Remove"
                  >
                    <TrashIcon width={14} height={14} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-8">
                    <input
                      value={recruiter.name}
                      onChange={(e) => handleRecruiterChange(index, 'name', e.target.value)}
                      placeholder="Name"
                      className="field py-2 text-sm"
                    />
                    <input
                      value={recruiter.designation}
                      onChange={(e) => handleRecruiterChange(index, 'designation', e.target.value)}
                      placeholder="Designation"
                      className="field py-2 text-sm"
                    />
                    <div>
                      <input
                        value={recruiter.email}
                        onChange={(e) => handleRecruiterChange(index, 'email', e.target.value)}
                        placeholder="Email"
                        type="email"
                        className={`field py-2 text-sm ${recruiterErrors[index]?.email ? 'field-error' : ''}`}
                      />
                      {recruiterErrors[index]?.email && (
                        <p className="field-error-msg"><AlertCircleIcon width={13} height={13} />{recruiterErrors[index].email}</p>
                      )}
                    </div>
                    <input
                      value={recruiter.phone}
                      onChange={(e) => handleRecruiterChange(index, 'phone', e.target.value)}
                      placeholder="Phone"
                      className="field py-2 text-sm"
                    />
                    <div className="sm:col-span-2">
                      <input
                        value={recruiter.linkedIn}
                        onChange={(e) => handleRecruiterChange(index, 'linkedIn', e.target.value)}
                        placeholder="LinkedIn URL"
                        className={`field py-2 text-sm w-full ${recruiterErrors[index]?.linkedIn ? 'field-error' : ''}`}
                      />
                      {recruiterErrors[index]?.linkedIn && (
                        <p className="field-error-msg"><AlertCircleIcon width={13} height={13} />{recruiterErrors[index].linkedIn}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            placeholder="General notes about this company, culture, interview process..."
            className="field resize-none"
          />
        </div>
      </form>
    </Modal>
  )
}

export default CompanyFormModal