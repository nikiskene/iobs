// src/components/institute/FloatingQuote.tsx

import { useEffect, useMemo, useState } from 'react';

const QUOTES = [
  'If you could build anything in the world...',
  'Information became a commodity.',
  'Clarity became the scarce resource.',
  'Beautiful Success.',
  'What is the world becoming?',
  'Curiosity is a strategy.',
];

export default function FloatingQuote() {
  const quote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    []
  );

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(window.scrollY > 700);

    show();

    window.addEventListener('scroll', show, {
      passive: true,
    });

    return () =>
      window.removeEventListener('scroll', show);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        left: 32,
        bottom: 32,
        zIndex: 3500,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateY(0)'
          : 'translateY(30px)',
        transition: '.6s ease',
      }}
    >
      <div
        style={{
          maxWidth: 340,
          padding: '18px 22px',
          borderRadius: 22,
          background: 'rgba(255,255,255,.72)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(184,138,59,.16)',
          boxShadow: '0 12px 40px rgba(0,0,0,.05)',
        }}
      >
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontSize: 28,
            lineHeight: 1.3,
            color: '#8d6328',
          }}
        >
          “{quote}”
        </div>
      </div>
    </div>
  );
}