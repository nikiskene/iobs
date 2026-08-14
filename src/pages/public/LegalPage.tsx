// src/pages/public/LegalPage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { HomepageSection } from '../../lib/types';

export default function LegalPage() {
  const [section, setSection] = useState<HomepageSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLegal = async () => {
      const { data } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('section_key', 'legal_impressum')
        .eq('is_active', true)
        .maybeSingle();

      setSection((data as HomepageSection) || null);
      setLoading(false);
    };

    fetchLegal();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#0A0A0A]" />;
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-32 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">
          {section?.subheadline || 'Legal'}
        </p>

        <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
          {section?.headline || 'Legal / Impressum'}
        </h1>

        <div className="mt-10 whitespace-pre-line text-base leading-relaxed text-zinc-300">
          {section?.body || 'Legal information will be added shortly.'}
        </div>
      </div>
    </main>
  );
}