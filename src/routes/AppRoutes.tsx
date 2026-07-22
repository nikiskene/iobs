// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';

import PublicRoutes from './PublicRoutes';
import DashboardRoutes from './DashboardRoutes';
import AdminRoutes from './AdminRoutes';

export default function AppRoutes() {
  return (
    <Routes>
      {PublicRoutes()}
      {DashboardRoutes()}
      {AdminRoutes()}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}