// src/components/institute/Footer.tsx

import { Link } from 'react-router-dom';

const logo =
  'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/logo/V2%20transparent.png';

export default function Footer() {
  return (
    <footer
      style={{
        padding: '120px 40px 60px',
        borderTop: '1px solid rgba(181,138,61,.12)',
        background:
          'linear-gradient(180deg,transparent,#f6f2ea)',
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 40,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <img
            src={logo}
            alt="Institute of Beautiful Success"
            style={{
              height: 54,
              display: 'block',
              marginBottom: 18,
            }}
          />

          <div
            style={{
              maxWidth: 420,
              lineHeight: 1.8,
              color: '#6f685d',
            }}
          >
            Building people, organizations and civilizations
            that are capable of creating beautiful success.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 28,
            flexWrap: 'wrap',
            fontSize: 15,
          }}
        >
          <Link to="/identity-engine">Identity Engine</Link>

          <Link to="/expeditions">Expeditions</Link>

          <Link to="/membership">Membership</Link>

          <Link to="/library">Library</Link>

          <Link to="/about">About</Link>

          <Link to="/contact">Contact</Link>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1320,
          margin: '70px auto 0',
          paddingTop: 28,
          borderTop: '1px solid rgba(181,138,61,.08)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          color: '#8f877b',
          fontSize: 13,
        }}
      >
        <span>© 2026 Institute of Beautiful Success</span>

        <span>
          Curiosity. Identity. Possibility. Beautiful Success.
        </span>
      </div>
    </footer>
  );
}