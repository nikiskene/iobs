import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function JoinPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <main className="ibs-join">
      <div className="ibs-join-copy">
        <p className="ibs-eyebrow">Membership · Public beta</p>
        <h1>Join the Institute.</h1>
        <p>Enter the WorldOS community behind the Institute of Beautiful Success—a place for people building more beautiful definitions of success.</p>
      </div>
      <div>
        <form onSubmit={handleSignup} className="ibs-join-form">
          <div className="ibs-field">
            <label>Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Your full name"
            />
          </div>
          <div className="ibs-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="ibs-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div className="ibs-form-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="ibs-submit"
          >
            {loading ? 'Preparing your membership…' : 'Enter the public beta'}
          </button>
        </form>

        <p className="ibs-form-note">
          Already have an account?{' '}
          <Link to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
