// src/routes/AppRoutes.tsx

import { Routes } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import DashboardRoutes from './DashboardRoutes';
import AdminRoutes from './AdminRoutes';
import TeamRoutes from './TeamRoutes';

export default function AppRoutes() {
  return (
    <Routes>
      {PublicRoutes()}
      {DashboardRoutes()}
      {TeamRoutes()}
      {AdminRoutes()}
    </Routes>
  );
}
