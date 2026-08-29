import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function TeamRoute({ children }: { children: React.ReactNode }) {
  const { user, hasTeamAccess, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!hasTeamAccess) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
