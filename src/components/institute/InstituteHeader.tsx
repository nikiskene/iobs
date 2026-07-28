// src/components/institute/InstituteHeader.tsx

import { Link } from 'react-router-dom';
import { useImpactScale } from '../../providers/ImpactScaleProvider';

const LOGO =
  'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/logo/V2%20transparent.png';

const NAV = [
  ['Library', '/library'],
  ['Identity Engine', '/identity'],
  ['Expeditions', '/expeditions'],
  ['Salon', '/salon'],
  ['Membership', '/membership'],
];

export default function InstituteHeader() {
  const { scale } = useImpactScale();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 2000,
        backdropFilter: 'blur(18px)',
        background: 'rgba(255,251,245,.72)',
        borderBottom: '1px solid rgba(184,138,59,.12)',
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '18px 42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 40,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={LOGO}
            alt="Institute of Beautiful Success"
            style={{
              height: 62,
              width: 'auto',
              display: 'block',
            }}
          />
        </Link>

        <nav
          style={{
            display: 'flex',
            gap: 34,
            alignItems: 'center',
          }}
        >
          {NAV.map(([label, href]) => (
            <Link
              key={label}
              to={href}
              style={{
                textDecoration: 'none',
                color: '#5d5448',
                fontSize: 15,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              background: 'rgba(184,138,59,.09)',
              color: '#9a7434',
              fontSize: 13,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
            }}
          >
            {scale}
          </div>

          <button
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '14px 24px',
              background: '#b58a3d',
              color: '#fff',
              cursor: 'pointer',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              fontSize: 14,
            }}
          >
            Join
          </button>
        </div>
      </div>
    </header>
  );
}