// src/components/institute/InstituteBackground.tsx

import { useImpactScale } from '../../providers/ImpactScaleProvider';

export default function InstituteBackground() {
  const { scale } = useImpactScale();

  const opacity =
    scale === 'self'
      ? 0.06
      : scale === 'world'
      ? 0.14
      : 0.09;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            left: -250,
            top: -220,
            borderRadius: '50%',
            background:
              'radial-gradient(circle,#c79d49 0%,transparent 72%)',
            opacity,
            filter: 'blur(110px)',
            transition: 'all .8s ease',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: 1000,
            height: 1000,
            right: -300,
            bottom: -300,
            borderRadius: '50%',
            background:
              'radial-gradient(circle,#8b5d2f 0%,transparent 72%)',
            opacity: opacity * 0.65,
            filter: 'blur(150px)',
            transition: 'all .8s ease',
          }}
        />

        <svg
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            opacity,
          }}
        >
          <defs>
            <pattern
              id="ibs-grid"
              width="90"
              height="90"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M90 0H0V90"
                fill="none"
                stroke="#b88a3b"
                strokeWidth=".4"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#ibs-grid)"
          />
        </svg>
      </div>
    </>
  );
}