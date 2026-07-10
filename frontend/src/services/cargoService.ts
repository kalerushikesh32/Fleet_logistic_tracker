import { apiClient } from './api'
import type { Cargo, CargoStatus, Operation } from '../types'

export interface CargoCreate {
  description: string; weight: number; origin: string; destination: string
  length?: number; width?: number; height?: number
}
export interface CargoUpdate {
  description?: string; weight?: number; origin?: string; destination?: string
  length?: number; width?: number; height?: number
}
export interface CargoDetail { cargo: Cargo; operations: Operation[] }

export const cargoService = {
  list: (params?: { status?: CargoStatus; search?: string }) =>
    apiClient.get<Cargo[]>('/api/cargo', { params }).then(r => r.data),

  get: (id: string) =>
    apiClient.get<CargoDetail>(`/api/cargo/${id}`).then(r => r.data),

  create: (payload: CargoCreate) =>
    apiClient.post<Cargo>('/api/cargo', payload).then(r => r.data),

  update: (id: string, payload: CargoUpdate) =>
    apiClient.put<Cargo>(`/api/cargo/${id}`, payload).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/api/cargo/${id}`).then(r => r.data),
}
