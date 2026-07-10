import { apiClient } from './api'
import type { CargoStats, MapVehicle, Operation, VehicleStats } from '../types'

export interface DashboardSummary { vehicles: VehicleStats; cargo: CargoStats }

export const dashboardService = {
  getSummary: () =>
    apiClient.get<DashboardSummary>('/api/dashboard/summary').then(r => r.data),

  getMapData: () =>
    apiClient.get<{ vehicles: MapVehicle[] }>('/api/dashboard/map').then(r => r.data.vehicles),

  getRecentOperations: () =>
    apiClient.get<Operation[]>('/api/dashboard/recent-operations').then(r => r.data),
}
