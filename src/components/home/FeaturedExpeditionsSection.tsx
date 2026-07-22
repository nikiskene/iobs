// src/components/home/FeaturedExpeditionsSection.tsx
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Compass, MapPin } from 'lucide-react';
import type { Expedition } from '../../lib/types';

const customExpeditionImage =
  'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/expedition-media/IMG_2923.JPG';

export default function FeaturedExpeditionsSection({
  expeditions,
}: {
  expeditions: Expedition[];
}) {
  return (
    <section className="relative z-10 border-t border-white/5 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeader />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {expeditions.map((expedition) => (
            <ExpeditionCard key={expedition.id} expedition={expedition} />
          ))}
        </div>

        <CustomExpeditionStrip />
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">
          Expeditions
        </p>

        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          Go where the next system is already being built.
        </h2>
      </div>

      <Link
        to="/expeditions"
        className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-sky-300 hover:text-sky-200"
      >
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ExpeditionCard({ expedition }: { expedition: Expedition }) {
  return (
    <Link
      to={`/expeditions/${expedition.slug}`}
      className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition hover:-translate-y-1 hover:border-white/15"
    >
      <ExpeditionImage expedition={expedition} />

      <div className="p-5">
        <ExpeditionMeta expedition={expedition} />

        <h3 className="mt-4 text-xl font-bold leading-tight">
          {expedition.title}
        </h3>

        {expedition.short_description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-400">
            {expedition.short_description}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-4">
          {expedition.price && (
            <p className="text-sm font-semibold text-white">{expedition.price}</p>
          )}

          <span className="inline-flex items-center gap-2 text-sm font-medium text-sky-400">
            Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CustomExpeditionStrip() {
  return (
    <Link
      to="/expeditions/custom"
      className="group mt-6 grid overflow-hidden rounded-2xl border border-sky-300/20 bg-white/[0.035] transition hover:border-sky-300/40 md:grid-cols-[260px_1fr]"
    >
      <div className="h-40 overflow-hidden md:h-full">
        <img
          src={customExpeditionImage}
          alt="Custom Expedition"
          className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex items-center justify-between gap-6 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">
            Custom Expedition
          </p>

          <h3 className="mt-3 text-2xl font-bold text-white">
            Build your own field study.
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Curated programs for companies, governments and education.
          </p>
        </div>

        <ArrowRight className="hidden h-5 w-5 shrink-0 text-sky-300 transition group-hover:translate-x-1 md:block" />
      </div>
    </Link>
  );
}

function ExpeditionImage({ expedition }: { expedition: Expedition }) {
  return (
    <div className="aspect-[16/9] overflow-hidden bg-white/5">
      {expedition.hero_image_url ? (
        <img
          src={expedition.hero_image_url}
          alt={expedition.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-sky-500/10 text-sky-300">
          <Compass className="h-9 w-9" />
        </div>
      )}
    </div>
  );
}

function ExpeditionMeta({ expedition }: { expedition: Expedition }) {
  return (
    <div className="space-y-1.5 text-xs text-zinc-400">
      {expedition.location && (
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          {expedition.location}
        </div>
      )}

      {expedition.start_date && (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(expedition.start_date, expedition.end_date)}
        </div>
      )}
    </div>
  );
}

function formatDate(start?: string | null, end?: string | null) {
  if (!start) return 'Date tba';

  const startDate = new Date(start).toLocaleDateString();
  if (!end) return startDate;

  return `${startDate} — ${new Date(end).toLocaleDateString()}`;
}