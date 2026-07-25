// src/components/institute/MouseGlow.tsx

import { useEffect, useState } from 'react';

export default function MouseGlow() {
  const [{ x, y }, setPosition] = useState({
    x: -500,
    y: -500,
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          left: x - 260,
          top: y - 260,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(181,138,61,.09), transparent 72%)',
          filter: 'blur(28px)',
          transition:
            'left .12s linear, top .12s linear',
        }}
      />
    </div>
  );
}