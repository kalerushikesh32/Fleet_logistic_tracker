/**
 * Axios instance pre-configured with base URL and JWT auth header injection.
 * All API calls go through this instance so auth is applied consistently.
 */
import axios, { type AxiosError } from 'axios'
import type { ApiError } from '../types'

// In dev, Vite proxies /api → backend. In production set VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

/** Fired when a request fails auth (401) so AuthContext can react without a hard reload. */
export const AUTH_EXPIRED_EVENT = 'auth:expired'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Inject stored JWT on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear the stale session and notify the app — no full page reload,
// so in-flight SPA state (e.g. unsaved form data on other tabs) isn't lost.
apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('auth_user')
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    return Promise.reject(err)
  },
)

/** Normalize an axios error into the standard {status, code, message} shape. */
export function extractApiError(err: unknown): ApiError {
  const axiosErr = err as AxiosError<ApiError>
  if (axiosErr.response?.data) {
    return axiosErr.response.data
  }
  return {
    status: axiosErr.response?.status ?? 0,
    code: 'NETWORK_ERROR',
    message: axiosErr.message ?? 'Unknown error',
  }
}
