import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NotFound() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 bg-mesh px-6 py-20">
      {/* Entrance animation wrapper */}
      <div className="flex flex-col items-center text-center max-w-md w-full animate-slide-up">

        {/* JobPilot brand mark */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-glow-violet">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 2L13 8L19 9L14.5 13.5L15.5 19.5L10 16.5L4.5 19.5L5.5 13.5L1 9L7 8L10 2Z"
                fill="white"
                fillOpacity="0.92"
              />
            </svg>
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">
            Job<span className="text-gradient">Pilot</span>
          </span>
        </div>

        {/* 404 number */}
        <div className="relative mb-6">
          <p className="font-display text-[120px] sm:text-[160px] font-bold leading-none text-gradient select-none">
            404
          </p>
          {/* Subtle glow behind the number */}
          <div className="absolute inset-0 blur-3xl opacity-20 bg-violet-600 rounded-full pointer-events-none" />
        </div>

        {/* Heading */}
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
          Page not found
        </h1>

        {/* Friendly message */}
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-10 max-w-sm">
          The page you're looking for doesn't exist or may have been moved.
          Let's get your job search back on track.
        </p>

        {/* CTA button */}
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn-primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to dashboard
          </Link>
        ) : (
          <Link to="/login" className="btn-primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to sign in
          </Link>
        )}

        {/* Secondary help link */}
        <p className="mt-6 text-xs text-slate-600">
          If you think this is a mistake,{' '}
          <a
            href="mailto:support@jobpilot.app"
            className="text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
          >
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export default NotFound