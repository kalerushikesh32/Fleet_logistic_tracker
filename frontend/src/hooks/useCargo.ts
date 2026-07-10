import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cargoService, type CargoCreate, type CargoUpdate } from '../services/cargoService'
import type { CargoStatus } from '../types'

const CARGO_KEY = 'cargo'

export function useCargo(filters?: { status?: CargoStatus; search?: string }) {
  return useQuery({
    queryKey: [CARGO_KEY, filters],
    queryFn: () => cargoService.list(filters),
  })
}

export function useCargoDetail(id: string) {
  return useQuery({
    queryKey: [CARGO_KEY, id],
    queryFn: () => cargoService.get(id),
    enabled: !!id,
  })
}

export function useCreateCargo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CargoCreate) => cargoService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CARGO_KEY] }),
  })
}

export function useUpdateCargo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CargoUpdate }) =>
      cargoService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CARGO_KEY] }),
  })
}

export function useDeleteCargo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cargoService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CARGO_KEY] }),
  })
}
