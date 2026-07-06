import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Icon Components ───────────────────────────────────────────
function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}
function PilotStarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2L13 8L19 9L14.5 13.5L15.5 19.5L10 16.5L4.5 19.5L5.5 13.5L1 9L7 8L10 2Z" fill="white" fillOpacity="0.92"/>
    </svg>
  )
}

/**
 * Navbar — sticky top bar.
 *
 * - Mobile (< md): shows a hamburger that opens the Sidebar's slide-out
 *   drawer via `onMenuClick`. Hidden from `md` upward since the Sidebar
 *   itself becomes persistently visible (icon rail on tablet, full
 *   column on desktop) at that point.
 * - Always shows the logo, and a user dropdown (name + chevron hidden
 *   below `sm` to save space) when authenticated, or Sign in / Get
 *   started links when not.
 *
 * @param {Function} onMenuClick - opens the mobile sidebar drawer
 */
function Navbar({ onMenuClick }) {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
    navigate('/login')
  }

  // Initials avatar
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Left: hamburger (mobile, authenticated) + Logo ── */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                className="md:hidden -ml-2 p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                onClick={onMenuClick}
                aria-label="Open menu"
              >
                <MenuIcon />
              </button>
            )}

            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-glow-violet group-hover:bg-violet-500 transition-colors">
                <PilotStarIcon />
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">
                Job<span className="text-gradient">Pilot</span>
              </span>
            </Link>
          </div>

          {/* ── Right side ─────────────────────────────── */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-150"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white leading-none">
                    {initials}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-300 max-w-[120px] truncate">
                    {user?.name || 'Account'}
                  </span>
                  <span className={`hidden sm:inline text-slate-500 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon />
                  </span>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass-card shadow-card-hover py-1 animate-slide-up">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-700/50">
                      <p className="text-sm font-semibold text-slate-100 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
                      >
                        <UserIcon />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-slate-700/50 transition-colors"
                      >
                        <LogOutIcon />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost py-2 px-4 text-sm">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar