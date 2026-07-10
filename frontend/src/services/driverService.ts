import { apiClient } from './api'
import type { Driver, DriverStatus } from '../types'

export interface DriverCreate { name: string; phone: string; email?: string; license_no: string }
export interface DriverUpdate { name?: string; phone?: string; email?: string }

export const driverService = {
  list: (params?: { status?: DriverStatus; search?: string }) =>
    apiClient.get<Driver[]>('/api/drivers', { params }).then(r => r.data),

  get: (id: string) =>
    apiClient.get<Driver>(`/api/drivers/${id}`).then(r => r.data),

  create: (payload: DriverCreate) =>
    apiClient.post<Driver>('/api/drivers', payload).then(r => r.data),

  update: (id: string, payload: DriverUpdate) =>
    apiClient.put<Driver>(`/api/drivers/${id}`, payload).then(r => r.data),

  assign: (id: string, vehicle_id: string, force = false) =>
    apiClient.post<Driver>(`/api/drivers/${id}/assign?force=${force}`, { vehicle_id }).then(r => r.data),

  unassign: (id: string) =>
    apiClient.post<Driver>(`/api/drivers/${id}/unassign`).then(r => r.data),

  deactivate: (id: string) =>
    apiClient.delete(`/api/drivers/${id}`).then(r => r.data),
}
