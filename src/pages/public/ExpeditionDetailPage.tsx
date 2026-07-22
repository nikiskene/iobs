// src/pages/public/ExpeditionDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Expedition } from '../../lib/types';
import ExpeditionHero from './expeditions/ExpeditionHero';
import ExpeditionOverview from './expeditions/ExpeditionOverview';
import ProgramTimeline from './expeditions/ProgramTimeline';
import ExpeditionGallery from './expeditions/ExpeditionGallery';

export default function ExpeditionDetailPage() {
  const { slug } = useParams();
  const [expedition, setExpedition] = useState<Expedition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpedition = async () => {
      const { data } = await supabase
        .from('expeditions')
        .select(`
          *,
          expedition_program_items(*),
          expedition_photos(*)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .eq('status', 'published')
        .maybeSingle();

      setExpedition((data as Expedition) || null);
      setLoading(false);
    };

    fetchExpedition();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] pt-24 text-white">
        <div className="mx-auto max-w-5xl px-6 py-24 text-zinc-500">
          Loading expedition...
        </div>
      </main>
    );
  }

  if (!expedition) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] pt-24 text-white">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <h1 className="text-3xl font-bold">Expedition not found</h1>
        </div>
      </main>
    );
  }

  const programItems = [...(expedition.expedition_program_items || [])].sort(
    (a, b) => a.display_order - b.display_order
  );

  const photos = [...(expedition.expedition_photos || [])]
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 4);

  return (
    <main className="bg-[#0A0A0A] text-white">
      <ExpeditionHero expedition={expedition} />
      <ExpeditionOverview expedition={expedition} />
      <ProgramTimeline items={programItems} />
      <ExpeditionGallery photos={photos} />
    </main>
  );
}