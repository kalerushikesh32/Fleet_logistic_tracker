import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useDashboardSummary, useDashboardMap, useRecentOperations } from '../hooks/useDashboard'
import { FleetMap } from '../components/dashboard/FleetMap'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { format } from 'date-fns'

/** Single stat card used in the summary row. */
function StatCard({ label, value, color = 'primary' }: { label: string; value: number; color?: string }) {
  return (
    <div className={`card border-${color} text-center`}>
      <div className="card-body py-2">
        <div className={`fs-3 fw-bold text-${color}`}>{value}</div>
        <div className="small text-muted">{label}</div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const qc = useQueryClient()
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useDashboardSummary()
  const { data: mapVehicles = [], isLoading: mapLoading } = useDashboardMap()
  const { data: recentOps = [] } = useRecentOperations()

  function refresh() {
    qc.invalidateQueries({ queryKey: ['dashboard'] })
  }

  if (summaryError) return <ErrorAlert error={summaryError} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={refresh}>↻ Refresh</button>
      </div>

      {/* Vehicle stats (Req 10.1) */}
      <h6 className="text-muted mb-2">Fleet</h6>
      <div className="row g-2 mb-4">
        {summaryLoading
          ? <div className="col"><div className="spinner-border spinner-border-sm" /></div>
          : <>
            <div className="col"><StatCard label="Total" value={summary!.vehicles.total} /></div>
            <div className="col"><StatCard label="Available" value={summary!.vehicles.available} color="success" /></div>
            <div className="col"><StatCard label="In Use" value={summary!.vehicles.in_use} color="primary" /></div>
            <div className="col"><StatCard label="Maintenance" value={summary!.vehicles.maintenance} color="warning" /></div>
            <div className="col"><StatCard label="Inactive" value={summary!.vehicles.inactive} color="secondary" /></div>
          </>
        }
      </div>

      {/* Cargo stats (Req 10.2) */}
      <h6 className="text-muted mb-2">Cargo</h6>
      <div className="row g-2 mb-4">
        {summaryLoading
          ? <div className="col"><div className="spinner-border spinner-border-sm" /></div>
          : <>
            <div className="col"><StatCard label="Pending" value={summary!.cargo.pending} color="secondary" /></div>
            <div className="col"><StatCard label="Loaded" value={summary!.cargo.loaded} color="primary" /></div>
            <div className="col"><StatCard label="In Transit" value={summary!.cargo.in_transit} color="info" /></div>
            <div className="col"><StatCard label="Unloaded" value={summary!.cargo.unloaded} color="warning" /></div>
            <div className="col"><StatCard label="Delivered" value={summary!.cargo.delivered} color="success" /></div>
          </>
        }
      </div>

      {/* Fleet map (Req 10.3) */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Fleet Map</h5>
          {mapLoading
            ? <div className="spinner-border spinner-border-sm" />
            : <FleetMap vehicles={mapVehicles} height={400} />
          }
        </div>
      </div>

      {/* Recent operations (Req 10.4) */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Recent Operations</h5>
          {recentOps.length === 0
            ? <p className="text-muted">No recent operations.</p>
            : (
              <table className="table table-sm">
                <thead><tr><th>Type</th><th>Cargo</th><th>Vehicle</th><th>Time</th></tr></thead>
                <tbody>
                  {recentOps.map(op => (
                    <tr key={op.id}>
                      <td><span className={`badge bg-${op.type === 'LOADING' ? 'success' : 'warning'}`}>{op.type}</span></td>
                      <td><Link to={`/cargo/${op.cargo_id}`}>{op.cargo_id.slice(0, 8)}…</Link></td>
                      <td><Link to={`/vehicles/${op.vehicle_id}`}>{op.vehicle_id.slice(0, 8)}…</Link></td>
                      <td>{format(new Date(op.timestamp), 'dd MMM HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>
    </div>
  )
}
