import { useState, useCallback } from 'react'

/**
 * useFormValidation — reusable form state and validation hook.
 *
 * Used by Login, Register, and all CRUD form modals (Application,
 * Company, Interview, Reminder) throughout JobPilot.
 *
 * @param {Object}   initialValues - { [fieldName]: initialValue }
 * @param {Function} [validateFn]  - (values) => ({ [fieldName]: errorMessage } | {})
 *                                   Return an empty object when the form is valid.
 *
 * @returns {{
 *   values:         Object,
 *   errors:         Object,
 *   touched:        Object,
 *   isSubmitting:   boolean,
 *   setIsSubmitting: Function,
 *   handleChange:   Function,   // attach to input onChange
 *   handleBlur:     Function,   // attach to input onBlur
 *   validate:       Function,   // () => boolean — runs full validation, marks all touched
 *   reset:          Function,   // resets to initialValues
 *   setFieldValue:  Function,   // (name, value) => void — programmatic field update
 *   setFieldError:  Function,   // (name, message) => void — programmatic error set
 *   setValues:      Function,   // direct state setter for bulk value replacement
 * }}
 */
function useFormValidation(initialValues, validateFn) {
  const [values,      setValues]      = useState(initialValues)
  const [errors,      setErrors]      = useState({})
  const [touched,     setTouched]     = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handles onChange for any <input>, <select>, or <textarea>.
   * Reads e.target.name to update the correct field.
   * Clears that field's error on change so stale messages disappear
   * the moment the user starts correcting their input.
   * Supports checkboxes via e.target.type === 'checkbox'.
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const nextValue = type === 'checkbox' ? checked : value

    setValues((prev) => ({ ...prev, [name]: nextValue }))

    // Clear the error for this field as soon as the user edits it
    setErrors((prev) => {
      if (!prev[name]) return prev
      return { ...prev, [name]: '' }
    })
  }, [])

  /**
   * Handles onBlur for any field.
   * Marks the field as touched and runs per-field validation
   * immediately so errors appear as soon as the user leaves a field,
   * rather than only on submit.
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target

    setTouched((prev) => ({ ...prev, [name]: true }))

    if (validateFn) {
      // Run the full validator but only surface the error for the
      // field that just lost focus; other fields are unchanged.
      setValues((currentValues) => {
        const fieldErrors = validateFn(currentValues)
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: fieldErrors[name] || '',
        }))
        return currentValues
      })
    }
  }, [validateFn])

  /**
   * Runs full-form validation, marks every field as touched so all
   * errors become visible, and returns a boolean indicating whether
   * the form is valid. Call this at the top of your submit handler
   * before making any API request.
   *
   * @returns {boolean} true if the form has no errors
   */
  const validate = useCallback(() => {
    if (!validateFn) return true

    const fieldErrors = validateFn(values)
    setErrors(fieldErrors)

    // Mark every field as touched so all error messages render
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    )
    setTouched(allTouched)

    return Object.keys(fieldErrors).length === 0
  }, [values, validateFn])

  /**
   * Resets the form to its initial state.
   * Call after a successful submission or when the user dismisses
   * a modal without saving.
   */
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  /**
   * Programmatically update a single field's value without needing
   * a synthetic event. Useful for controlled selects, date pickers,
   * or any custom input that doesn't fire a standard onChange event.
   *
   * @param {string} name  - field name matching a key in initialValues
   * @param {*}      value - new value for that field
   */
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  /**
   * Programmatically set a single field's error message.
   * Useful for surfacing server-side validation errors against
   * specific fields after a failed API request.
   *
   * @param {string} name    - field name
   * @param {string} message - error message to display ('' to clear)
   */
  const setFieldError = useCallback((name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }))
  }, [])

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    // State setters (used directly by consuming pages to set isSubmitting etc.)
    setIsSubmitting,
    setValues,
    // Event handlers (attach directly to input props)
    handleChange,
    handleBlur,
    // Validation
    validate,
    // Utilities
    reset,
    setFieldValue,
    setFieldError,
  }
}

export default useFormValidation