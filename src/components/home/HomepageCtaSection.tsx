// src/components/home/HomepageCtaSection.tsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { HomepageSection } from '../../lib/types';

export default function HomepageCtaSection({
  cta,
}: {
  cta: HomepageSection;
}) {
  return (
    <section className="relative z-10 px-6 py-28">
      <div className="mx-auto max-w-3xl text-center">
        {cta.subheadline && (
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">
            {cta.subheadline}
          </p>
        )}

        {cta.headline && (
          <h2 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
            {cta.headline}
          </h2>
        )}

        {cta.body && (
          <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-zinc-400">
            {cta.body}
          </p>
        )}

        <Link
          to="/join"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-sky-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-400"
        >
          Join WorldOS <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}