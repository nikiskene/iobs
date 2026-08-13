// src/pages/auth/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .maybeSingle();
    navigate(profile?.role === 'admin' ? '/admin' : '/dashboard');
  }

  return (
    <main className="ibs-join">
      <div className="ibs-join-copy">
        <p className="ibs-eyebrow">Private access</p>
        <h1>Welcome back.</h1>
        <p>Enter the private administration and community behind the Beautiful Success Awards.</p>
      </div>
      <div>
        <form onSubmit={handleLogin} className="ibs-join-form">
          <div className="ibs-field"><label>Email</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /></div>
          <div className="ibs-field"><label>Password</label><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Your password" /></div>
          {error && <div className="ibs-form-error">{error}</div>}
          <button type="submit" disabled={loading} className="ibs-submit">{loading ? 'Opening the door…' : 'Enter'}</button>
        </form>
        <p className="ibs-form-note">Not yet a member? <Link to="/join">Join the Institute</Link></p>
      </div>
    </main>
  );
}
