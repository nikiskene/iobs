// src/routes/PublicRoutes.tsx
import { Navigate, Route } from 'react-router-dom';

import PublicLayout from './PublicLayout';

import InstituteHomePage from '../pages/InstituteHomePage';
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
import InstitutePublicFrame from '../components/institute/InstitutePublicFrame';

import LoginPage from '../pages/auth/LoginPage';
import BuildSnapshot from '../pages/BuildSnapshot';
import AwardPage from '../pages/awards/AwardPage';
import CategoriesPage from '../pages/awards/CategoriesPage';
import JudgingPage from '../pages/awards/JudgingPage';
import NominatePage from '../pages/awards/NominatePage';
import EnterAwardPage from '../pages/awards/EnterAwardPage';
import PartnersPage from '../pages/awards/PartnersPage';
import VoicesPage from '../pages/awards/VoicesPage';
import AssemblyPage from '../pages/awards/AssemblyPage';

export default function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<InstituteHomePage />} />
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
      <Route path="/snapshot" element={<BuildSnapshot />} />
    </>
  );
}
