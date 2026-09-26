import React from 'react';
import { Button } from 'primereact/button';
import { useAuthStore } from '../stores/useAuthStore';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ padding: '2rem', color: '#000' }}>
      <p style={{ fontSize: '60px', marginBottom: '30px'}}>Dashboard</p>
      <p>Logged in as: <strong>{user?.fullName}</strong> ({user?.role})</p>
      {/* <Button label="Logout" icon="pi pi-power-off" severity="danger" onClick={logout} /> */}
    </div>
  );
};

export default Dashboard;