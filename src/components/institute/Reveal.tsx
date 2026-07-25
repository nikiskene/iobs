// src/components/institute/Reveal.tsx

import {
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';

type RevealProps = PropsWithChildren<{
  delay?: number;
  distance?: number;
}>;

export default function Reveal({
  children,
  delay = 0,
  distance = 40,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateY(0)'
          : `translateY(${distance}px)`,
        transition: `
          opacity .9s ease ${delay}ms,
          transform .9s cubic-bezier(.22,1,.36,1) ${delay}ms
        `,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}