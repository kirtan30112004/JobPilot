import React, { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useFormValidation from '../hooks/useFormValidation'
import { validateLogin } from '../utils/validators'
import { ButtonSpinner } from '../components/Loader'
import { showError } from '../utils/toast'

// ── Icon helpers ──────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
function AlertCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

// ── Login Page ────────────────────────────────────────────────
function Login() {
  const { login, isAuthenticated, clearError, error: authError } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const from = location.state?.from || '/dashboard'

  const [showPassword, setShowPassword] = React.useState(false)
  const [serverError,  setServerError]  = React.useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, navigate, from])

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError()
    setServerError('')
  }, [clearError])

  const {
    values, errors, touched,
    isSubmitting, setIsSubmitting,
    handleChange, handleBlur, validate,
  } = useFormValidation({ email: '', password: '' }, validateLogin)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    const isValid = validate()
    if (!isValid) return

    setIsSubmitting(true)

    const result = await login(values.email.trim(), values.password)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      const message = result.message || 'Login failed. Check your credentials.'
      setServerError(message)
      showError(message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen-safe flex bg-slate-950 bg-mesh">
      {/* ── Left panel (decorative, desktop only) ─────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between p-12 relative overflow-hidden bg-slate-900/50 border-r border-slate-800/60">
        {/* Background orbs */}
        <div className="orb w-96 h-96 bg-violet-600 top-[-80px] left-[-80px]" />
        <div className="orb w-80 h-80 bg-cyan-500 bottom-[-60px] right-[-60px]" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-glow-violet">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L13 8L19 9L14.5 13.5L15.5 19.5L10 16.5L4.5 19.5L5.5 13.5L1 9L7 8L10 2Z" fill="white" fillOpacity="0.92"/>
            </svg>
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">
            Job<span className="text-gradient">Pilot</span>
          </span>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-white leading-tight mb-3">
              Your job search,<br />finally organized.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Track every application, interview, and follow-up in one clean dashboard.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              { label: 'Track every application status end-to-end', color: 'bg-violet-500' },
              { label: 'Schedule interviews and add feedback',       color: 'bg-cyan-500'   },
              { label: 'Never miss a follow-up deadline',            color: 'bg-emerald-500' },
              { label: 'Visualize your pipeline at a glance',        color: 'bg-amber-400'  },
            ].map((feat) => (
              <li key={feat.label} className="flex items-start gap-3">
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${feat.color}`} />
                <span className="text-sm text-slate-300">{feat.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 glass-card p-5">
          <p className="text-sm text-slate-300 italic leading-relaxed mb-3">
            "JobPilot turned a chaotic spreadsheet into a clear strategy. Landed my dream role in 6 weeks."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">A</div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Alex P.</p>
              <p className="text-2xs text-slate-500">Software Engineer</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ─────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-glow-violet">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L13 8L19 9L14.5 13.5L15.5 19.5L10 16.5L4.5 19.5L5.5 13.5L1 9L7 8L10 2Z" fill="white" fillOpacity="0.92"/>
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-white tracking-tight">
              Job<span className="text-gradient">Pilot</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to continue to your dashboard.</p>
          </div>

          {/* Server / auth error */}
          {(serverError || authError) && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 animate-fade-in">
              <span className="text-rose-400 mt-0.5 shrink-0"><AlertCircleIcon /></span>
              <p className="text-sm text-rose-300">{serverError || authError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="field-label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@gmail.com"
                className={`field ${touched.email && errors.email ? 'field-error' : ''}`}
                disabled={isSubmitting}
              />
              {touched.email && errors.email && (
                <p className="field-error-msg"><AlertCircleIcon />{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="field-label mb-0">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your password"
                  className={`field pr-11 ${touched.password && errors.password ? 'field-error' : ''}`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="field-error-msg"><AlertCircleIcon />{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><ButtonSpinner /> Signing in…</>
              ) : (
                <>Sign in <ArrowRightIcon /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7">
            <span className="divider-text">or</span>
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-slate-500">
            New to JobPilot?{' '}
            <Link
              to="/register"
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login