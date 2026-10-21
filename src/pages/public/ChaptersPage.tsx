import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Chapter = {
  id: string;
  name: string;
  city: string;
  continent: string;
  headline: string;
  hero_image_url: string;
};
type Head = { chapter_id: string; full_name: string };
type ChapterEvent = {
  id: string;
  chapter_id: string;
  title: string;
  start_date: string;
  slug: string;
};
export default function ChaptersPage() {
  const [heads, setHeads] = useState<Head[]>([]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [events, setEvents] = useState<ChapterEvent[]>([]);
  useEffect(() => {
    let active = true;
    Promise.all([
      supabase
        .from("chapters")
        .select("id,name,city,continent,headline,hero_image_url")
        .eq("status", "active")
        .order("city"),
      supabase.rpc("public_chapter_heads"),
      supabase
        .from("events")
        .select("id,chapter_id,title,start_date,slug")
        .eq("category", "chapter_event")
        .eq("is_active", true)
        .eq("status", "scheduled")
        .gte("start_date", new Date().toISOString().slice(0, 10))
        .order("start_date"),
    ]).then(([c, h, e]) => {
      if (active) {
        setLoading(false);
        setError(!!c.error || !!h.error || !!e.error);
        setHeads(h.data || []);
        setChapters(c.data || []);
        setEvents(e.data || []);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  const continents = [...new Set(chapters.map((c) => c.continent))].sort();
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pb-24 pt-28 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[.25em] text-amber-400">
          Institute of Beautiful Success
        </p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">Chapters</h1>
        {loading && (
          <p role="status" className="mt-8">
            Loading chapters…
          </p>
        )}
        {error && (
          <p role="alert" className="mt-8">
            We couldn’t load chapters. Please try again shortly.
          </p>
        )}
        {!loading && !error && !chapters.length && (
          <p className="mt-8">Our chapters will be announced here shortly.</p>
        )}
        {continents.map((continent) => (
          <section key={continent} className="mt-16">
            <h2 className="mb-6 border-b border-white/20 pb-4 text-xl uppercase tracking-widest">
              {continent}
            </h2>
            <div className="space-y-8">
              {chapters
                .filter((c) => c.continent === continent)
                .map((c) => (
                  <article
                    key={c.id}
                    className="overflow-hidden rounded-xl border border-white/10 bg-white/5 md:grid md:grid-cols-2"
                  >
                    {c.hero_image_url ? (
                      <img
                        src={c.hero_image_url}
                        alt={c.city}
                        loading="lazy"
                        className="h-56 w-full object-cover md:h-full md:min-h-72"
                      />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-amber-950 to-zinc-900 md:h-full" />
                    )}
                    <div className="p-6 sm:p-10">
                      <h3 className="text-3xl font-semibold">{c.name}</h3>
                      {c.headline && (
                        <p className="mt-3 text-lg text-zinc-300">
                          {c.headline}
                        </p>
                      )}
                      {heads
                        .filter((h) => h.chapter_id === c.id)
                        .map((h) => (
                          <p key={h.chapter_id} className="mt-4 text-amber-300">
                            Chapter Head · {h.full_name}
                          </p>
                        ))}
                      {events.filter((e) => e.chapter_id === c.id).length >
                        0 && (
                        <div className="mt-8">
                          <h4 className="mb-3 text-sm uppercase tracking-widest text-amber-400">
                            Upcoming events
                          </h4>
                          {events
                            .filter((e) => e.chapter_id === c.id)
                            .map((e) => (
                              <a
                                key={e.id}
                                href={`/events/${e.slug}`}
                                className="mb-2 block rounded-lg border border-white/15 p-4 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                              >
                                <time className="block text-sm text-zinc-400">
                                  {new Date(e.start_date).toLocaleDateString(
                                    undefined,
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    },
                                  )}
                                </time>
                                <span className="mt-1 block">{e.title} →</span>
                              </a>
                            ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
