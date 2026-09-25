import React from 'react'
import { Outlet, useNavigate, } from 'react-router-dom'
import { Button } from 'primereact/button'
import { useAuthStore } from '../../stores/useAuthStore'
import './MainLayout.css'

export const MainLayout: React.FC = () => {
    const { user, logout} = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout
        navigate('/login');
    }

  return (
    <div className="layout-wrapper">
      {/* Top Navigation Bar */}
      <header className="layout-topbar">
        <div className="topbar-brand">
          <i className="pi pi-box" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}></i>
          <span>Smart POS</span>
        </div>
        <div className="topbar-user">
          <span className="user-info">
            <strong>{user?.fullName}</strong> ({user?.role})
          </span>
          <Button
            icon="pi pi-power-off"
            severity="danger"
            text
            rounded
            onClick={handleLogout}
            tooltip="Logout"
          />
        </div>
      </header>

      {/* Main Container */}
      <div className="layout-container">
        {/* Sidebar Menu */}
        <aside className="layout-sidebar">
          <nav className="menu-list">
            <button className="menu-item" onClick={() => navigate('/dashboard')}>
              <i className="pi pi-home"></i>
              <span>Dashboard</span>
            </button>

            {(user?.role === 'Owner' || user?.role === 'Stock') && (
              <button className="menu-item" onClick={() => navigate('/inventory')}>
                <i className="pi pi-database"></i>
                <span>Inventory</span>
              </button>
            )}

            {(user?.role === 'Owner' || user?.role === 'Cashier') && (
              <button className="menu-item" onClick={() => navigate('/pos')}>
                <i className="pi pi-shopping-cart"></i>
                <span>POS Sale</span>
              </button>
            )}
          </nav>
        </aside>

        {/* Dynamic Content */}
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
