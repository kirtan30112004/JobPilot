import React from 'react'

// ── Spinner SVG ───────────────────────────────────────────────
function Spinner({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      aria-hidden="true"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="12"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Full-Screen Loader (for route-level suspense / auth check) ──
export function FullPageLoader({ message = 'Loading...' }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center
                 bg-slate-950 bg-mesh"
      role="status"
      aria-label={message}
    >
      {/* Logo mark */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-glow-violet">
          <PilotIcon />
        </div>
        <span className="font-display text-xl font-bold text-white tracking-tight">
          Job<span className="text-gradient">Pilot</span>
        </span>
      </div>

      {/* Spinner */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center">
          <Spinner size={20} className="text-violet-500" />
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-pulse-slow" />
      </div>

      <p className="mt-5 text-sm text-slate-500 font-medium">{message}</p>
    </div>
  )
}

// ── Inline Button Spinner ─────────────────────────────────────
export function ButtonSpinner({ size = 16 }) {
  return <Spinner size={size} className="text-current" />
}

// ── Section Loader ────────────────────────────────────────────
export function SectionLoader({ message = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4" role="status">
      <Spinner size={28} className="text-violet-500" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}

// ── Pilot icon SVG ────────────────────────────────────────────
function PilotIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2L13 8L19 9L14.5 13.5L15.5 19.5L10 16.5L4.5 19.5L5.5 13.5L1 9L7 8L10 2Z"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  )
}

export default FullPageLoader