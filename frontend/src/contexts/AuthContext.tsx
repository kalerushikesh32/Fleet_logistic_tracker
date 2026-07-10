import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AUTH_EXPIRED_EVENT } from '../services/api'
import { authService } from '../services/authService'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser())

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  // When any API call gets a 401 (token expired/invalid), clear auth state.
  // ProtectedRoute then redirects to /login on the next render — no page reload.
  useEffect(() => {
    function handleAuthExpired() {
      setUser(null)
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
