// src/routes/DashboardRoutes.tsx
import { Route, Navigate } from 'react-router-dom';

import Navigation from '../components/Navigation';
import DashboardLayout from '../components/DashboardLayout';

import ProtectedRoute from './ProtectedRoute';

import ProfilePage from '../pages/dashboard/ProfilePage';
import MembersPage from '../pages/dashboard/MembersPage';
import MyThesesPage from '../pages/dashboard/MyThesesPage';
import InboxPage from '../pages/dashboard/InboxPage';

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
      <Route path="explorers" element={<MembersPage />} />
      <Route path="members" element={<Navigate to="/dashboard/explorers" replace />} />
      <Route path="theses" element={<MyThesesPage />} />
      <Route path="chat" element={<Navigate to="/dashboard/inbox" replace />} />
      <Route path="inbox" element={<InboxPage />} />
    </Route>
  );
}