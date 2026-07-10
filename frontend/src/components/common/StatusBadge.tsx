import type { CargoStatus, DriverStatus, VehicleStatus } from '../../types'

type AnyStatus = VehicleStatus | CargoStatus | DriverStatus

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'success', IN_USE: 'primary', MAINTENANCE: 'warning', INACTIVE: 'secondary',
  PENDING: 'secondary', LOADED: 'primary', IN_TRANSIT: 'info', UNLOADED: 'warning', DELIVERED: 'success',
  ACTIVE: 'success', ON_LEAVE: 'warning',
}

export function StatusBadge({ status }: { status: AnyStatus }) {
  const color = STATUS_COLORS[status] ?? 'secondary'
  return <span className={`badge bg-${color}`}>{status.replace('_', ' ')}</span>
}
