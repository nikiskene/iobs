// src/pages/public/ThesisPage.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ThesisCategory, Thesis } from '../../lib/types';
import { useLocale, type Locale } from '../../providers/LocaleProvider';

type Translation = { locale:string; title:string|null; subheadline:string|null; short_explanation:string|null; body:string|null };
type LocalizedThesis = Thesis & { thesis_translations?: Translation[] };

const COPY: Record<Locale,Record<string,string>> = {
  en:{eyebrow:'Beautiful Success Cases',title:'Cases',intro:'Real achievements that show what Beautiful Success can look like in practice.',all:'All Categories',empty:'No published cases in this category yet.',featured:'Featured',more:'Read more',less:'Read less',loading:'Loading…'},
  de:{eyebrow:'Beautiful Success Cases',title:'Fälle',intro:'Reale Leistungen, die zeigen, wie Beautiful Success in der Praxis aussehen kann.',all:'Alle Kategorien',empty:'In dieser Kategorie gibt es noch keine veröffentlichten Fälle.',featured:'Hervorgehoben',more:'Mehr lesen',less:'Weniger lesen',loading:'Lädt…'},
  fr:{eyebrow:'Cas Beautiful Success',title:'Cas',intro:'Des réussites réelles qui montrent à quoi Beautiful Success peut ressembler en pratique.',all:'Toutes les catégories',empty:'Aucun cas publié dans cette catégorie pour le moment.',featured:'À la une',more:'Lire plus',less:'Lire moins',loading:'Chargement…'},
  ar:{eyebrow:'حالات Beautiful Success',title:'الحالات',intro:'إنجازات حقيقية تُظهر كيف يمكن أن يبدو Beautiful Success في الواقع.',all:'كل الفئات',empty:'لا توجد حالات منشورة في هذه الفئة بعد.',featured:'مميز',more:'اقرأ المزيد',less:'اقرأ أقل',loading:'جارٍ التحميل…'},
  zh:{eyebrow:'Beautiful Success 案例',title:'案例',intro:'真实成就，展示 Beautiful Success 在实践中可以是什么样子。',all:'全部类别',empty:'此类别暂时没有已发布案例。',featured:'精选',more:'展开阅读',less:'收起',loading:'加载中…'},
  es:{eyebrow:'Casos Beautiful Success',title:'Casos',intro:'Logros reales que muestran cómo puede verse Beautiful Success en la práctica.',all:'Todas las categorías',empty:'Aún no hay casos publicados en esta categoría.',featured:'Destacado',more:'Leer más',less:'Leer menos',loading:'Cargando…'},
};

export default function ThesisPage() {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useLocale();
  const copy = COPY[locale];
  const [categories, setCategories] = useState<ThesisCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ThesisCategory | null>(null);
  const [theses, setTheses] = useState<LocalizedThesis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('thesis_categories').select('*').eq('is_active', true).order('display_order');
      const cats = (data as ThesisCategory[]) || [];
      setCategories(cats);
      setSelectedCategory(slug ? cats.find((cat) => cat.slug === slug) || null : null);
      setLoading(false);
    };
    fetchCategories();
  }, [slug]);

  useEffect(() => {
    const fetchTheses = async () => {
      if (!selectedCategory) { setTheses([]); return; }
      const { data } = await supabase.from('theses')
        .select('*, thesis_categories(*), thesis_media(*), thesis_translations(locale,title,subheadline,short_explanation,body)')
        .eq('category_id', selectedCategory.id).eq('status', 'published')
        .order('is_featured', { ascending: false }).order('display_order');
      setTheses((data as LocalizedThesis[]) || []);
    };
    fetchTheses();
  }, [selectedCategory]);

  if (loading) return <div className="py-24 text-center"><p className="case-status">{copy.loading}</p></div>;
  if (selectedCategory) return <CategoryDetail category={selectedCategory} theses={theses} locale={locale} copy={copy} onBack={() => setSelectedCategory(null)} />;
  return <CategoryOverview categories={categories} copy={copy} />;
}

function CategoryOverview({ categories, copy }: { categories: ThesisCategory[]; copy:Record<string,string> }) {
  return <main>
    <section className="award-page-hero ibs-page-hero"><p className="award-label">{copy.eyebrow}</p><div><h1>{copy.title}</h1><p>{copy.intro}</p></div></section>
    <section className="ibs-section category-index">{categories.map((cat,index) => <article key={cat.id}><span>0{index + 1}</span><div><Link to={`/thesis/${cat.slug}`} className="award-case-topic-link"><h2>{cat.name}</h2></Link>{cat.description && <p>{cat.description}</p>}</div><Link to={`/thesis/${cat.slug}`} aria-label={cat.name}><ArrowRight className="h-5 w-5" /></Link></article>)}</section>
  </main>;
}

function CategoryDetail({ category, theses, locale, copy, onBack }: { category:ThesisCategory; theses:LocalizedThesis[]; locale:Locale; copy:Record<string,string>; onBack:()=>void }) {
  return <main>
    <section className="award-page-hero ibs-page-hero"><button onClick={onBack} className="award-text-link"><ArrowLeft className="inline h-4 w-4" /> {copy.all}</button><div><h1>{category.name}</h1>{category.description && <p>{category.description}</p>}</div></section>
    <section className="ibs-section">{theses.length === 0 ? <p className="case-status">{copy.empty}</p> : <div className={`success-case-grid ${theses.length === 1 ? 'single' : theses.length === 2 ? 'double' : theses.length === 3 ? 'triple' : 'multi'}`}>{theses.map((thesis) => <ThesisCard key={thesis.id} thesis={thesis} locale={locale} copy={copy} />)}</div>}</section>
  </main>;
}

function ThesisCard({ thesis, locale, copy }: { thesis:LocalizedThesis; locale:Locale; copy:Record<string,string> }) {
  const [expanded,setExpanded] = useState(false);
  const translation = locale === 'en' ? undefined : thesis.thesis_translations?.find((item) => item.locale === locale);
  const title = translation?.title || thesis.title;
  const subheadline = translation?.subheadline || thesis.subheadline;
  const shortExplanation = translation?.short_explanation || thesis.short_explanation;
  const body = translation?.body || thesis.body;
  const ordered = [...(thesis.thesis_media || [])].sort((a,b) => a.display_order - b.display_order);
  const image = ordered.find((item) => item.is_featured) || ordered[0];

  return <article>
    {image?.file_url && <img src={image.file_url} alt={image.alt_text || title} loading="lazy" />}
    <div>
      {thesis.is_featured && <span className="award-label">{copy.featured}</span>}
      <h3>{title}</h3>
      {subheadline && <p>{subheadline}</p>}
      {shortExplanation && <p>{shortExplanation}</p>}
      {body && <><button className="award-text-link" onClick={() => setExpanded(!expanded)}>{expanded ? copy.less : copy.more}</button>{expanded && <p className="whitespace-pre-line">{body}</p>}</>}
    </div>
  </article>;
}
