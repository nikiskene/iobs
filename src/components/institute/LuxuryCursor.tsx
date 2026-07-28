// src/components/institute/LuxuryCursor.tsx

import { useEffect, useState } from 'react';

export default function LuxuryCursor() {
  const [{ x, y }, setPosition] = useState({
    x: -100,
    y: -100,
  });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener('mousemove', move, {
      passive: true,
    });

    return () =>
      window.removeEventListener('mousemove', move);
  }, []);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: x,
          top: y,
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: '2px solid rgba(181,138,61,.9)',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'left .08s linear, top .08s linear',
          mixBlendMode: 'difference',
        }}
      />

      <div
        style={{
          position: 'fixed',
          left: x,
          top: y,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '1px solid rgba(181,138,61,.28)',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
          zIndex: 9998,
          transition:
            'left .22s ease-out, top .22s ease-out',
        }}
      />
    </>
  );
}