// src/pages/public/ExpeditionsPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Expedition, Event } from '../../lib/types';

export default function ExpeditionsPage() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpeditions = async () => {
      const [{ data: expeditionData }, { data: eventData }] = await Promise.all([
        supabase
          .from('expeditions')
          .select('*')
          .eq('is_active', true)
          .eq('status', 'published')
          .order('display_order', { ascending: true })
          .order('start_date', { ascending: true }),

        supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .eq('status', 'scheduled')
          .order('start_date', { ascending: true }),
      ]);

      setExpeditions((expeditionData as Expedition[]) || []);
      setEvents((eventData as Event[]) || []);
      setLoading(false);
    };

    fetchExpeditions();
  }, []);

  return (
    <main className="bg-[#0A0A0A] pt-16 text-white">
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">
            Expeditions
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Field missions into the places where the future becomes visible.
          </h1>

          <p className="mt-6 max-w-3xl text-xl leading-relaxed text-zinc-400">
            Curated journeys into innovation ecosystems, companies, founders,
            researchers and decision-makers. Not conferences. Encounters.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <p className="text-zinc-500">Loading...</p>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              <CustomExpeditionCard />

              {expeditions.map((expedition) => (
                <ExpeditionCard key={expedition.id} expedition={expedition} />
              ))}

              {expeditions.length === 0 && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center text-zinc-500">
                  No public expeditions published yet.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {events.length > 0 && (
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">
              Events
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
              Upcoming Sessions
            </h2>

            <p className="mt-4 max-w-2xl text-zinc-400">
              Smaller formats, conversations and public sessions connected to
              the WorldOS community.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:-translate-y-1 hover:border-white/15"
                >
                  <div className="space-y-2 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(event.start_date, event.end_date)}
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                  </div>

                  <h3 className="mt-4 text-xl font-bold">{event.title}</h3>

                  {event.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-5 inline-flex items-center gap-2 text-sm text-sky-400">
                    View event <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function CustomExpeditionCard() {
  return (
    <Link
      to="/expeditions/custom"
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-sky-400/20 bg-sky-500/[0.06] transition hover:-translate-y-1 hover:border-sky-300/40"
    >
      <div className="aspect-[16/10] overflow-hidden bg-white/5">
  <img
    src="https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/expedition-media/IMG_2923.JPG"
    alt="Custom Expedition"
    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
  />
</div>

      <div className="flex flex-1 flex-col p-7">
        <div className="space-y-2 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Silicon Valley · Shenzhen / Hong Kong · Custom location
          </div>
        </div>

        <h2 className="mt-5 text-3xl font-bold leading-tight">
          Build your own expedition.
        </h2>

        <p className="mt-4 leading-relaxed text-zinc-400">
          A curated field study for companies, governments and education
          institutions that need to understand what is changing before it
          becomes obvious.
        </p>

        <div className="mt-auto pt-7">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-sky-300">
            Design an expedition
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ExpeditionCard({ expedition }: { expedition: Expedition }) {
  return (
    <Link
      to={`/expeditions/${expedition.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] transition hover:-translate-y-1 hover:border-white/15"
    >
      <div className="aspect-[16/10] overflow-hidden bg-white/5">
        {expedition.hero_image_url && (
          <img
            src={expedition.hero_image_url}
            alt={expedition.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-7">
        <div className="space-y-2 text-sm text-zinc-400">
          {expedition.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {expedition.location}
            </div>
          )}

          {expedition.start_date && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {formatDate(expedition.start_date, expedition.end_date)}
            </div>
          )}
        </div>

        <h2 className="mt-5 text-3xl font-bold leading-tight">
          {expedition.title}
        </h2>

        {expedition.short_description && (
          <p className="mt-4 line-clamp-4 leading-relaxed text-zinc-400">
            {expedition.short_description}
          </p>
        )}

        {expedition.price && (
          <p className="mt-6 text-lg font-semibold text-white">
            {expedition.price}
          </p>
        )}

        <div className="mt-auto pt-7">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-sky-400">
            Explore expedition
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatDate(start?: string | null, end?: string | null) {
  if (!start) return 'Date tba';

  const startDate = new Date(start).toLocaleDateString();

  if (!end) return startDate;

  const endDate = new Date(end).toLocaleDateString();

  return `${startDate} — ${endDate}`;
}