// src/components/institute/InstituteHeader.tsx

import { Link } from 'react-router-dom';

const LOGO =
  'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V2a%20transparent.png';

export default function InstituteHeader() {
  return (
    <header className="institute-header">
      <Link className="institute-logo" to="/" aria-label="Institute of Beautiful Success">
        <img src={LOGO} alt="Institute of Beautiful Success" />
      </Link>
      <nav aria-label="Main navigation">
        <Link to="/award">The Award</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/judging">How We Judge</Link>
        <Link to="/voices">Founding Voices</Link>
        <Link to="/partners">Partners</Link>
      </nav>
      <Link className="enter-link" to="/nominate">Nominate</Link>
    </header>
  );
}
