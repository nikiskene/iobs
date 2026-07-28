// src/components/institute/LuxuryScrollbar.tsx

import { useEffect, useState } from 'react';

export default function LuxuryScrollbar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const height =
        document.documentElement.scrollHeight -
        window.innerHeight;

      setProgress(height > 0 ? window.scrollY / height : 0);
    };

    update();

    window.addEventListener('scroll', update, {
      passive: true,
    });

    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 18,
        height: '100vh',
        width: 4,
        zIndex: 4000,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 999,
          background: 'rgba(181,138,61,.08)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${Math.max(progress * 100, 8)}%`,
          borderRadius: 999,
          background:
            'linear-gradient(180deg,#f7e8c3,#d8b36b,#9b7132)',
          boxShadow: '0 0 18px rgba(181,138,61,.35)',
          transition: 'height .08s linear',
        }}
      />
    </div>
  );
}