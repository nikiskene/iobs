// src/pages/public/EventsPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Event } from '../../lib/types';

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .in('status', ['scheduled', 'past'])
        .order('start_date', { ascending: true });

      const allEvents = (data as Event[]) || [];

      setUpcomingEvents(
        allEvents
          .filter((event) => event.status === 'scheduled')
          .sort((a, b) => a.start_date.localeCompare(b.start_date))
      );

      setPastEvents(
        allEvents
          .filter((event) => event.status === 'past')
          .sort((a, b) => b.start_date.localeCompare(a.start_date))
      );

      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="bg-[#0A0A0A] pt-16 text-white">
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Events
          </h1>

          <p className="mt-4 max-w-2xl text-xl text-zinc-400">
            Conversations, explorations and structured encounters around the
            systems shaping the future.
          </p>
        </div>
      </section>

      <EventSection
        title="Upcoming Events"
        events={upcomingEvents}
        loading={loading}
      />

      <EventSection
        title="Past Events"
        events={pastEvents}
        isPast
      />
    </div>
  );
}

function EventSection({
  title,
  events,
  loading = false,
  isPast = false,
}: {
  title: string;
  events: Event[];
  loading?: boolean;
  isPast?: boolean;
}) {
  return (
    <section className="border-t border-white/5 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-2xl font-bold">{title}</h2>

        {loading ? (
          <p className="text-zinc-500">Loading...</p>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-10 text-center text-zinc-500">
            {isPast ? 'No past events yet.' : 'No upcoming events yet.'}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventTile key={event.id} event={event} isPast={isPast} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EventTile({
  event,
  isPast = false,
}: {
  event: Event;
  isPast?: boolean;
}) {
  return (
    <Link
      to={`/events/${event.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] transition hover:-translate-y-1 hover:border-white/15"
    >
      <div className="aspect-[16/10] overflow-hidden bg-white/5">
        {event.hero_image_url && (
          <img
            src={event.hero_image_url}
            alt={event.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
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

        <h3 className="mt-4 text-xl font-bold leading-tight">
          {event.title}
        </h3>

        {(isPast ? event.past_summary : event.description) && (
          <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-zinc-400">
            {isPast ? event.past_summary : event.description}
          </p>
        )}

        <div className="mt-auto pt-5">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-sky-400">
            {isPast ? 'View recap' : 'View event / RSVP'}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatDate(start: string, end?: string | null) {
  const startDate = new Date(start).toLocaleDateString();

  if (!end) return startDate;

  const endDate = new Date(end).toLocaleDateString();

  return `${startDate} — ${endDate}`;
}