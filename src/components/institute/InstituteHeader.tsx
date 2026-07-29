// src/components/institute/InstituteHeader.tsx

import { Link } from 'react-router-dom';
import { useImpactScale } from '../../providers/ImpactScaleProvider';

const LOGO =
  'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/logo/V2%20transparent.png';

export default function InstituteHeader() {
  const { scale } = useImpactScale();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '28px 0 12px',
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
        }}
      >
        <img
          src={LOGO}
          alt="Institute of Beautiful Success"
          style={{
            height: 82,
            width: 'auto',
            objectFit: 'contain',
          }}
        />
      </Link>

      <nav
        style={{
          display: 'flex',
          gap: 36,
          alignItems: 'center',
          fontSize: 15,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
        }}
      >
        <Link className="ibs-nav" to="/library">
          Library
        </Link>

        <Link className="ibs-nav" to="/expeditions">
          Expeditions
        </Link>

        <Link className="ibs-nav" to="/conversations">
          Salon
        </Link>

        <Link className="ibs-nav" to="/identity">
          Observatory
        </Link>

        <Link className="ibs-nav" to="/members">
          Fellows
        </Link>

        <div
          style={{
            padding: '10px 18px',
            border: '1px solid rgba(184,138,59,.45)',
            borderRadius: 999,
            color: '#b88a3b',
            fontWeight: 600,
            cursor: 'default',
          }}
        >
          {scale === 'world' ? 'The Whole World' : 'The Dial'}
        </div>
      </nav>
    </header>
  );
}