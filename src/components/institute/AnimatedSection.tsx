// src/components/institute/AnimatedSection.tsx

import {
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';

type AnimatedSectionProps = PropsWithChildren<{
  delay?: number;
  y?: number;
  scale?: number;
}>;

export default function AnimatedSection({
  children,
  delay = 0,
  y = 48,
  scale = 0.985,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translate3d(0,0,0) scale(1)"
          : `translate3d(0,${y}px,0) scale(${scale})`,
        transition: `
          opacity 900ms ease ${delay}ms,
          transform 1100ms cubic-bezier(.22,1,.36,1) ${delay}ms
        `,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </section>
  );
}