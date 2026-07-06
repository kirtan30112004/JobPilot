import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useFormValidation from '../hooks/useFormValidation'
import { validateRegister } from '../utils/validators'
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
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
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

// ── Password strength indicator ───────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 6 characters', passed: password.length >= 6 },
    { label: 'Contains a number',     passed: /\d/.test(password)   },
    { label: 'Mix of characters',     passed: /[a-zA-Z]/.test(password) && password.length > 0 },
  ]

  const passed = checks.filter((c) => c.passed).length
  const colors = ['bg-rose-500', 'bg-amber-400', 'bg-emerald-500']
  const labels = ['Weak', 'Fair', 'Strong']

  if (!password) return null

  return (
    <div className="mt-2 space-y-1.5 animate-fade-in">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < passed ? colors[passed - 1] : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Strength:{' '}
        <span className={`font-semibold ${
          passed === 0 ? 'text-rose-400' :
          passed === 1 ? 'text-amber-400' :
          passed === 2 ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          {passed === 0 ? 'Enter a password' : labels[passed - 1]}
        </span>
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-1 text-2xs ${c.passed ? 'text-emerald-400' : 'text-slate-600'}`}>
            <span className={`w-3 h-3 rounded-full flex items-center justify-center ${c.passed ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
              {c.passed && <CheckIcon />}
            </span>
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Register Page ─────────────────────────────────────────────
function Register() {
  const { register: registerUser, isAuthenticated, clearError, error: authError } = useAuth()
  const navigate = useNavigate()

  const [showPassword,  setShowPassword]  = React.useState(false)
  const [showConfirm,   setShowConfirm]   = React.useState(false)
  const [serverError,   setServerError]   = React.useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    clearError()
    setServerError('')
  }, [clearError])

  const {
    values, errors, touched,
    isSubmitting, setIsSubmitting,
    handleChange, handleBlur, validate,
  } = useFormValidation(
    { name: '', email: '', password: '', confirmPassword: '' },
    validateRegister
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    const isValid = validate()
    if (!isValid) return

    setIsSubmitting(true)

    const result = await registerUser(
      values.name.trim(),
      values.email.trim(),
      values.password
    )

    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      const message = result.message || 'Registration failed. Please try again.'
      setServerError(message)
      showError(message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen-safe flex bg-slate-950 bg-mesh">

      {/* ── Right panel — form (shown first on mobile) ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 order-1 lg:order-2">
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
            <h1 className="font-display text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-slate-400 text-sm">Free forever. No credit card needed.</p>
          </div>

          {/* Server error */}
          {(serverError || authError) && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 animate-fade-in">
              <span className="text-rose-400 mt-0.5 shrink-0"><AlertCircleIcon /></span>
              <p className="text-sm text-rose-300">{serverError || authError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="field-label">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Jane Smith"
                className={`field ${touched.name && errors.name ? 'field-error' : ''}`}
                disabled={isSubmitting}
              />
              {touched.name && errors.name && (
                <p className="field-error-msg"><AlertCircleIcon />{errors.name}</p>
              )}
            </div>

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
                placeholder="you@example.com"
                className={`field ${touched.email && errors.email ? 'field-error' : ''}`}
                disabled={isSubmitting}
              />
              {touched.email && errors.email && (
                <p className="field-error-msg"><AlertCircleIcon />{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="field-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Min. 6 characters, include a number"
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
              <PasswordStrength password={values.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="field-label">Confirm password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Repeat your password"
                  className={`field pr-11 ${touched.confirmPassword && errors.confirmPassword ? 'field-error' : ''}`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="field-error-msg"><AlertCircleIcon />{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms notice */}
            <p className="text-xs text-slate-500 leading-relaxed">
              By creating an account you agree to our{' '}
              <span className="text-violet-400 cursor-pointer hover:text-violet-300">Terms of Service</span>
              {' '}and{' '}
              <span className="text-violet-400 cursor-pointer hover:text-violet-300">Privacy Policy</span>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full mt-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><ButtonSpinner /> Creating account…</>
              ) : (
                <>Create account <ArrowRightIcon /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7">
            <span className="divider-text">or</span>
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ── Left panel (decorative, desktop only) ──────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between p-12 relative overflow-hidden bg-slate-900/50 border-r border-slate-800/60 order-2 lg:order-1">
        {/* Orbs */}
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

        {/* Stats */}
        <div className="relative z-10 space-y-5">
          <h2 className="font-display text-3xl font-bold text-white leading-tight">
            Land your next role<br />with full clarity.
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '3×', label: 'More organized than spreadsheets' },
              { value: '0',  label: 'Follow-ups ever missed'           },
              { value: '∞',  label: 'Applications you can track'       },
              { value: '1',  label: 'Dashboard for everything'         },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4">
                <p className="font-display text-2xl font-bold text-gradient leading-none mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="text-sm text-slate-500 font-medium">
            Join thousands of job seekers who track smarter.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register