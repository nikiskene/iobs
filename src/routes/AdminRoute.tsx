import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAuth();

  if (loading) return <div className="auth-loader">Opening the Institute…</div>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
