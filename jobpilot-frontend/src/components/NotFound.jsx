import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NotFound() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen-safe flex items-center justify-center bg-slate-950 bg-mesh px-6">
      <div className="text-center animate-slide-up max-w-md">
        {/* 404 number */}
        <p className="font-display text-8xl font-bold text-gradient leading-none mb-4">404</p>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          This page doesn't exist or may have been moved. Let's get you back on track.
        </p>
        <Link
          to={isAuthenticated ? '/dashboard' : '/login'}
          className="btn-primary"
        >
          {isAuthenticated ? 'Back to dashboard' : 'Go to sign in'}
        </Link>
      </div>
    </div>
  )
}

export default NotFound