import type { ExpeditionProgramItem } from '../../../lib/types';

export default function ProgramTimeline({
  items,
}: {
  items: ExpeditionProgramItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-white/5 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Program
        </h2>

        <div className="mt-10 space-y-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:grid-cols-[0.7fr_1.3fr]"
            >
              <div>
                {(item.day_label || item.time_label) && (
                  <p className="text-sm uppercase tracking-[0.25em] text-sky-300/80">
                    {[item.day_label, item.time_label].filter(Boolean).join(' · ')}
                  </p>
                )}

                <h3 className="mt-3 text-2xl font-bold">{item.headline}</h3>
              </div>

              <div>
                {item.short_description && (
                  <p className="leading-relaxed text-zinc-400">
                    {item.short_description}
                  </p>
                )}

                {item.photo_url && (
                  <img
                    src={item.photo_url}
                    alt=""
                    className="mt-5 aspect-video w-full rounded-xl object-cover"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}