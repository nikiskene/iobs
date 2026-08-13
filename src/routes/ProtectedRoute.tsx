import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return <div className="auth-loader">Opening your private space…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
