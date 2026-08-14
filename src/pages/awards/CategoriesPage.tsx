// src/pages/awards/CategoriesPage.tsx
import AwardPageHero from '../../components/awards/AwardPageHero';
import { useLocale } from '../../providers/LocaleProvider';
import { getAwardLocaleContent } from '../../content/awardLocaleContent';

export default function CategoriesPage() {
  const { locale } = useLocale();
  const content = getAwardLocaleContent(locale);
  const p = content.pages;
  return (
    <main>
      <AwardPageHero eyebrow={p.catEyebrow} title={p.catTitle}>{p.catIntro}</AwardPageHero>
      <section className="ibs-section category-index">{content.categories.map((item, index) => <article key={item.slug}><span>0{index + 1}</span><div><h2>{item.name}</h2><p>{item.definition}</p></div><strong>{item.fee}</strong></article>)}</section>
    </main>
  );
}
