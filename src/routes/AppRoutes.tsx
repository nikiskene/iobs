// src/routes/AppRoutes.tsx

import { Routes } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import DashboardRoutes from './DashboardRoutes';
import AdminRoutes from './AdminRoutes';
import BeauRoutes from './BeauRoutes';
import TeamRoutes from './TeamRoutes';

export default function AppRoutes() {
  return (
    <Routes>
      {PublicRoutes()}
      {BeauRoutes()}
      {DashboardRoutes()}
      {TeamRoutes()}
      {AdminRoutes()}
    </Routes>
  );
}
