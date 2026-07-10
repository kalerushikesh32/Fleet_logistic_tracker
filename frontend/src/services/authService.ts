import { apiClient } from './api'
import type { TokenResponse, User } from '../types'

const TOKEN_KEY = 'access_token'
const USER_KEY = 'auth_user'

export const authService = {
  async login(email: string, password: string): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>('/api/auth/login', { email, password })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    return data
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout')
    } finally {
      // Always clear storage regardless of server response
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY)
  },
}
