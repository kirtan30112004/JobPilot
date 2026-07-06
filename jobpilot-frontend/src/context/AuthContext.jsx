import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { authService } from '../services/api'
import { showAuthSuccess } from '../utils/toast'

// ── Constants ───────────────────────────────────────────────
const TOKEN_KEY = 'jp_token'
const USER_KEY  = 'jp_user'

// ── Initial State ───────────────────────────────────────────
const initialState = {
  user:          null,
  token:         localStorage.getItem(TOKEN_KEY) || null,
  isAuthenticated: false,
  isLoading:     true,      // true while verifying token on mount
  error:         null,
}

// ── Action Types ────────────────────────────────────────────
const AUTH_ACTIONS = {
  SET_LOADING:    'SET_LOADING',
  LOGIN_SUCCESS:  'LOGIN_SUCCESS',
  LOGOUT:         'LOGOUT',
  SET_ERROR:      'SET_ERROR',
  CLEAR_ERROR:    'CLEAR_ERROR',
  UPDATE_USER:    'UPDATE_USER',
}

// ── Reducer ─────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user:            action.payload.user,
        token:           action.payload.token,
        isAuthenticated: true,
        isLoading:       false,
        error:           null,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
        token:     null,
      }

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error:     action.payload,
        isLoading: false,
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null }

    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: action.payload }

    default:
      return state
  }
}

// ── Context ─────────────────────────────────────────────────
const AuthContext = createContext(null)

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Persist token + user to localStorage whenever they change
  useEffect(() => {
    if (state.token) {
      localStorage.setItem(TOKEN_KEY, state.token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
    if (state.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(state.user))
    }
  }, [state.token, state.user])

  // ── Verify token on mount ──────────────────────────────────
  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY)

      if (!savedToken) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        return
      }

      try {
        const response = await authService.getMe()
        const user     = response.data.data.user

        dispatch({
          type:    AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token: savedToken },
        })
      } catch {
        // Token is invalid or expired — clean up silently
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
      }
    }

    verifyAuth()
  }, [])

  // ── Actions ────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })

    try {
      const response = await authService.register({ name, email, password })
      const { user, token } = response.data.data

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token } })
      showAuthSuccess(`Welcome to JobPilot, ${user.name.split(' ')[0]}!`)
      return { success: true }
    } catch (err) {
      const message = err.message || 'Registration failed'
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message })
      return { success: false, message }
    }
  }, [])

  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })

    try {
      const response = await authService.login({ email, password })
      const { user, token } = response.data.data

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token } })
      showAuthSuccess(`Welcome back, ${user.name.split(' ')[0]}!`)
      return { success: true }
    } catch (err) {
      const message = err.message || 'Login failed'
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message })
      return { success: false, message }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore server errors on logout — clear local state regardless
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      showAuthSuccess('Signed out successfully')
    }
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }, [])

  const updateUser = useCallback((user) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: user })
  }, [])

  const value = {
    // State
    user:            state.user,
    token:           state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading:       state.isLoading,
    error:           state.error,
    // Actions
    register,
    login,
    logout,
    clearError,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ─────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext