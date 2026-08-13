// src/routes/AdminRoutes.tsx
// src/routes/AdminRoutes.tsx
import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';

import Navigation from '../components/Navigation';
import DashboardLayout from '../components/DashboardLayout';

import AdminRoute from './AdminRoute';

const AdminHome = lazy(() => import('../pages/admin/AdminHome'));
const AdminCategoryPage = lazy(() => import('../pages/admin/AdminCategoryPage'));
const HomepageCMS = lazy(() => import('../pages/admin/HomepageCMS'));
const AboutCMS = lazy(() => import('../pages/admin/AboutCMS'));
const CategoriesAdmin = lazy(() => import('../pages/admin/CategoriesAdmin'));
const ThesesAdmin = lazy(() => import('../pages/admin/ThesesAdmin'));
const TeamAdmin = lazy(() => import('../pages/admin/TeamAdmin'));
const SiteSettingsAdmin = lazy(() => import('../pages/admin/SiteSettingsAdmin'));
const GlossaryAdmin = lazy(() => import('../pages/admin/GlossaryAdmin'));
const ScaleWorldsAdmin = lazy(() => import('../pages/admin/ScaleWorldsAdmin'));
const PartnerLogosAdmin = lazy(() => import('../pages/admin/PartnerLogosAdmin'));
const EventsAdmin = lazy(() => import('../pages/admin/events/EventsAdmin'));
const ExpeditionsAdmin = lazy(() => import('../pages/admin/expeditions/ExpeditionsAdmin'));
const ExpeditionInquiriesAdmin = lazy(() => import('../pages/admin/expeditions/ExpeditionInquiriesAdmin'));
const CustomExpeditionInquiriesAdmin = lazy(() => import('../pages/admin/expeditions/CustomExpeditionInquiriesAdmin'));
const ConversationsAdmin = lazy(() => import('../pages/admin/conversations/ConversationsAdmin'));
const ContactMessagesAdmin = lazy(() => import('../pages/admin/ContactMessagesAdmin'));
const IdentityOverview = lazy(() => import('../pages/admin/identity/IdentityOverview'));
const IdentityReview = lazy(() => import('../pages/admin/identity/IdentityReview'));
const IdentitySources = lazy(() => import('../pages/admin/identity/IdentitySources'));
const MethodPage = lazy(() => import('../pages/admin/identity/MethodPage'));
const DailyIdentityScan = lazy(() => import('../pages/admin/identity/DailyIdentityScan'));
const IdentitySettingsPage = lazy(() => import('../pages/admin/identity/IdentitySettingsPage'));

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
      <Route path="content/partners" element={<PartnerLogosAdmin />} />

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
