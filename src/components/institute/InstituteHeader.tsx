// src/components/institute/InstituteHeader.tsx

import { Link } from 'react-router-dom';

const LOGO =
  'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/logo/V2%20transparent.png';

export default function InstituteHeader() {
  return (
    <header className="institute-header">
      <Link className="institute-logo" to="/" aria-label="Institute of Beautiful Success">
        <img src={LOGO} alt="Institute of Beautiful Success" />
      </Link>
      <nav aria-label="Main navigation">
        <a href="/#method">The Method</a>
        <Link to="/expeditions">Expeditions</Link>
        <Link to="/join">Consulting</Link>
        <Link to="/dashboard/explorers">Fellowship</Link>
      </nav>
      <Link className="enter-link" to="/login">Enter <span>↗</span></Link>
    </header>
  );
}
