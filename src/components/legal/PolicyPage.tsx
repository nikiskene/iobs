// src/components/legal/PolicyPage.tsx
import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import './policyPage.css';

type Props = PropsWithChildren<{ eyebrow: string; title: string; updated?: string }>;

export default function PolicyPage({ eyebrow, title, updated = '13 August 2026', children }: Props) {
  return <main className="policy-page">
    <header className="policy-hero"><p>{eyebrow}</p><h1>{title}</h1><span>Last updated {updated}</span></header>
    <div className="policy-grid">
      <nav aria-label="Legal pages"><Link to="/legal">Imprint</Link><Link to="/privacy">Privacy</Link><Link to="/cookies">Cookies</Link><Link to="/terms">Terms</Link></nav>
      <article className="policy-copy">{children}</article>
    </div>
  </main>;
}
