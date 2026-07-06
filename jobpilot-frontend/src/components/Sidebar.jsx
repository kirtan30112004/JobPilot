import React from 'react'
import { NavLink, Link } from 'react-router-dom'

// ── Icons ─────────────────────────────────────────────────────
function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}
function BriefcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <path d="M2 12h20"/>
    </svg>
  )
}
function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
function PilotStarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2L13 8L19 9L14.5 13.5L15.5 19.5L10 16.5L4.5 19.5L5.5 13.5L1 9L7 8L10 2Z" fill="white" fillOpacity="0.92"/>
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',    icon: GridIcon },
  { to: '/jobs',       label: 'Applications', icon: BriefcaseIcon },
  { to: '/companies',  label: 'Companies',    icon: BuildingIcon },
  { to: '/interviews', label: 'Interviews',   icon: CalendarIcon },
  { to: '/reminders',  label: 'Reminders',    icon: BellIcon },
]

const navLinkClass = ({ isActive }) =>
  [
    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
    isActive
      ? 'bg-violet-600/15 text-violet-400'
      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70',
  ].join(' ')

const railLinkClass = ({ isActive }) =>
  [
    'flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-150',
    isActive
      ? 'bg-violet-600/15 text-violet-400'
      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70',
  ].join(' ')

/**
 * SidebarContent — shared full-width nav markup (labels + icons)
 * used by both the desktop persistent sidebar and the mobile
 * slide-out drawer.
 */
function SidebarContent({ onNavigate }) {
  return (
    <div className="flex flex-col h-full px-4 py-6">
      {/* Quick action */}
      <Link
        to="/jobs?new=1"
        onClick={onNavigate}
        className="btn-primary w-full mb-6 text-sm py-2.5"
      >
        <PlusIcon />
        Add application
      </Link>

      {/* Nav links */}
      <nav className="space-y-1 flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass} onClick={onNavigate}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / brand mark */}
      <div className="pt-4 mt-4 border-t border-slate-800/60">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60">
          <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center shrink-0">
            <PilotStarIcon />
          </div>
          <p className="text-2xs text-slate-500 leading-tight">
            Track every application with <span className="text-slate-300 font-medium">JobPilot</span>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * RailContent — collapsed, icon-only nav for the tablet tier
 * (md to lg, ~768–1023px). Gives tablets a persistent, always-visible
 * navigation rail instead of falling back to a hidden drawer, while
 * staying narrow enough not to crowd content at intermediate widths.
 * Tooltips (native `title`) compensate for the missing text labels.
 */
function RailContent() {
  return (
    <div className="flex flex-col items-center h-full py-6">
      <Link
        to="/jobs?new=1"
        className="w-11 h-11 rounded-xl bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white shadow-glow-violet transition-colors mb-6 shrink-0"
        title="Add application"
        aria-label="Add application"
      >
        <PlusIcon />
      </Link>

      <nav className="flex flex-col items-center gap-1.5 flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={railLinkClass} title={label} aria-label={label}>
            <Icon />
          </NavLink>
        ))}
      </nav>

      <div className="w-9 h-9 rounded-lg bg-slate-900/60 flex items-center justify-center shrink-0">
        <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
          <PilotStarIcon />
        </div>
      </div>
    </div>
  )
}

/**
 * Sidebar — persistent left-hand navigation, optimized per breakpoint:
 *
 * - Mobile  (< md, < 768px):  hidden; replaced by a slide-out drawer
 *   controlled by `isMobileOpen` / `onMobileClose` (toggled from the
 *   Navbar's hamburger, which itself is `md:hidden`).
 * - Tablet  (md – lg, 768–1023px): collapsed icon-only rail (`w-16`),
 *   always visible — gives tablets real persistent navigation instead
 *   of hiding it behind a drawer, without eating into the narrower
 *   content width available at this tier.
 * - Desktop (lg+, 1024px+): full-width column (`w-60`) with icons
 *   and text labels.
 *
 * @param {boolean} isMobileOpen
 * @param {Function} onMobileClose
 */
function Sidebar({ isMobileOpen = false, onMobileClose }) {
  return (
    <>
      {/* ── Tablet icon rail (md to lg) ──────────────────── */}
      <aside className="hidden md:flex lg:hidden md:flex-col md:w-16 md:shrink-0 md:sticky md:top-16 md:h-[calc(100dvh-4rem)] border-r border-slate-800/60 bg-slate-950/40">
        <RailContent />
      </aside>

      {/* ── Desktop sidebar (lg+) ────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] border-r border-slate-800/60 bg-slate-950/40">
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer (< md) ─────────────────────────── */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={onMobileClose}
          />

          {/* Drawer panel */}
          <div className="relative w-72 max-w-[80vw] h-full bg-slate-950 border-r border-slate-800/60 shadow-card-hover animate-slide-up flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-glow-violet">
                  <PilotStarIcon />
                </div>
                <span className="font-display text-base font-bold text-white tracking-tight">
                  Job<span className="text-gradient">Pilot</span>
                </span>
              </div>
              <button
                onClick={onMobileClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <XIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <SidebarContent onNavigate={onMobileClose} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar