import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
// src/pages/public/EventsPage.tsx
import { useEffect, useState } from 'react';
import ExperienceCard from '../../components/experiences/ExperienceCard';
import { supabase } from '../../lib/supabase';
import type { Event } from '../../lib/types';

export default function EventsPage() {
  const { translate: tr } = useAwardSiteContent();
  const [category,setCategory]=useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('events').select('*').eq('is_active', true).in('status', ['scheduled', 'past'])
      .order('start_date').then(({ data }) => {
        setEvents((data as Event[]) || []);
        setLoading(false);
      });
  }, []);

  const upcoming = events.filter(event=>category==='all'||event.category===category).filter((event) => event.status === 'scheduled');
  const past = events.filter(event=>category==='all'||event.category===category).filter((event) => event.status === 'past').reverse();

  return (
    <main>
      <section className="ibs-page-hero">
        <p className="ibs-eyebrow">{tr("The Institute · Live")}</p>
        <div>
          <h1>{tr("Beautiful ideas become real when people gather.")}</h1>
          <p>{tr("Salons, talks, tours, workshops and expeditions exploring what we can build—from a single life to the whole world.")}</p>
        </div>
      </section>
      <nav aria-label={tr("Event categories")} className="mx-auto flex max-w-6xl flex-wrap gap-3 px-6 py-4">{[['all','All'],['tour','Tours'],['workshop','Workshops'],['chapter_event','Chapter Events']].map(([id,label])=><button key={id} aria-pressed={category===id} onClick={()=>setCategory(id)} className="min-h-11 rounded border border-white/30 px-4">{tr(label)}</button>)}</nav>
      <EventSection title={tr("Upcoming")} events={upcoming} loading={loading} />
      <EventSection title={tr("Previously at the Institute")} events={past} past />
    </main>
  );
}

function EventSection({ title, events, loading = false, past = false }: { title: string; events: Event[]; loading?: boolean; past?: boolean }) {
  const { translate: tr } = useAwardSiteContent();
  return (
    <section className="ibs-section">
      <div className="ibs-section-head"><h2>{title}</h2></div>
      {loading ? <p className="ibs-empty">{tr("Opening the calendar…")}</p> : events.length ? (
        <div className="ibs-card-grid events">{events.map((event) => <ExperienceCard event={event} key={event.id} past={past} />)}</div>
      ) : <div className="ibs-empty">{tr(past ? 'The archive will grow here.' : 'New gatherings will be announced shortly.')}</div>}
    </section>
  );
}
