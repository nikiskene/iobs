// src/components/institute/InstituteHeader.tsx

import { Link } from 'react-router-dom';
import { AWARD_ASSETS } from '../../content/awardAssets';

export default function InstituteHeader() {
  return (
    <header className="institute-header">
      <Link className="institute-logo" to="/" aria-label="Institute of Beautiful Success">
        <img src={AWARD_ASSETS.circleDark} alt="Beautiful Success Award" />
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
