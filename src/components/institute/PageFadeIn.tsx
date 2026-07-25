// src/components/institute/PageFadeIn.tsx

import { PropsWithChildren, useEffect, useState } from 'react';

export default function PageFadeIn({
  children,
}: PropsWithChildren) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setVisible(true);
    });

    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateY(0)'
          : 'translateY(24px)',
        transition:
          'opacity .9s ease, transform .9s ease',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}