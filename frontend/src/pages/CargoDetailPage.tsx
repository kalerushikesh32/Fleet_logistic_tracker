import { useParams, Link } from 'react-router-dom'
import { useCargoDetail } from '../hooks/useCargo'
import { StatusBadge } from '../components/common/StatusBadge'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { format } from 'date-fns'

export function CargoDetailPage() {
  const { id = '' } = useParams()
  const { data, isLoading, error } = useCargoDetail(id)

  if (isLoading) return <div className="spinner-border" role="status" />
  if (error || !data) return <ErrorAlert error={error ?? new Error('Cargo not found')} />

  const { cargo, operations } = data

  return (
    <div>
      <div className="mb-3"><Link to="/cargo">← Back to Cargo</Link></div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <h2>{cargo.description}</h2>
        <StatusBadge status={cargo.status} />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle text-muted mb-3">Details</h6>
              <p><strong>Weight:</strong> {cargo.weight} kg</p>
              {cargo.length && <p><strong>Dimensions:</strong> {cargo.length} × {cargo.width} × {cargo.height} m</p>}
              <p><strong>Origin:</strong> {cargo.origin}</p>
              <p><strong>Destination:</strong> {cargo.destination}</p>
              {cargo.vehicle_id && (
                <p><strong>On Vehicle:</strong> <Link to={`/vehicles/${cargo.vehicle_id}`}>{cargo.vehicle_id.slice(0, 8)}…</Link></p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Operation history (Req 8.1) */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Operation History</h5>
          {operations.length === 0
            ? <p className="text-muted">No operations recorded yet.</p>
            : (
              <table className="table table-sm">
                <thead>
                  <tr><th>Type</th><th>Vehicle</th><th>Location</th><th>Notes</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {operations.map(op => (
                    <tr key={op.id}>
                      <td>
                        <span className={`badge bg-${op.type === 'LOADING' ? 'success' : 'warning'}`}>
                          {op.type}
                        </span>
                      </td>
                      <td><Link to={`/vehicles/${op.vehicle_id}`}>{op.vehicle_id.slice(0, 8)}…</Link></td>
                      <td>{op.latitude ? `${op.latitude.toFixed(3)}, ${op.longitude?.toFixed(3)}` : '—'}</td>
                      <td>{op.notes ?? '—'}</td>
                      <td>{format(new Date(op.timestamp), 'dd MMM yyyy HH:mm')}</td>
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
