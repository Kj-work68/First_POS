import React from 'react';
import { Button } from 'primereact/button';
import { useAuthStore } from '../stores/useAuthStore';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Logged in as: <strong>{user?.fullName}</strong> ({user?.role})</p>
      <Button label="Logout" icon="pi pi-power-off" severity="danger" onClick={logout} />
    </div>
  );
};

export default Dashboard;