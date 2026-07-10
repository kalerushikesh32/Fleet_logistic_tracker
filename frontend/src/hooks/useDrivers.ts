import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { driverService, type DriverCreate, type DriverUpdate } from '../services/driverService'
import type { DriverStatus } from '../types'

const DRIVERS_KEY = 'drivers'
const VEHICLES_KEY = 'vehicles'

export function useDrivers(filters?: { status?: DriverStatus; search?: string }) {
  return useQuery({
    queryKey: [DRIVERS_KEY, filters],
    queryFn: () => driverService.list(filters),
  })
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: [DRIVERS_KEY, id],
    queryFn: () => driverService.get(id),
    enabled: !!id,
  })
}

export function useCreateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: DriverCreate) => driverService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DRIVERS_KEY] }),
  })
}

export function useUpdateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DriverUpdate }) =>
      driverService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DRIVERS_KEY] }),
  })
}

export function useAssignDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, vehicle_id, force }: { id: string; vehicle_id: string; force?: boolean }) =>
      driverService.assign(id, vehicle_id, force),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DRIVERS_KEY] })
      qc.invalidateQueries({ queryKey: [VEHICLES_KEY] })
    },
  })
}

export function useUnassignDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => driverService.unassign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DRIVERS_KEY] })
      qc.invalidateQueries({ queryKey: [VEHICLES_KEY] })
    },
  })
}

export function useDeactivateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => driverService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DRIVERS_KEY] }),
  })
}
