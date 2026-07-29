// src/pages/TransitionPage.tsx
import { Link } from 'react-router-dom';
import './transitionPage.css';

const instituteLogo = 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/logo/V2%20transparent.png';

export default function TransitionPage() {
  return (
    <main className="transition-page">
      <div className="transition-glow" aria-hidden="true" />
      <section className="transition-content" aria-labelledby="transition-title">
        <div className="worldos-mark" aria-label="worldOS">
          <span>world</span><strong>OS</strong>
        </div>
        <div className="transition-rule" aria-hidden="true"><span /></div>
        <h1 id="transition-title">
          worldOS is now part of the
          <span>Institute of Beautiful Success</span>
        </h1>
        <img className="transition-institute-logo" src={instituteLogo} alt="Institute of Beautiful Success" />
        <Link className="transition-enter" to="/institute">
          <span>Enter the public beta</span><span aria-hidden="true">↗</span>
        </Link>
      </section>
      <p className="transition-note">A new chapter in beautiful success</p>
    </main>
  );
}
