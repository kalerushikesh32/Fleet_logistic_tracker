import { apiClient } from './api'
import type { Cargo, Operation, Vehicle } from '../types'

export interface LoadPayload { cargo_id: string; vehicle_id: string; latitude?: number; longitude?: number; notes?: string }
export interface UnloadPayload { cargo_id: string; latitude?: number; longitude?: number; notes?: string; mark_delivered?: boolean }
export interface OperationResult { operation: Operation; cargo: Cargo; vehicle: Vehicle }

export const operationService = {
  list: (params?: { from?: string; to?: string; vehicle_id?: string; cargo_id?: string }) =>
    apiClient.get<Operation[]>('/api/operations', { params }).then(r => r.data),

  load: (payload: LoadPayload) =>
    apiClient.post<OperationResult>('/api/operations/load', payload).then(r => r.data),

  unload: (payload: UnloadPayload) =>
    apiClient.post<OperationResult>('/api/operations/unload', payload).then(r => r.data),
}
