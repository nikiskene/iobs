// src/components/awards/BeautifulSuccessCases.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { useLocale, type Locale } from '../../providers/LocaleProvider';
import { getAwardLocaleContent } from '../../content/awardLocaleContent';

type CaseMedia = { file_url:string; alt_text:string|null; display_order:number; is_featured:boolean };
type CaseTranslation = { locale:string; title:string|null; subheadline:string|null; short_explanation:string|null };
type CaseItem = {
  id:string; title:string; subheadline:string|null; short_explanation:string|null;
  thesis_media?: CaseMedia[];
  thesis_translations?: CaseTranslation[];
};

export default function BeautifulSuccessCases() {
  const { scale } = useImpactScale();
  const { locale, t } = useLocale();
  const localized = getAwardLocaleContent(locale);
  const category = localized.categories.find((item) => item.slug === scale) ?? localized.categories[0];
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    setLoading(true);
    supabase.from('theses')
      .select('id,title,subheadline,short_explanation,thesis_media(file_url,alt_text,display_order,is_featured),thesis_translations(locale,title,subheadline,short_explanation),thesis_impact_scales!inner(scale_slug)')
      .eq('status', 'published')
      .eq('thesis_impact_scales.scale_slug', scale)
      .order('is_featured', { ascending: false })
      .order('display_order')
      .limit(6)
      .then(({ data }) => { if (current) { setCases((data as CaseItem[]) || []); setLoading(false); } });
    return () => { current = false; };
  }, [scale]);

  const layoutClass = cases.length === 1 ? 'single' : cases.length === 2 ? 'double' : cases.length === 3 ? 'triple' : 'multi';

  return <section className="award-home-section success-cases">
    <div className="award-section-title"><p className="award-label">{category.name}</p><h2>{t('cases.title')}</h2></div>
    {loading ? <p className="case-status">{t('cases.loading')}</p> : cases.length ? <div className={`success-case-grid ${layoutClass}`}>{cases.map((item) => <CaseCard key={item.id} item={item} locale={locale} />)}</div> : <p className="case-status">{t('cases.empty')}</p>}
    <Link className="award-text-link" to="/thesis">{t('cases.all')}</Link>
  </section>;
}

function CaseCard({ item, locale }: { item: CaseItem; locale: Locale }) {
  const ordered = [...(item.thesis_media || [])].sort((a, b) => a.display_order - b.display_order);
  const media = ordered.find((image) => image.is_featured) || ordered[0];
  const translation = locale === 'en' ? undefined : item.thesis_translations?.find((entry) => entry.locale === locale);
  const title = translation?.title || item.title;
  const summary = translation?.subheadline || translation?.short_explanation || item.subheadline || item.short_explanation;
  return <article>{media && <img src={caseImage(media.file_url)} alt={media.alt_text || title} loading="lazy" decoding="async" />}<div><h3>{title}</h3>{summary && <p>{summary}</p>}</div></article>;
}

function caseImage(url: string) {
  if (!url.includes('/storage/v1/object/public/')) return url;
  return `${url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')}?width=900&quality=78&resize=cover`;
}
