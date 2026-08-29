import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function TeamRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [databaseAccess, setDatabaseAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setDatabaseAccess(false); return; }
    supabase.rpc('has_team_momentum_access').then(({ data, error }) => {
      setDatabaseAccess(!error && data === true);
    });
  }, [user]);

  if (loading || (user && databaseAccess === null)) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!databaseAccess) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
