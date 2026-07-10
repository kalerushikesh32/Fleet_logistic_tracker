import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { operationService, type LoadPayload, type UnloadPayload } from '../services/operationService'

const OPS_KEY = 'operations'
const CARGO_KEY = 'cargo'
const VEHICLES_KEY = 'vehicles'

export function useOperations(filters?: { from?: string; to?: string; vehicle_id?: string; cargo_id?: string }) {
  return useQuery({
    queryKey: [OPS_KEY, filters],
    queryFn: () => operationService.list(filters),
  })
}

export function useLoadCargo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: LoadPayload) => operationService.load(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CARGO_KEY] })
      qc.invalidateQueries({ queryKey: [VEHICLES_KEY] })
      qc.invalidateQueries({ queryKey: [OPS_KEY] })
    },
  })
}

export function useUnloadCargo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UnloadPayload) => operationService.unload(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CARGO_KEY] })
      qc.invalidateQueries({ queryKey: [VEHICLES_KEY] })
      qc.invalidateQueries({ queryKey: [OPS_KEY] })
    },
  })
}
