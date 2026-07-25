// src/components/institute/Atmosphere.tsx

import { useEffect, useState } from 'react';

type Particle = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
};

export default function Atmosphere() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 28 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 6,
        duration: 14 + Math.random() * 18,
        delay: Math.random() * 12,
      }))
    );
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes ibs-float {
            0% {
              transform: translateY(0px);
              opacity:.15;
            }
            50% {
              transform: translateY(-22px);
              opacity:.55;
            }
            100% {
              transform: translateY(0px);
              opacity:.15;
            }
          }
        `}
      </style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {particles.map((particle, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              background: '#c8a35b',
              opacity: .18,
              animation: `ibs-float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}