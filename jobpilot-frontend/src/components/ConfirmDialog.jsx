import React, { useEffect, useRef } from 'react'
import { ButtonSpinner } from './Loader'

// ── Icons ────────────────────────────────────────────────────
function AlertTriangleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

/**
 * ConfirmDialog — generic destructive-action confirmation dialog.
 *
 * Props (matching call-sites in Applications, Companies,
 * Interviews, and Reminders pages):
 *
 * @param {boolean}   isOpen        - controls visibility
 * @param {Function}  onClose       - called to dismiss without confirming
 * @param {Function}  onConfirm     - called when the confirm button is clicked
 * @param {boolean}   isLoading     - shows a spinner and disables buttons while true
 * @param {string}    title         - dialog heading
 * @param {string}    message       - body text describing the consequence
 * @param {string}    [confirmLabel='Delete'] - confirm button label
 * @param {string}    [cancelLabel='Cancel']  - cancel button label
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}) {
  const dialogRef = useRef(null)
  const confirmBtnRef = useRef(null)

  // Close on Escape; trap focus; lock body scroll
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Auto-focus the confirm button for keyboard users
    const raf = requestAnimationFrame(() => {
      confirmBtnRef.current?.focus()
    })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      cancelAnimationFrame(raf)
    }
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  const handleBackdropMouseDown = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target) && !isLoading) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onMouseDown={handleBackdropMouseDown}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md glass-card shadow-card-hover animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-start gap-4 px-5 sm:px-6 pt-5 pb-4">
          {/* Warning icon badge */}
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
            <AlertTriangleIcon />
          </div>

          <div className="min-w-0">
            <h2
              id="confirm-dialog-title"
              className="font-display text-base font-bold text-white"
            >
              {title}
            </h2>
            {message && (
              <p
                id="confirm-dialog-message"
                className="text-sm text-slate-400 mt-1 leading-relaxed"
              >
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-slate-700/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn-ghost py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <ButtonSpinner />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog