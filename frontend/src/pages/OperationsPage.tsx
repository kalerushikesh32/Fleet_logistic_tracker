import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOperations } from '../hooks/useOperations'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { format } from 'date-fns'

export function OperationsPage() {
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [cargoSearch, setCargoSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data: operations = [], isLoading, error } = useOperations({
    vehicle_id: vehicleSearch || undefined,
    cargo_id: cargoSearch || undefined,
    from: from || undefined,
    to: to || undefined,
  })

  if (isLoading) return <div className="spinner-border" role="status" />
  if (error) return <ErrorAlert error={error} />

  return (
    <div>
      <h2 className="mb-3">Operations History</h2>

      {/* Filters (Req 8.3) */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <label className="form-label small">From</label>
          <input type="datetime-local" className="form-control form-control-sm"
            value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label small">To</label>
          <input type="datetime-local" className="form-control form-control-sm"
            value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label small">Vehicle ID</label>
          <input className="form-control form-control-sm" placeholder="Filter by vehicle…"
            value={vehicleSearch} onChange={e => setVehicleSearch(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label small">Cargo ID</label>
          <input className="form-control form-control-sm" placeholder="Filter by cargo…"
            value={cargoSearch} onChange={e => setCargoSearch(e.target.value)} />
        </div>
      </div>
      {(from || to || vehicleSearch || cargoSearch) && (
        <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => { setFrom(''); setTo(''); setVehicleSearch(''); setCargoSearch('') }}>
          Clear filters
        </button>
      )}

      {/* Operations table (Req 8.4 — chronological order) */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr><th>Type</th><th>Cargo</th><th>Vehicle</th><th>Location</th><th>Notes</th><th>Time</th></tr>
          </thead>
          <tbody>
            {operations.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted py-4">No operations found</td></tr>
            )}
            {operations.map(op => (
              <tr key={op.id}>
                <td>
                  <span className={`badge bg-${op.type === 'LOADING' ? 'success' : 'warning'}`}>
                    {op.type}
                  </span>
                </td>
                <td><Link to={`/cargo/${op.cargo_id}`}>{op.cargo_id.slice(0, 8)}…</Link></td>
                <td><Link to={`/vehicles/${op.vehicle_id}`}>{op.vehicle_id.slice(0, 8)}…</Link></td>
                <td>{op.latitude ? `${op.latitude.toFixed(3)}, ${op.longitude?.toFixed(3)}` : '—'}</td>
                <td>{op.notes ?? '—'}</td>
                <td>{format(new Date(op.timestamp), 'dd MMM yyyy HH:mm')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
