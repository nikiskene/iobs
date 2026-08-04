// src/components/institute/InstituteHeader.tsx

import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LOGO =
  'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V2a%20transparent.png';

export default function InstituteHeader() {
  const { user } = useAuth();
  return (
    <header className="institute-header">
      <Link className="institute-logo" to="/institute" aria-label="Institute of Beautiful Success">
        <img src={LOGO} alt="Institute of Beautiful Success" />
      </Link>
      <nav aria-label="Main navigation">
        <Link to="/method">Method / WorldOS</Link>
        <Link to="/events">Events</Link>
        <Link to={user ? '/dashboard/explorers' : '/join'}>Community</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <Link className="enter-link" to="/login">Enter</Link>
    </header>
  );
}
