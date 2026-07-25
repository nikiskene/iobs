// src/components/institute/ParallaxBackground.tsx

import { useEffect, useState } from 'react';

export default function ParallaxBackground() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * 0.18);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            top: -280 + offset * 0.2,
            left: -220,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(181,138,61,.12), transparent 72%)',
            filter: 'blur(70px)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: 760,
            height: 760,
            right: -180,
            top: 300 - offset * 0.15,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(181,138,61,.10), transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: 640,
            height: 640,
            left: '55%',
            bottom: -260 + offset * 0.12,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(181,138,61,.08), transparent 75%)',
            filter: 'blur(90px)',
            transform: 'translateX(-50%)',
          }}
        />
      </div>
    </>
  );
}