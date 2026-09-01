// src/routes/PublicRoutes.tsx
import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';

import PublicLayout from './PublicLayout';

import InstitutePublicFrame from '../components/institute/InstitutePublicFrame';
import InstituteHomePage from '../pages/InstituteHomePage';

const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const MembersDirectoryPage = lazy(() => import('../pages/public/MembersDirectoryPage'));
const MemberProfilePage = lazy(() => import('../pages/public/MemberProfilePage'));
const ThesisPage = lazy(() => import('../pages/public/ThesisPage'));
const JoinPage = lazy(() => import('../pages/public/JoinPage'));
const LegalPage = lazy(() => import('../pages/public/LegalPage'));
const EventsPage = lazy(() => import('../pages/public/EventsPage'));
const EventDetailPage = lazy(() => import('../pages/public/EventDetailPage'));
const ExpeditionsPage = lazy(() => import('../pages/public/ExpeditionsPage'));
const ExpeditionDetailPage = lazy(() => import('../pages/public/ExpeditionDetailPage'));
const CustomExpeditionPage = lazy(() => import('../pages/public/CustomExpeditionPage'));
const MethodWorldOSPage = lazy(() => import('../pages/public/MethodWorldOSPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const BuildSnapshot = lazy(() => import('../pages/BuildSnapshot'));
const AwardPage = lazy(() => import('../pages/awards/AwardPage'));
const CategoriesPage = lazy(() => import('../pages/awards/CategoriesPage'));
const JudgingPage = lazy(() => import('../pages/awards/JudgingPage'));
const NominatePage = lazy(() => import('../pages/awards/NominatePage'));
const EnterAwardPage = lazy(() => import('../pages/awards/EnterAwardPage'));
const PartnersPage = lazy(() => import('../pages/awards/PartnersPage'));
const VoicesPage = lazy(() => import('../pages/awards/VoicesPage'));
const AssemblyPage = lazy(() => import('../pages/awards/AssemblyPage'));
const HomeV3Page = lazy(() => import('../pages/HomeV3Page'));

export default function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<InstituteHomePage />} />
      <Route path="/beta" element={<HomeV3Page />} />
      <Route path="/institute" element={<Navigate to="/" replace />} />
      <Route path="/award" element={<InstitutePublicFrame><AwardPage /></InstitutePublicFrame>} />
      <Route path="/categories" element={<InstitutePublicFrame><CategoriesPage /></InstitutePublicFrame>} />
      <Route path="/judging" element={<InstitutePublicFrame><JudgingPage /></InstitutePublicFrame>} />
      <Route path="/nominate" element={<InstitutePublicFrame><NominatePage /></InstitutePublicFrame>} />
      <Route path="/enter" element={<InstitutePublicFrame><EnterAwardPage /></InstitutePublicFrame>} />
      <Route path="/partners" element={<InstitutePublicFrame><PartnersPage /></InstitutePublicFrame>} />
      <Route path="/voices" element={<InstitutePublicFrame><VoicesPage /></InstitutePublicFrame>} />
      <Route path="/assembly" element={<InstitutePublicFrame><AssemblyPage /></InstitutePublicFrame>} />
      <Route path="/method" element={<InstitutePublicFrame><MethodWorldOSPage /></InstitutePublicFrame>} />
      <Route path="/contact" element={<InstitutePublicFrame><ContactPage /></InstitutePublicFrame>} />

      <Route
        path="/about"
        element={
          <PublicLayout>
            <AboutPage />
          </PublicLayout>
        }
      />

      <Route path="/our-team" element={<Navigate to="/members" replace />} />
      <Route path="/members" element={<PublicLayout><MembersDirectoryPage /></PublicLayout>} />
      <Route path="/members/:profileName" element={<PublicLayout><MemberProfilePage /></PublicLayout>} />

      <Route
        path="/thesis"
        element={
          <InstitutePublicFrame><div className="ibs-cases"><ThesisPage /></div></InstitutePublicFrame>
        }
      />

      <Route
        path="/thesis/:slug"
        element={
          <InstitutePublicFrame><div className="ibs-cases"><ThesisPage /></div></InstitutePublicFrame>
        }
      />

      <Route
        path="/expeditions"
        element={
          <InstitutePublicFrame>
            <ExpeditionsPage />
          </InstitutePublicFrame>
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
          <InstitutePublicFrame>
            <EventsPage />
          </InstitutePublicFrame>
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
          <InstitutePublicFrame>
            <JoinPage />
          </InstitutePublicFrame>
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

      <Route path="/login" element={<InstitutePublicFrame><LoginPage /></InstitutePublicFrame>} />
      <Route path="/reset-password" element={<InstitutePublicFrame><ResetPasswordPage /></InstitutePublicFrame>} />
      <Route path="/snapshot" element={<BuildSnapshot />} />
    </>
  );
}
