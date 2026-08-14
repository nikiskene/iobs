// src/routes/AdminRoutes.tsx
// src/routes/AdminRoutes.tsx
import { Route, Navigate } from 'react-router-dom';

import Navigation from '../components/Navigation';
import DashboardLayout from '../components/DashboardLayout';

import AdminRoute from './AdminRoute';

import AdminHome from '../pages/admin/AdminHome';
import AdminCategoryPage from '../pages/admin/AdminCategoryPage';

import HomepageCMS from '../pages/admin/HomepageCMS';
import AboutCMS from '../pages/admin/AboutCMS';
import CategoriesAdmin from '../pages/admin/CategoriesAdmin';
import ThesesAdmin from '../pages/admin/ThesesAdmin';
import TeamAdmin from '../pages/admin/TeamAdmin';
import SiteSettingsAdmin from '../pages/admin/SiteSettingsAdmin';
import GlossaryAdmin from '../pages/admin/GlossaryAdmin';
import ScaleWorldsAdmin from '../pages/admin/ScaleWorldsAdmin';

import EventsAdmin from '../pages/admin/events/EventsAdmin';
import ExpeditionsAdmin from '../pages/admin/expeditions/ExpeditionsAdmin';
import ExpeditionInquiriesAdmin from '../pages/admin/expeditions/ExpeditionInquiriesAdmin';
import CustomExpeditionInquiriesAdmin from '../pages/admin/expeditions/CustomExpeditionInquiriesAdmin';
import ConversationsAdmin from '../pages/admin/conversations/ConversationsAdmin';
import ContactMessagesAdmin from '../pages/admin/ContactMessagesAdmin';
import IdentityOverview from '../pages/admin/identity/IdentityOverview';
import IdentityReview from '../pages/admin/identity/IdentityReview';
import IdentitySources from '../pages/admin/identity/IdentitySources';
import MethodPage from '../pages/admin/identity/MethodPage';
import DailyIdentityScan from '../pages/admin/identity/DailyIdentityScan';
import IdentitySettingsPage from '../pages/admin/identity/IdentitySettingsPage';

export default function AdminRoutes() {
  return (
    <Route
      path="/admin"
      element={
        <AdminRoute>
          <Navigation />
          <DashboardLayout />
        </AdminRoute>
      }
    >
      <Route index element={<AdminHome />} />

      <Route path="content" element={<AdminCategoryPage title="Content" />} />
      <Route path="members" element={<AdminCategoryPage title="Members" />} />
      <Route
        path="experiences"
        element={<AdminCategoryPage title="Experiences" />}
      />
      <Route
        path="messaging"
        element={<AdminCategoryPage title="Messaging" />}
      />
      <Route path="settings" element={<AdminCategoryPage title="Settings" />} />

      <Route path="content/homepage" element={<HomepageCMS />} />
      <Route path="content/scale-worlds" element={<ScaleWorldsAdmin />} />
      <Route path="content/about" element={<AboutCMS />} />
      <Route path="content/glossary" element={<GlossaryAdmin />} />
      <Route path="content/theses" element={<ThesesAdmin />} />
      <Route path="content/categories" element={<CategoriesAdmin />} />

      <Route path="members/team" element={<TeamAdmin />} />

      <Route path="experiences/events" element={<EventsAdmin />} />
      <Route path="experiences/expeditions" element={<ExpeditionsAdmin />} />
      <Route
        path="experiences/applications"
        element={<ExpeditionInquiriesAdmin />}
      />
      <Route
        path="experiences/custom"
        element={<CustomExpeditionInquiriesAdmin />}
      />

      <Route path="messaging/conversations" element={<ConversationsAdmin />} />
      <Route path="messaging/contact" element={<ContactMessagesAdmin />} />

      <Route path="identity" element={<IdentityOverview />} />
      <Route path="identity/review" element={<IdentityReview />} />
      <Route path="identity/daily-scan" element={<DailyIdentityScan />} />
      <Route path="identity/settings" element={<IdentitySettingsPage />} />
      <Route path="identity/sources" element={<IdentitySources />} />
      <Route path="identity/method" element={<MethodPage />} />

      <Route path="settings/design" element={<SiteSettingsAdmin />} />

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Route>
  );
}
