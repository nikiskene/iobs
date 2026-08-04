// src/pages/public/EventsPage.tsx
import { useEffect, useState } from 'react';
import ExperienceCard from '../../components/experiences/ExperienceCard';
import { supabase } from '../../lib/supabase';
import type { Event } from '../../lib/types';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('events').select('*').eq('is_active', true).in('status', ['scheduled', 'past'])
      .order('start_date').then(({ data }) => {
        setEvents((data as Event[]) || []);
        setLoading(false);
      });
  }, []);

  const upcoming = events.filter((event) => event.status === 'scheduled');
  const past = events.filter((event) => event.status === 'past').reverse();

  return (
    <main>
      <section className="ibs-page-hero">
        <p className="ibs-eyebrow">The Institute · Live</p>
        <div>
          <h1>Beautiful ideas become real when people gather.</h1>
          <p>Salons, talks, tours, workshops and expeditions exploring what we can build—from a single life to the whole world.</p>
        </div>
      </section>
      <EventSection title="Upcoming" events={upcoming} loading={loading} />
      <EventSection title="Previously at the Institute" events={past} past />
    </main>
  );
}

function EventSection({ title, events, loading = false, past = false }: { title: string; events: Event[]; loading?: boolean; past?: boolean }) {
  return (
    <section className="ibs-section">
      <div className="ibs-section-head"><h2>{title}</h2></div>
      {loading ? <p className="ibs-empty">Opening the calendar…</p> : events.length ? (
        <div className="ibs-card-grid events">{events.map((event) => <ExperienceCard event={event} key={event.id} past={past} />)}</div>
      ) : <div className="ibs-empty">{past ? 'The archive will grow here.' : 'New gatherings will be announced shortly.'}</div>}
    </section>
  );
}
