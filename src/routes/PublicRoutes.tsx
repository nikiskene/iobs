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
import InstitutePublicFrame from '../components/institute/InstitutePublicFrame';

import LoginPage from '../pages/auth/LoginPage';
import BuildSnapshot from '../pages/BuildSnapshot';

export default function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<TransitionPage />} />
      <Route path="/institute" element={<InstituteHomePage />} />
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
