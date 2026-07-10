import { useState } from 'react'
import { useDrivers, useCreateDriver, useUpdateDriver, useAssignDriver, useUnassignDriver, useDeactivateDriver } from '../hooks/useDrivers'
import { useVehicles } from '../hooks/useVehicles'
import { StatusBadge } from '../components/common/StatusBadge'
import { SearchBar } from '../components/common/SearchBar'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { Modal } from '../components/common/Modal'
import type { Driver, DriverStatus } from '../types'
import { extractApiError } from '../services/api'

const EMPTY_FORM = { name: '', phone: '', email: '', license_no: '' }

export function DriversPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DriverStatus | ''>('')
  const [showForm, setShowForm] = useState(false)
  const [editDriver, setEditDriver] = useState<Driver | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [assignModal, setAssignModal] = useState<Driver | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [confirmReassign, setConfirmReassign] = useState(false)

  const { data: drivers = [], isLoading, error } = useDrivers({ search: search || undefined, status: (statusFilter as DriverStatus) || undefined })
  const { data: vehicles = [] } = useVehicles()
  const createDriver = useCreateDriver()
  const updateDriver = useUpdateDriver()
  const assignDriver = useAssignDriver()
  const unassignDriver = useUnassignDriver()
  const deactivate = useDeactivateDriver()

  function openCreate() { setEditDriver(null); setFormData(EMPTY_FORM); setFormError(null); setShowForm(true) }
  function openEdit(d: Driver) { setEditDriver(d); setFormData({ name: d.name, phone: d.phone, email: d.email ?? '', license_no: d.license_no }); setFormError(null); setShowForm(true) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setFormError(null)
    try {
      if (editDriver) { await updateDriver.mutateAsync({ id: editDriver.id, payload: { name: formData.name, phone: formData.phone, email: formData.email || undefined } }) }
      else { await createDriver.mutateAsync({ ...formData, email: formData.email || undefined }) }
      setShowForm(false)
    } catch (err) { setFormError(extractApiError(err).message) }
  }

  async function handleAssign(force = false) {
    if (!assignModal || !selectedVehicle) return
    try {
      await assignDriver.mutateAsync({ id: assignModal.id, vehicle_id: selectedVehicle, force })
      setAssignModal(null); setConfirmReassign(false)
    } catch (err) {
      const apiErr = extractApiError(err)
      // Backend signals re-assignment confirmation needed (Req 9.6)
      if (apiErr.code === 'DRIVER_ALREADY_ASSIGNED') {
        setConfirmReassign(true)
      } else {
        alert(apiErr.message)
      }
    }
  }

  if (isLoading) return <div className="spinner-border" role="status" />
  if (error) return <ErrorAlert error={error} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Drivers</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Driver</button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6"><SearchBar value={search} onChange={setSearch} placeholder="Search name or license…" /></div>
        <div className="col-md-3">
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as DriverStatus | '')}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr><th>Name</th><th>License No.</th><th>Phone</th><th>Status</th><th>Vehicle</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {drivers.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">No drivers found</td></tr>}
            {drivers.map(d => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td><code>{d.license_no}</code></td>
                <td>{d.phone}</td>
                <td><StatusBadge status={d.status} /></td>
                <td>{d.vehicle_id ? <span className="badge bg-info">{d.vehicle_id.slice(0, 8)}…</span> : <span className="text-muted">—</span>}</td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(d)}>Edit</button>
                  {d.vehicle_id
                    ? <button className="btn btn-sm btn-outline-warning me-1" onClick={() => unassignDriver.mutate(d.id)}>Unassign</button>
                    : <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setAssignModal(d); setSelectedVehicle(''); setConfirmReassign(false) }}>Assign</button>
                  }
                  {d.status !== 'INACTIVE' && <button className="btn btn-sm btn-outline-danger" onClick={() => deactivate.mutate(d.id)}>Deactivate</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Driver Modal */}
      {showForm && (
        <form onSubmit={handleSubmit}>
          <Modal
            title={editDriver ? 'Edit Driver' : 'Add Driver'}
            onClose={() => setShowForm(false)}
            footer={
              <>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editDriver ? 'Update' : 'Create'}</button>
              </>
            }
          >
            {formError && <div className="alert alert-danger">{formError}</div>}
            <div className="mb-2"><label className="form-label">Name</label>
              <input className="form-control" required value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} /></div>
            <div className="mb-2"><label className="form-label">Phone</label>
              <input className="form-control" required value={formData.phone} onChange={e => setFormData(f => ({...f, phone: e.target.value}))} /></div>
            <div className="mb-2"><label className="form-label">Email (optional)</label>
              <input type="email" className="form-control" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))} /></div>
            {!editDriver && (
              <div className="mb-2"><label className="form-label">License No.</label>
                <input className="form-control" required value={formData.license_no} onChange={e => setFormData(f => ({...f, license_no: e.target.value}))} /></div>
            )}
          </Modal>
        </form>
      )}

      {/* Assign Vehicle Modal */}
      {assignModal && (
        <Modal
          title={`Assign Vehicle to ${assignModal.name}`}
          onClose={() => setAssignModal(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setAssignModal(null)}>Cancel</button>
              {confirmReassign
                ? <button className="btn btn-warning" onClick={() => handleAssign(true)}>Confirm Reassign</button>
                : <button className="btn btn-primary" onClick={() => handleAssign(false)} disabled={!selectedVehicle}>Assign</button>
              }
            </>
          }
        >
          {confirmReassign && (
            <div className="alert alert-warning">
              This driver is already assigned to another vehicle. Confirm reassignment?
            </div>
          )}
          <label className="form-label">Select Vehicle</label>
          <select className="form-select" value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
            <option value="">-- Select --</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} — {v.type} ({v.status})</option>)}
          </select>
        </Modal>
      )}
    </div>
  )
}
