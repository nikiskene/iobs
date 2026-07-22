// src/pages/public/EventDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Event } from '../../lib/types';

export default function EventDetailPage() {
  const { slug } = useParams();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      setEvent((data as Event) || null);
      setLoading(false);
    };

    fetchEvent();
  }, [slug]);

  const handleRSVP = async () => {
    if (!event) return;

    setSending(true);
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      setSending(false);
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email.');
      setSending(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('event_rsvps')
      .insert({
        event_id: event.id,
        name: name.trim(),
        email: email.trim(),
      });

    if (insertError) {
      setError(insertError.message);
      setSending(false);
      return;
    }

    setSuccess(true);
    setSending(false);
  };

  if (loading) {
    return (
      <div className="bg-[#0A0A0A] pt-24 text-white">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <p className="text-zinc-500">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-[#0A0A0A] pt-24 text-white">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <h1 className="text-3xl font-bold">Event not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] pt-16 text-white">
      {event.hero_image_url && (
        <div className="aspect-[16/6] overflow-hidden border-b border-white/5">
          <img
            src={event.hero_image_url}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
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

          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            {event.title}
          </h1>

          {event.description && (
            <div className="mt-8">
              <p className="max-w-4xl whitespace-pre-line text-lg leading-relaxed text-zinc-300">
                {event.description}
              </p>
            </div>
          )}

          {event.investment && (
            <div className="mt-12">
              <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                Investment
              </h2>

              <p className="mt-3 text-2xl font-semibold">
                {event.investment}
              </p>
            </div>
          )}

          {event.participation_info && (
            <div className="mt-12">
              <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                Participation Information
              </h2>

              <p className="mt-3 max-w-4xl whitespace-pre-line text-zinc-400">
                {event.participation_info}
              </p>
            </div>
          )}

          {event.status === 'scheduled' && (
            <div className="mt-16 rounded-2xl border border-white/5 bg-white/[0.03] p-8">
              <h2 className="text-2xl font-bold">
                RSVP
              </h2>

              <p className="mt-3 text-zinc-400">
                Register your interest for this event.
              </p>

              {success ? (
                <div className="mt-6 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                  RSVP received successfully.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />

                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email"
                    type="email"
                    className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />

                  {error && (
                    <div className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleRSVP}
                    disabled={sending}
                    className="rounded-md bg-sky-500 px-6 py-3 font-medium text-white transition hover:bg-sky-400 disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'RSVP'}
                  </button>
                </div>
              )}
            </div>
          )}

          {event.status === 'past' && event.past_summary && (
            <div className="mt-16">
              <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                Event Summary
              </h2>

              <p className="mt-4 max-w-4xl whitespace-pre-line text-zinc-300">
                {event.past_summary}
              </p>
            </div>
          )}

          {event.status === 'past' && event.youtube_url && (
            <div className="mt-10 overflow-hidden rounded-2xl border border-white/5">
              <iframe
                src={convertYoutubeUrl(event.youtube_url)}
                title={event.title}
                className="aspect-video w-full"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function formatDate(start: string, end?: string | null) {
  const startDate = new Date(start).toLocaleDateString();

  if (!end) return startDate;

  const endDate = new Date(end).toLocaleDateString();

  return `${startDate} — ${endDate}`;
}

function convertYoutubeUrl(url: string) {
  if (url.includes('watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }

  return url;
}