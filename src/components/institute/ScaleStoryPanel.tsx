// src/components/institute/ScaleStoryPanel.tsx
import { Link } from 'react-router-dom';
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { useScaleWorlds } from '../../providers/ScaleWorldsProvider';
import { useLocale } from '../../providers/LocaleProvider';
import { getAwardLocaleContent } from '../../content/awardLocaleContent';

export default function ScaleStoryPanel() {
  const { scale } = useImpactScale();
  const worlds = useScaleWorlds();
  const { locale, t } = useLocale();
  const world = worlds.find((item) => item.slug === scale) ?? worlds[0];
  const localized = getAwardLocaleContent(locale);
  const award = localized.categories.find((item) => item.slug === scale) ?? localized.categories[0];

  return (
    <section className="scale-story" key={world.slug} aria-label={`${award.name} possibilities`}>
      <div className="story-heading">
        <p>{award.name} · {t('category.suffix')}</p>
        <h2>{award.definition}</h2>
      </div>
      <div className="story-chapters">
        <Chapter index="01" title={t('story.standard')} copy={award.examples} />
        <Chapter index="02" title={t('story.submission')} copy={t('story.fee', { fee: award.fee })} />
        <Chapter index="03" title={t('story.question')} copy={t('story.question.copy')} />
      </div>
      <div className="story-links">
        <Link to={`/nominate?scale=${world.slug}`}>{t('story.nominate')}</Link>
        <Link to={`/enter?scale=${world.slug}`}>{t('story.enter')}</Link>
      </div>
    </section>
  );
}

function Chapter({ index, title, copy }: { index: string; title: string; copy: string }) {
  return <article><span>{index}</span><h3>{title}</h3><p>{copy}</p></article>;
}
