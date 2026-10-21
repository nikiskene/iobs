import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type PublicChapter = {
  id: string;
  name: string;
  city: string;
  continent: string;
  headline: string;
  description: string;
  email: string;
  hero_image_url: string;
};
export type ChapterHead = { chapter_id: string; full_name: string; photo_url: string };
export type ChapterEvent = { id: string; chapter_id: string; title: string; start_date: string; slug: string };

export function usePublicChapters(includeEvents = false) {
  const [chapters, setChapters] = useState<PublicChapter[]>([]);
  const [heads, setHeads] = useState<ChapterHead[]>([]);
  const [events, setEvents] = useState<ChapterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    Promise.all([
      supabase.from("chapters")
        .select("id,name,city,continent,headline,description,email,hero_image_url")
        .eq("status", "active").order("city"),
      supabase.rpc("public_chapter_heads"),
      includeEvents
        ? supabase.from("events").select("id,chapter_id,title,start_date,slug")
          .eq("category", "chapter_event").eq("is_active", true)
          .eq("status", "scheduled").gte("start_date", new Date().toISOString().slice(0, 10))
          .order("start_date")
        : Promise.resolve({ data: [], error: null }),
    ]).then(([c, h, e]) => {
      if (!active) return;
      setError(!!c.error || !!h.error || !!e.error);
      setChapters(c.data || []);
      setHeads(h.data || []);
      setEvents(e.data || []);
    }).catch(() => {
      if (active) setError(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [includeEvents]);
  return { chapters, heads, events, loading, error };
}
