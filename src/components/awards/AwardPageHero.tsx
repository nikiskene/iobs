// src/components/awards/AwardPageHero.tsx
import type { ReactNode } from 'react';

export default function AwardPageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="ibs-page-hero award-page-hero">
      <p className="ibs-eyebrow">{eyebrow}</p>
      <div><h1>{title}</h1><p>{children}</p></div>
    </section>
  );
}
