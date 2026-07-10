import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

/**
 * Main app shell.
 * On desktop (≥1024px): sidebar always visible.
 * On tablet (768–1023px): sidebar collapsible via hamburger button.
 * On mobile (<768px): sidebar hidden by default, accessible via toggle.
 * Req 14.1–14.4
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Overlay for mobile/tablet when sidebar is open */}
      {sidebarOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always visible on lg+, toggled on smaller screens */}
      <div
        className={`d-lg-flex flex-column ${sidebarOpen ? 'd-flex' : 'd-none'} position-fixed position-lg-relative`}
        style={{ zIndex: 1050, height: '100vh' }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-grow-1 bg-light overflow-auto" style={{ minWidth: 0 }}>
        {/* Mobile/tablet top bar with hamburger */}
        <div className="d-lg-none d-flex align-items-center bg-dark text-white px-3 py-2">
          {/* 44×44px minimum touch target (Req 14.4) */}
          <button
            className="btn btn-outline-light"
            style={{ minWidth: 44, minHeight: 44 }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            ☰
          </button>
          <span className="ms-3 fw-bold">Fleet Tracker</span>
        </div>
        <div className="p-3 p-md-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
