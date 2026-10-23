import { lazy } from 'react';
import { Route } from 'react-router-dom';
import Navigation from '../components/Navigation';
import DashboardLayout from '../components/DashboardLayout';
import TeamRoute from './TeamRoute';

const WaiversPage = lazy(() => import('../pages/team/WaiversPage'));
const ChapterOffice = lazy(() => import('../pages/team/ChapterOffice'));
const TeamMomentumPage = lazy(() => import('../pages/team/TeamMomentumPage'));

export default function TeamRoutes() {
  return (
    <>
    <Route path="/chapter-office" element={<><Navigation /><ChapterOffice /></>} />
    <Route path="/work" element={<TeamRoute><Navigation /><DashboardLayout /></TeamRoute>}>
      <Route index element={<TeamMomentumPage />} />
      <Route path="waivers" element={<WaiversPage />} />
    </Route>
    </>
  );
}
