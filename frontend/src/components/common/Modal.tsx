import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  footer: ReactNode
  children: ReactNode
}

/**
 * Shared Bootstrap modal shell.
 * Extracted because VehiclesPage, CargoPage, and DriversPage each
 * hand-rolled identical modal markup — this is the single source now.
 */
export function Modal({ title, onClose, footer, children }: ModalProps) {
  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">{footer}</div>
        </div>
      </div>
    </div>
  )
}
