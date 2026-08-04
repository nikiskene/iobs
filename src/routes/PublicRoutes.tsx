// src/routes/PublicRoutes.tsx
import { Route } from 'react-router-dom';

import PublicLayout from './PublicLayout';

import InstituteHomePage from '../pages/InstituteHomePage';
import TransitionPage from '../pages/TransitionPage';
import AboutPage from '../pages/public/AboutPage';
import TeamPage from '../pages/public/TeamPage';
import ThesisPage from '../pages/public/ThesisPage';
import JoinPage from '../pages/public/JoinPage';
import LegalPage from '../pages/public/LegalPage';
import EventsPage from '../pages/public/EventsPage';
import EventDetailPage from '../pages/public/EventDetailPage';
import ExpeditionsPage from '../pages/public/ExpeditionsPage';
import ExpeditionDetailPage from '../pages/public/ExpeditionDetailPage';
import CustomExpeditionPage from '../pages/public/CustomExpeditionPage';
import MethodWorldOSPage from '../pages/public/MethodWorldOSPage';
import ContactPage from '../pages/public/ContactPage';

import LoginPage from '../pages/auth/LoginPage';
import BuildSnapshot from '../pages/BuildSnapshot';

export default function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<TransitionPage />} />
      <Route path="/institute" element={<InstituteHomePage />} />
      <Route path="/method" element={<PublicLayout><MethodWorldOSPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />

      <Route
        path="/about"
        element={
          <PublicLayout>
            <AboutPage />
          </PublicLayout>
        }
      />

      <Route
        path="/team"
        element={
          <PublicLayout>
            <TeamPage />
          </PublicLayout>
        }
      />

      <Route
        path="/thesis"
        element={
          <PublicLayout>
            <ThesisPage />
          </PublicLayout>
        }
      />

      <Route
        path="/thesis/:slug"
        element={
          <PublicLayout>
            <ThesisPage />
          </PublicLayout>
        }
      />

      <Route
        path="/expeditions"
        element={
          <PublicLayout>
            <ExpeditionsPage />
          </PublicLayout>
        }
      />

      <Route
        path="/expeditions/custom"
        element={
          <PublicLayout>
            <CustomExpeditionPage />
          </PublicLayout>
        }
      />

      <Route
        path="/expeditions/:slug"
        element={
          <PublicLayout>
            <ExpeditionDetailPage />
          </PublicLayout>
        }
      />

      <Route
        path="/events"
        element={
          <PublicLayout>
            <EventsPage />
          </PublicLayout>
        }
      />

      <Route
        path="/events/:slug"
        element={
          <PublicLayout>
            <EventDetailPage />
          </PublicLayout>
        }
      />

      <Route
        path="/join"
        element={
          <PublicLayout>
            <JoinPage />
          </PublicLayout>
        }
      />

      <Route
        path="/legal"
        element={
          <PublicLayout>
            <LegalPage />
          </PublicLayout>
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/snapshot" element={<BuildSnapshot />} />
    </>
  );
}
