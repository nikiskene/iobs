import { CalendarDays, MapPin } from 'lucide-react';
import type { Expedition } from '../../../lib/types';

export default function ExpeditionHero({ expedition }: { expedition: Expedition }) {
  return (
    <section className="relative min-h-[78vh] overflow-hidden pt-16">
      {expedition.hero_image_url && (
        <img
          src={expedition.hero_image_url}
          alt={expedition.title}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-[#0A0A0A]" />

      <div className="relative z-10 flex min-h-[78vh] items-end px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">
            Expedition
          </p>

          <h1 className="mt-5 max-w-5xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            {expedition.title}
          </h1>

          <div className="mt-8 flex flex-wrap gap-5 text-zinc-300">
            {expedition.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-300" />
                {expedition.location}
              </div>
            )}

            {expedition.start_date && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-sky-300" />
                {formatDate(expedition.start_date, expedition.end_date)}
              </div>
            )}

            {expedition.price && (
              <div className="font-semibold text-white">{expedition.price}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatDate(start?: string | null, end?: string | null) {
  if (!start) return 'Date tba';
  const startDate = new Date(start).toLocaleDateString();
  if (!end) return startDate;
  return `${startDate} — ${new Date(end).toLocaleDateString()}`;
}