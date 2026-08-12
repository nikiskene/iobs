// src/pages/awards/CategoriesPage.tsx
import AwardPageHero from '../../components/awards/AwardPageHero';
import { AWARD_CATEGORIES } from '../../content/awardContent';

export default function CategoriesPage() {
  return (
    <main>
      <AwardPageHero eyebrow="Seven scales of beautiful success" title="From one life to beyond our world.">The scale changes. The standard does not: the more successful it becomes, the better the world becomes.</AwardPageHero>
      <section className="ibs-section category-index">{AWARD_CATEGORIES.map((item, index) => <article key={item.slug}><span>0{index + 1}</span><div><h2>{item.name}</h2><p>{item.definition}</p></div><strong>{item.fee}</strong></article>)}</section>
    </main>
  );
}
