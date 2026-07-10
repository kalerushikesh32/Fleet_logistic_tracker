import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../components/common/StatusBadge'
import { SearchBar } from '../components/common/SearchBar'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { Modal } from '../components/common/Modal'
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeactivateVehicle } from '../hooks/useVehicles'
import type { Vehicle, VehicleType, VehicleStatus } from '../types'
import { extractApiError } from '../services/api'

const CURRENT_YEAR = new Date().getFullYear()

const EMPTY_FORM = { license_plate: '', type: 'TRUCK' as VehicleType, make: '', model: '', year: CURRENT_YEAR }

export function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<VehicleType | ''>('')
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('')
  const [showForm, setShowForm] = useState(false)
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: vehicles = [], isLoading, error } = useVehicles({
    search: search || undefined,
    type: (typeFilter as VehicleType) || undefined,
    status: (statusFilter as VehicleStatus) || undefined,
  })
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const deactivate = useDeactivateVehicle()

  function openCreate() {
    setEditVehicle(null)
    setFormData(EMPTY_FORM)
    setFormError(null)
    setShowForm(true)
  }

  function openEdit(v: Vehicle) {
    setEditVehicle(v)
    setFormData({ license_plate: v.license_plate, type: v.type, make: v.make, model: v.model, year: v.year })
    setFormError(null)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    try {
      if (editVehicle) {
        await updateVehicle.mutateAsync({ id: editVehicle.id, payload: formData })
      } else {
        await createVehicle.mutateAsync(formData)
      }
      setShowForm(false)
    } catch (err) {
      setFormError(extractApiError(err).message)
    }
  }

  if (isLoading) return <div className="spinner-border" role="status" />
  if (error) return <ErrorAlert error={error} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Vehicles</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Vehicle</button>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-md-5"><SearchBar value={search} onChange={setSearch} placeholder="Search plate, make, model…" /></div>
        <div className="col-md-3">
          <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value as VehicleType | '')}>
            <option value="">All Types</option>
            <option value="TRUCK">Truck</option>
            <option value="SMALL_VEHICLE">Small Vehicle</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as VehicleStatus | '')}>
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Vehicle table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr><th>Plate</th><th>Type</th><th>Make / Model</th><th>Year</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {vehicles.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted py-4">No vehicles found</td></tr>
            )}
            {vehicles.map(v => (
              <tr key={v.id}>
                <td><Link to={`/vehicles/${v.id}`}>{v.license_plate}</Link></td>
                <td>{v.type === 'TRUCK' ? '🚛 Truck' : '🚐 Small Vehicle'}</td>
                <td>{v.make} {v.model}</td>
                <td>{v.year}</td>
                <td><StatusBadge status={v.status} /></td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(v)}>Edit</button>
                  {v.status !== 'INACTIVE' && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deactivate.mutate(v.id)}>Deactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <form onSubmit={handleSubmit}>
          <Modal
            title={editVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
            onClose={() => setShowForm(false)}
            footer={
              <>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createVehicle.isPending || updateVehicle.isPending}>
                  {editVehicle ? 'Update' : 'Create'}
                </button>
              </>
            }
          >
            {formError && <div className="alert alert-danger">{formError}</div>}
            <div className="mb-2">
              <label className="form-label">License Plate</label>
              <input className="form-control" required value={formData.license_plate}
                onChange={e => setFormData(f => ({ ...f, license_plate: e.target.value }))} />
            </div>
            <div className="mb-2">
              <label className="form-label">Type</label>
              <select className="form-select" value={formData.type}
                onChange={e => setFormData(f => ({ ...f, type: e.target.value as VehicleType }))}>
                <option value="TRUCK">Truck</option>
                <option value="SMALL_VEHICLE">Small Vehicle</option>
              </select>
            </div>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label">Make</label>
                <input className="form-control" required value={formData.make}
                  onChange={e => setFormData(f => ({ ...f, make: e.target.value }))} />
              </div>
              <div className="col-6">
                <label className="form-label">Model</label>
                <input className="form-control" required value={formData.model}
                  onChange={e => setFormData(f => ({ ...f, model: e.target.value }))} />
              </div>
            </div>
            <div className="mb-2 mt-2">
              <label className="form-label">Year</label>
              <input type="number" className="form-control" required min={1900} max={CURRENT_YEAR + 1}
                value={formData.year} onChange={e => setFormData(f => ({ ...f, year: +e.target.value }))} />
            </div>
          </Modal>
        </form>
      )}
    </div>
  )
}
