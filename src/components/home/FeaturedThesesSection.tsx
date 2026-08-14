// src/components/home/FeaturedThesesSection.tsx
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Thesis } from '../../lib/types';

export default function FeaturedThesesSection({ theses }: { theses: Thesis[] }) {
  return (
    <section className="relative z-10 border-t border-white/5 px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">
              Featured Thesis
            </p>

            <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Ideas sharp enough to reorganize a conversation.
            </h2>
          </div>

          <Link
            to="/thesis"
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-sky-300 hover:text-sky-200"
          >
            Explore all theses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {theses.map((thesis) => (
            <ThesisCard key={thesis.id} thesis={thesis} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ThesisCard({ thesis }: { thesis: Thesis }) {
  const image = thesis.thesis_media?.find((item) => item.is_featured) || thesis.thesis_media?.[0];

  return (
    <Link
      to={`/thesis/${thesis.id}`}
      className="group rounded-3xl border border-white/5 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:border-white/15"
    >
      {image?.file_url ? (
        <div className="mb-6 aspect-[16/10] overflow-hidden rounded-2xl bg-white/5">
          <img
            src={image.file_url}
            alt={image.alt_text || thesis.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
          <Sparkles className="h-5 w-5" />
        </div>
      )}

      {thesis.thesis_categories?.name && (
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
          {thesis.thesis_categories.name}
        </p>
      )}

      <h3 className="mt-4 text-2xl font-bold leading-tight">{thesis.title}</h3>

      {(thesis.subheadline || thesis.short_explanation) && (
        <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-zinc-400">
          {thesis.subheadline || thesis.short_explanation}
        </p>
      )}

      <div className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-sky-400">
        Read thesis <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}