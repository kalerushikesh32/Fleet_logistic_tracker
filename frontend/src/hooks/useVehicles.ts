import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { vehicleService, type VehicleCreate, type VehicleUpdate } from '../services/vehicleService'
import type { VehicleStatus, VehicleType } from '../types'

const VEHICLES_KEY = 'vehicles'

export function useVehicles(filters?: { type?: VehicleType; status?: VehicleStatus; search?: string }) {
  return useQuery({
    queryKey: [VEHICLES_KEY, filters],
    queryFn: () => vehicleService.list(filters),
  })
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: [VEHICLES_KEY, id],
    queryFn: () => vehicleService.get(id),
    enabled: !!id,
  })
}

export function useCreateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: VehicleCreate) => vehicleService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VEHICLES_KEY] }),
  })
}

export function useUpdateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VehicleUpdate }) =>
      vehicleService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VEHICLES_KEY] }),
  })
}

export function useUpdateVehicleStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: VehicleStatus }) =>
      vehicleService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VEHICLES_KEY] }),
  })
}

export function useDeactivateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vehicleService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VEHICLES_KEY] }),
  })
}

export function useVehicleLocations(vehicleId: string, params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [VEHICLES_KEY, vehicleId, 'locations', params],
    queryFn: () => vehicleService.getLocations(vehicleId, params),
    enabled: !!vehicleId,
  })
}
