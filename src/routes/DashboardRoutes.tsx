// src/routes/DashboardRoutes.tsx
import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';

import Navigation from '../components/Navigation';
import DashboardLayout from '../components/DashboardLayout';

import ProtectedRoute from './ProtectedRoute';

const ProfilePage = lazy(() => import('../pages/dashboard/ProfilePage'));
const MyThesesPage = lazy(() => import('../pages/dashboard/MyThesesPage'));
const InboxPage = lazy(() => import('../pages/dashboard/InboxPage'));

export default function DashboardRoutes() {
  return (
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Navigation />
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard/profile" replace />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="explorers" element={<Navigate to="/members" replace />} />
      <Route path="members" element={<Navigate to="/members" replace />} />
      <Route path="theses" element={<MyThesesPage />} />
      <Route path="chat" element={<Navigate to="/dashboard/inbox" replace />} />
      <Route path="inbox" element={<InboxPage />} />
    </Route>
  );
}
