import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import { FullPageLoader } from './components/Loader'

// ── Page imports ───────────────────────────────────────────────
import Login     from './pages/Login'
import Register  from './pages/Register'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import Companies from './pages/Companies'
import Interviews from './pages/Interviews'
import Reminders from './pages/Reminders'
import NotFound  from './pages/NotFound'

// ── AppLayout wraps authenticated pages with Navbar + Sidebar ──
function AppLayout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen-safe flex flex-col">
      <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

// ── GuestRoute: redirect authenticated users away from auth pages
function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <FullPageLoader />

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// ── Root Routes ────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public — redirect / to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Guest-only auth routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      {/* Protected routes — require authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Applications />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/*
        ── Phase 4 routes (placeholder — will be replaced) ──
        Companies, Jobs, Interviews, Reminders, Profile
      */}
      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Companies />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Interviews />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reminders"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Reminders />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ComingSoon page="Profile" />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

// ── Phase 4 placeholder ────────────────────────────────────────
function ComingSoon({ page }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="glass-card flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <p className="text-slate-600 font-mono text-xs mb-3 uppercase tracking-widest">Coming in Phase 4</p>
        <h1 className="font-display text-3xl font-bold text-white mb-3">{page}</h1>
        <p className="text-slate-400 text-sm max-w-xs">
          This section will be built out in the next phase with full CRUD, search, and filtering.
        </p>
      </div>
    </div>
  )
}

// ── App root — wraps everything with AuthProvider ──────────────
function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            padding: '10px 14px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)',
          },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  )
}

export default App