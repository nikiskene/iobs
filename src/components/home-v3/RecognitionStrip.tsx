import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Recognition = {
  id: string;
  company_name: string;
  acknowledgement: string;
  photo_url: string;
  photo_alt: string;
  display_order: number;
};

export default function RecognitionStrip() {
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: settings } = await supabase.from('recognition_settings').select('is_active').eq('id', true).maybeSingle();
        if (!settings?.is_active) return;
        const { data, error } = await supabase.from('recognitions')
          .select('id,company_name,acknowledgement,photo_url,photo_alt,display_order')
          .eq('status', 'published')
          .order('display_order')
          .order('created_at')
          .limit(10);
        if (!error && active) {
          setEnabled(true);
          setRecognitions((data as Recognition[]) || []);
        }
      } catch {
        // The strip stays hidden until the recognition CMS has been set up.
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  if (!enabled || recognitions.length === 0) return null;

  return <section className="recognition-strip" aria-labelledby="recognitions-title">
    <div className="recognition-strip-heading">
      <div><p className="home-v3-label">Institute of Beautiful Success</p><h2 id="recognitions-title">Recognitions</h2></div>
      <p>Celebrating organizations whose success makes the world better.</p>
    </div>
    <div className="recognition-rail" role="list">
      {recognitions.map((recognition, index) => <article className="recognition-card" key={recognition.id} role="listitem">
        <div className="recognition-image">
          {recognition.photo_url ? <img src={recognition.photo_url} alt={recognition.photo_alt || `${recognition.company_name} receiving an IOBS certificate`} loading="lazy" decoding="async" /> : <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>}
        </div>
        <div className="recognition-copy"><p className="recognition-index">Recognition {String(index + 1).padStart(2, '0')}</p><h3>{recognition.company_name}</h3><p>{recognition.acknowledgement}</p><span aria-hidden="true"><ArrowRight /></span></div>
      </article>)}
    </div>
  </section>;
}
