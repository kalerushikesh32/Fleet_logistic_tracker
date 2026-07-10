import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../components/common/StatusBadge'
import { SearchBar } from '../components/common/SearchBar'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { Modal } from '../components/common/Modal'
import { useCargo, useCreateCargo, useUpdateCargo, useDeleteCargo } from '../hooks/useCargo'
import { useVehicles } from '../hooks/useVehicles'
import { useLoadCargo, useUnloadCargo } from '../hooks/useOperations'
import type { Cargo, CargoStatus } from '../types'
import { extractApiError } from '../services/api'

const EMPTY_FORM = { description: '', weight: 0, origin: '', destination: '', length: undefined as number|undefined, width: undefined as number|undefined, height: undefined as number|undefined }

export function CargoPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CargoStatus | ''>('')
  const [showForm, setShowForm] = useState(false)
  const [editCargo, setEditCargo] = useState<Cargo | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [loadModal, setLoadModal] = useState<Cargo | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState('')

  const { data: cargoList = [], isLoading, error } = useCargo({ search: search || undefined, status: (statusFilter as CargoStatus) || undefined })
  const { data: vehicles = [] } = useVehicles({ status: 'AVAILABLE' })
  const createCargo = useCreateCargo()
  const updateCargo = useUpdateCargo()
  const deleteCargo = useDeleteCargo()
  const loadCargo = useLoadCargo()
  const unloadCargo = useUnloadCargo()

  function openCreate() { setEditCargo(null); setFormData(EMPTY_FORM); setFormError(null); setShowForm(true) }
  function openEdit(c: Cargo) { setEditCargo(c); setFormData({ description: c.description, weight: c.weight, origin: c.origin, destination: c.destination, length: c.length ?? undefined, width: c.width ?? undefined, height: c.height ?? undefined }); setFormError(null); setShowForm(true) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    try {
      if (editCargo) { await updateCargo.mutateAsync({ id: editCargo.id, payload: formData }) }
      else { await createCargo.mutateAsync(formData) }
      setShowForm(false)
    } catch (err) { setFormError(extractApiError(err).message) }
  }

  async function handleLoad() {
    if (!loadModal || !selectedVehicle) return
    try { await loadCargo.mutateAsync({ cargo_id: loadModal.id, vehicle_id: selectedVehicle }); setLoadModal(null) }
    catch (err) { alert(extractApiError(err).message) }
  }

  async function handleUnload(c: Cargo) {
    if (!confirm(`Unload "${c.description}"?`)) return
    try { await unloadCargo.mutateAsync({ cargo_id: c.id }) }
    catch (err) { alert(extractApiError(err).message) }
  }

  if (isLoading) return <div className="spinner-border" role="status" />
  if (error) return <ErrorAlert error={error} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Cargo</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Cargo</button>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-6"><SearchBar value={search} onChange={setSearch} placeholder="Search description, origin, destination…" /></div>
        <div className="col-md-3">
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as CargoStatus | '')}>
            <option value="">All Statuses</option>
            {(['PENDING','LOADED','IN_TRANSIT','UNLOADED','DELIVERED'] as CargoStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light"><tr><th>Description</th><th>Origin → Dest</th><th>Weight</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {cargoList.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-4">No cargo found</td></tr>}
            {cargoList.map(c => (
              <tr key={c.id}>
                <td><Link to={`/cargo/${c.id}`}>{c.description}</Link></td>
                <td>{c.origin} → {c.destination}</td>
                <td>{c.weight} kg</td>
                <td><StatusBadge status={c.status} /></td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(c)}>Edit</button>
                  {c.status === 'PENDING' && <button className="btn btn-sm btn-success me-1" onClick={() => { setLoadModal(c); setSelectedVehicle('') }}>Load</button>}
                  {(c.status === 'LOADED' || c.status === 'IN_TRANSIT') && <button className="btn btn-sm btn-warning me-1" onClick={() => handleUnload(c)}>Unload</button>}
                  {(c.status === 'PENDING' || c.status === 'DELIVERED') && <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCargo.mutate(c.id)}>Delete</button>}
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
            title={editCargo ? 'Edit Cargo' : 'Add Cargo'}
            onClose={() => setShowForm(false)}
            footer={
              <>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editCargo ? 'Update' : 'Create'}</button>
              </>
            }
          >
            {formError && <div className="alert alert-danger">{formError}</div>}
            <div className="mb-2"><label className="form-label">Description</label>
              <input className="form-control" required value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))} /></div>
            <div className="mb-2"><label className="form-label">Weight (kg)</label>
              <input type="number" step="0.1" min="0.1" className="form-control" required value={formData.weight || ''} onChange={e => setFormData(f => ({...f, weight: +e.target.value}))} /></div>
            <div className="row g-2 mb-2">
              <div className="col-6"><label className="form-label">Origin</label>
                <input className="form-control" required value={formData.origin} onChange={e => setFormData(f => ({...f, origin: e.target.value}))} /></div>
              <div className="col-6"><label className="form-label">Destination</label>
                <input className="form-control" required value={formData.destination} onChange={e => setFormData(f => ({...f, destination: e.target.value}))} /></div>
            </div>
          </Modal>
        </form>
      )}

      {/* Load Modal */}
      {loadModal && (
        <Modal
          title={`Load "${loadModal.description}"`}
          onClose={() => setLoadModal(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setLoadModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={handleLoad} disabled={!selectedVehicle}>Load</button>
            </>
          }
        >
          <label className="form-label">Select Vehicle</label>
          <select className="form-select" value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
            <option value="">-- Select --</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} ({v.type})</option>)}
          </select>
        </Modal>
      )}
    </div>
  )
}
