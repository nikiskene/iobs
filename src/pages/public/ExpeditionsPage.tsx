// src/pages/public/ExpeditionsPage.tsx
import { useEffect, useState } from 'react';
import ExperienceCard, { CustomExpeditionCard } from '../../components/experiences/ExperienceCard';
import { supabase } from '../../lib/supabase';
import type { Expedition } from '../../lib/types';

export default function ExpeditionsPage() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('expeditions').select('*').eq('is_active', true).eq('status', 'published')
      .order('display_order').order('start_date')
      .then(({ data }) => {
        setExpeditions((data as Expedition[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <main>
      <section className="ibs-page-hero">
        <p className="ibs-eyebrow">Experiences · Expeditions</p>
        <div>
          <h1>Enter the places where the future becomes visible.</h1>
          <p>Curated journeys into companies, cultures and ideas. Not conferences. Encounters designed to change what you believe is possible.</p>
        </div>
      </section>
      <section className="ibs-section">
        <div className="ibs-section-head">
          <h2>Current journeys</h2>
          <p>Public expeditions for curious individuals and private journeys designed around an organization’s defining question.</p>
        </div>
        {loading ? <p className="ibs-empty">Preparing the journeys…</p> : (
          <div className="ibs-card-grid">
            <CustomExpeditionCard />
            {expeditions.map((item) => <ExperienceCard expedition={item} key={item.id} />)}
            {!expeditions.length && <div className="ibs-empty">New public expeditions will be announced here.</div>}
          </div>
        )}
      </section>
    </main>
  );
}
