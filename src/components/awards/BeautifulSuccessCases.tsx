// src/components/awards/BeautifulSuccessCases.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { AWARD_CATEGORIES } from '../../content/awardContent';

type CaseMedia = { file_url:string; alt_text:string|null; display_order:number; is_featured:boolean };
type CaseItem = {
  id:string; title:string; subheadline:string|null; short_explanation:string|null;
  thesis_media?: CaseMedia[];
};

export default function BeautifulSuccessCases() {
  const { scale } = useImpactScale();
  const category = AWARD_CATEGORIES.find((item) => item.slug === scale) ?? AWARD_CATEGORIES[0];
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    setLoading(true);
    supabase.from('theses')
      .select('id,title,subheadline,short_explanation,thesis_media(file_url,alt_text,display_order,is_featured),thesis_impact_scales!inner(scale_slug)')
      .eq('status', 'published')
      .eq('thesis_impact_scales.scale_slug', scale)
      .order('is_featured', { ascending: false })
      .order('display_order')
      .limit(6)
      .then(({ data }) => { if (current) { setCases((data as CaseItem[]) || []); setLoading(false); } });
    return () => { current = false; };
  }, [scale]);

  return <section className="award-home-section success-cases">
    <div className="award-section-title"><p className="award-label">{category.name}</p><h2>What Beautiful Success Looks Like</h2></div>
    {loading ? <p className="case-status">Selecting cases…</p> : cases.length ? <div className="success-case-grid">{cases.map((item) => <CaseCard key={item.id} item={item} />)}</div> : <p className="case-status">The first defining cases for this category are being selected.</p>}
    <Link className="award-text-link" to="/thesis">Explore all cases →</Link>
  </section>;
}

function CaseCard({ item }: { item: CaseItem }) {
  const ordered = [...(item.thesis_media || [])].sort((a, b) => a.display_order - b.display_order);
  const media = ordered.find((image) => image.is_featured) || ordered[0];
  return <article>{media && <img src={caseImage(media.file_url)} alt={media.alt_text || ''} loading="lazy" decoding="async" />}<div><h3>{item.title}</h3><p>{item.subheadline || item.short_explanation}</p></div></article>;
}

function caseImage(url: string) {
  if (!url.includes('/storage/v1/object/public/')) return url;
  return `${url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')}?width=720&quality=75&resize=cover`;
}
