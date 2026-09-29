import React, { useState } from 'react'
import { Outlet, useNavigate, } from 'react-router-dom'
import { Button } from 'primereact/button'
import { useAuthStore } from '../../stores/useAuthStore'
import './MainLayout.css'

export const MainLayout: React.FC = () => {
    const { user, logout} = useAuthStore();
    const navigate = useNavigate();

    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const toggleSidebar = () => {
      setIsCollapsed((prev) => !prev);
    }

    const handleGoToDashboard = () => {
      navigate('/dashboard');
      window.location.reload();
    }

  return (
    <div className={`layout-wrapper ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Top Navigation Bar */}
      <header className="layout-topbar">
        <div className="topbar-brand">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/*เพิ่มปุ่ม Toggle Sidebar */}
          <Button
            icon="pi pi-bars"
            text
            // rounded
            onClick={toggleSidebar}
            // tooltip="Toggle Sidebar"
          />
          </div>
          <span
            onClick={handleGoToDashboard}
            style={{ cursor: 'pointer'}}
          >
            First POS
          </span>
          <i className="pi pi-prime" style={{ fontSize: '1.5rem', color: 'var(--accent)', marginLeft: '10px' }}></i>
        </div>
        <div className="topbar-user">
          <span className="user-info">
            <strong>{user?.fullName}</strong> ({user?.role})
          </span>
          <Button
            icon="pi pi-sign-out"
            severity="danger"
            text
            rounded
            onClick={logout}
            className='button-logout'
            // tooltip="Logout"
          />
        </div>
      </header>

      {/* Main Container */}
      <div className="layout-container">
        {/* Sidebar Menu */}
        <aside className={`layout-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
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
