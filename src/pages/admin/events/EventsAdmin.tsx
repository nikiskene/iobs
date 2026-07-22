// src/pages/admin/events/EventsAdmin.tsx
import { useEffect, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Event } from '../../../lib/types';
import EventEditor from './EventEditor';

export default function EventsAdmin() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editing, setEditing] = useState<Event | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: false });

    setEvents((data as Event[]) || []);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (editing || creating) {
    return (
      <EventEditor
        event={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
          fetchEvents();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events CMS</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage upcoming and past events.
          </p>
        </div>

        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
        >
          <Plus className="h-4 w-4" />
          New Event
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-zinc-500">No events yet.</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-400">
                    {event.status}
                  </span>

                  {!event.is_active && (
                    <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs text-zinc-500">
                      Inactive
                    </span>
                  )}
                </div>

                <h3 className="mt-2 text-lg font-semibold">{event.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {event.location || 'No location'}
                </p>
              </div>

              <button
                onClick={() => setEditing(event)}
                className="rounded-md p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}