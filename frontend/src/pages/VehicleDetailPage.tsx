import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useVehicle, useVehicleLocations } from '../hooks/useVehicles'
import { useOperations } from '../hooks/useOperations'
import { StatusBadge } from '../components/common/StatusBadge'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { format } from 'date-fns'

export function VehicleDetailPage() {
  const { id = '' } = useParams()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data: vehicle, isLoading, error } = useVehicle(id)
  const { data: locations = [] } = useVehicleLocations(id, { from: from || undefined, to: to || undefined })
  const { data: operations = [] } = useOperations({ vehicle_id: id })

  if (isLoading) return <div className="spinner-border" role="status" />
  if (error || !vehicle) return <ErrorAlert error={error ?? new Error('Vehicle not found')} />

  const latestLoc = locations.length > 0 ? locations[locations.length - 1] : null

  return (
    <div>
      <div className="mb-3">
        <Link to="/vehicles">← Back to Vehicles</Link>
      </div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <h2>{vehicle.license_plate}</h2>
        <StatusBadge status={vehicle.status} />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle text-muted mb-2">Details</h6>
              <p><strong>Type:</strong> {vehicle.type}</p>
              <p><strong>Make / Model:</strong> {vehicle.make} {vehicle.model}</p>
              <p><strong>Year:</strong> {vehicle.year}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle text-muted mb-2">Last Known Location</h6>
              {latestLoc ? (
                <>
                  <p><strong>Lat:</strong> {latestLoc.latitude.toFixed(5)}</p>
                  <p><strong>Lon:</strong> {latestLoc.longitude.toFixed(5)}</p>
                  <p className="text-muted small">{format(new Date(latestLoc.timestamp), 'dd MMM yyyy HH:mm')}</p>
                </>
              ) : <p className="text-muted">No location recorded</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Location history */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Location History</h5>
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <label className="form-label small">From</label>
              <input type="datetime-local" className="form-control form-control-sm" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label small">To</label>
              <input type="datetime-local" className="form-control form-control-sm" value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            <table className="table table-sm">
              <thead><tr><th>Latitude</th><th>Longitude</th><th>Time</th></tr></thead>
              <tbody>
                {locations.length === 0
                  ? <tr><td colSpan={3} className="text-muted text-center">No records</td></tr>
                  : locations.map(l => (
                    <tr key={l.id}>
                      <td>{l.latitude.toFixed(5)}</td>
                      <td>{l.longitude.toFixed(5)}</td>
                      <td>{format(new Date(l.timestamp), 'dd MMM HH:mm')}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent operations */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Recent Operations</h5>
          <table className="table table-sm">
            <thead><tr><th>Type</th><th>Cargo</th><th>Time</th></tr></thead>
            <tbody>
              {operations.length === 0
                ? <tr><td colSpan={3} className="text-muted text-center">No operations</td></tr>
                : operations.slice(0, 10).map(op => (
                  <tr key={op.id}>
                    <td><span className={`badge bg-${op.type === 'LOADING' ? 'success' : 'warning'}`}>{op.type}</span></td>
                    <td><Link to={`/cargo/${op.cargo_id}`}>{op.cargo_id.slice(0, 8)}…</Link></td>
                    <td>{format(new Date(op.timestamp), 'dd MMM HH:mm')}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
