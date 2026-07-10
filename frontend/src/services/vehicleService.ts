import { apiClient } from './api'
import type { Location, Vehicle, VehicleStatus, VehicleType } from '../types'

export interface VehicleCreate {
  license_plate: string; type: VehicleType; make: string; model: string; year: number
}
export interface VehicleUpdate {
  license_plate?: string; type?: VehicleType; make?: string; model?: string; year?: number
}

export const vehicleService = {
  list: (params?: { type?: VehicleType; status?: VehicleStatus; search?: string }) =>
    apiClient.get<Vehicle[]>('/api/vehicles', { params }).then(r => r.data),

  get: (id: string) =>
    apiClient.get<Vehicle>(`/api/vehicles/${id}`).then(r => r.data),

  create: (payload: VehicleCreate) =>
    apiClient.post<Vehicle>('/api/vehicles', payload).then(r => r.data),

  update: (id: string, payload: VehicleUpdate) =>
    apiClient.put<Vehicle>(`/api/vehicles/${id}`, payload).then(r => r.data),

  updateStatus: (id: string, status: VehicleStatus) =>
    apiClient.patch<Vehicle>(`/api/vehicles/${id}/status`, { status }).then(r => r.data),

  deactivate: (id: string) =>
    apiClient.delete(`/api/vehicles/${id}`).then(r => r.data),

  addLocation: (id: string, lat: number, lon: number) =>
    apiClient.post<Location>(`/api/vehicles/${id}/locations`, { latitude: lat, longitude: lon }).then(r => r.data),

  getLocations: (id: string, params?: { from?: string; to?: string }) =>
    apiClient.get<Location[]>(`/api/vehicles/${id}/locations`, { params }).then(r => r.data),
}
