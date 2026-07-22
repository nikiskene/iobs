// src/pages/admin/EventRsvpsAdmin.tsx
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Event, EventRsvp } from '../../lib/types';

type RsvpWithEvent = EventRsvp & {
  events?: Pick<Event, 'id' | 'title' | 'start_date'>;
};

export default function EventRsvpsAdmin() {
  const [rsvps, setRsvps] = useState<RsvpWithEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('all');

  useEffect(() => {
    const fetchRsvps = async () => {
      const { data } = await supabase
        .from('event_rsvps')
        .select('*, events(id, title, start_date)')
        .order('created_at', { ascending: false });

      setRsvps((data as RsvpWithEvent[]) || []);
    };

    fetchRsvps();
  }, []);

  const events = useMemo(() => {
    const map = new Map<string, RsvpWithEvent['events']>();

    rsvps.forEach((rsvp) => {
      if (rsvp.events) map.set(rsvp.events.id, rsvp.events);
    });

    return Array.from(map.values()).filter(Boolean);
  }, [rsvps]);

  const filteredRsvps =
    selectedEventId === 'all'
      ? rsvps
      : rsvps.filter((rsvp) => rsvp.event_id === selectedEventId);

  return (
    <div>
      <h1 className="text-2xl font-bold">Event RSVPs</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Review event registrations and interest submissions.
      </p>

      <div className="mt-8 max-w-sm">
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Filter by Event
        </label>

        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all" className="bg-zinc-900">
            All events
          </option>

          {events.map((event) => (
            <option key={event!.id} value={event!.id} className="bg-zinc-900">
              {event!.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-white/5">
        {filteredRsvps.length === 0 ? (
          <div className="bg-white/[0.02] p-8 text-sm text-zinc-500">
            No RSVPs yet.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredRsvps.map((rsvp) => (
              <div key={rsvp.id} className="bg-white/[0.02] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {rsvp.name}
                    </h3>

                    <a
                      href={`mailto:${rsvp.email}`}
                      className="mt-1 block text-sm text-sky-400 hover:text-sky-300"
                    >
                      {rsvp.email}
                    </a>

                    {rsvp.events && (
                      <p className="mt-2 text-sm text-zinc-500">
                        {rsvp.events.title}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-zinc-500">
                    {new Date(rsvp.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}