import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { path: '/dashboard', label: '📊 Dashboard' },
  { path: '/vehicles',  label: '🚛 Vehicles' },
  { path: '/cargo',     label: '📦 Cargo' },
  { path: '/operations',label: '🔄 Operations' },
  { path: '/drivers',   label: '👤 Drivers' },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { logout } = useAuth()

  return (
    <div
      className="d-flex flex-column bg-dark text-white p-3"
      style={{ width: 220, minWidth: 220, minHeight: '100vh' }}
    >
      {/* Header row with optional close button for mobile */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <span className="fw-bold fs-5">Fleet Tracker</span>
        {onClose && (
          <button
            className="btn btn-outline-light btn-sm d-lg-none"
            style={{ minWidth: 44, minHeight: 44 }}
            onClick={onClose}
            aria-label="Close navigation"
          >
            ✕
          </button>
        )}
      </div>

      <nav className="flex-grow-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}  // close sidebar on nav on mobile
            className={({ isActive }) =>
              `d-block p-2 mb-1 rounded text-decoration-none`
              + ` ${isActive ? 'bg-primary text-white' : 'text-light'}`
            }
            // Ensure 44×44px minimum touch target (Req 14.4)
            style={{ minHeight: 44, display: 'flex', alignItems: 'center' }}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        className="btn btn-outline-light btn-sm mt-3"
        style={{ minHeight: 44 }}
        onClick={() => logout()}
      >
        Sign Out
      </button>
    </div>
  )
}
