// src/components/institute/ScrollProgress.tsx

import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const height =
        document.documentElement.scrollHeight -
        window.innerHeight;

      if (height <= 0) {
        setProgress(0);
        return;
      }

      setProgress(window.scrollY / height);
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
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 5000,
          background: 'rgba(181,138,61,.08)',
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background:
              'linear-gradient(90deg,#8d6328,#b58a3d,#e0c17b)',
            transition: 'width .08s linear',
          }}
        />
      </div>

      <div
        style={{
          position: 'fixed',
          right: 26,
          bottom: 26,
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.78)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(184,138,59,.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4000,
        }}
      >
        <svg
          width="42"
          height="42"
          viewBox="0 0 42 42"
        >
          <circle
            cx="21"
            cy="21"
            r="18"
            fill="none"
            stroke="rgba(184,138,59,.15)"
            strokeWidth="2"
          />

          <circle
            cx="21"
            cy="21"
            r="18"
            fill="none"
            stroke="#b58a3d"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={113}
            strokeDashoffset={113 - progress * 113}
            transform="rotate(-90 21 21)"
          />

          <text
            x="21"
            y="24"
            textAnchor="middle"
            fontSize="10"
            fill="#8d6328"
          >
            {Math.round(progress * 100)}%
          </text>
        </svg>
      </div>
    </>
  );
}