import { lazy } from 'react';
import { Route } from 'react-router-dom';
import Navigation from '../components/Navigation';
import DashboardLayout from '../components/DashboardLayout';
import TeamRoute from './TeamRoute';

const TeamMomentumPage = lazy(() => import('../pages/team/TeamMomentumPage'));

export default function TeamRoutes() {
  return (
    <Route path="/work" element={<TeamRoute><Navigation /><DashboardLayout /></TeamRoute>}>
      <Route index element={<TeamMomentumPage />} />
    </Route>
  );
}
