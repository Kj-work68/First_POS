import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Dashboard, Inventory, PosSale} from './pages/index';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes สำหรับ User ที่ Login แล้ว */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/pos" element={<PosSale />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;