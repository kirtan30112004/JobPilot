import React, { useEffect, useRef } from 'react'

// ── Icon ─────────────────────────────────────────────────────
function XIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

/**
 * Modal — generic dialog overlay used for create/edit forms and
 * read-only detail panels throughout JobPilot.
 *
 * Props (matching call-sites in ApplicationFormModal,
 * CompanyFormModal, InterviewFormModal, ReminderFormModal,
 * and the CompanyDetailModal inline component in Companies.jsx):
 *
 * @param {boolean}     isOpen    - controls visibility
 * @param {Function}    onClose   - called to dismiss the dialog
 * @param {string}      title     - dialog heading
 * @param {string}      [subtitle]- optional muted sub-heading
 * @param {ReactNode}   children  - form or content (scrollable)
 * @param {ReactNode}   [footer]  - action buttons (sticky footer row)
 * @param {'sm'|'md'|'lg'|'xl'} [size='md'] - max-width
 */
function Modal({ isOpen, onClose, title, subtitle, children, footer, size = 'md' }) {
  const dialogRef = useRef(null)

  // Close on Escape; lock body scroll
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Max-width classes keyed by the `size` prop.
  // 'xl' added for ApplicationFormModal which requests it.
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  }

  const handleBackdropMouseDown = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onMouseDown={handleBackdropMouseDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={dialogRef}
        className={`w-full ${sizeClasses[size] ?? sizeClasses.md} glass-card shadow-card-hover max-h-[90dvh] flex flex-col animate-slide-up`}
      >
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-700/50 shrink-0">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="font-display text-lg font-bold text-white leading-tight"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800 shrink-0"
            aria-label="Close dialog"
          >
            <XIcon />
          </button>
        </div>

        {/* ── Body (scrollable) ────────────────────────────── */}
        <div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* ── Footer (optional sticky action row) ─────────── */}
        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-700/50 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal