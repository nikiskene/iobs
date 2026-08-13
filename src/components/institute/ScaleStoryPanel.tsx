// src/components/institute/ScaleStoryPanel.tsx
import { Link } from 'react-router-dom';
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { useScaleWorlds } from '../../providers/ScaleWorldsProvider';
import { AWARD_CATEGORIES } from '../../content/awardContent';

export default function ScaleStoryPanel() {
  const { scale } = useImpactScale();
  const worlds = useScaleWorlds();
  const world = worlds.find((item) => item.slug === scale) ?? worlds[0];
  const award = AWARD_CATEGORIES.find((item) => item.slug === scale) ?? AWARD_CATEGORIES[0];

  return (
    <section className="scale-story" aria-label={`${world.label} possibilities`}>
      <div className="story-heading">
        <p>{award.name} · award category</p>
        <h2>{award.definition}</h2>
      </div>
      <div className="story-chapters">
        <Chapter index="01" title="The standard" copy={award.examples} />
        <Chapter index="02" title="Submission" copy={`Founding Edition entry fee: ${award.fee}. Fee waivers will protect access where needed.`} />
        <Chapter index="03" title="The question" copy="If this becomes dramatically more successful, does its positive value grow with it?" />
      </div>
      <div className="story-links">
        <Link to={`/nominate?scale=${world.slug}`}>Nominate a success</Link>
        <Link to={`/enter?scale=${world.slug}`}>Enter this category</Link>
      </div>
    </section>
  );
}

function Chapter({ index, title, copy }: { index: string; title: string; copy: string }) {
  return (
    <article>
      <span>{index}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </article>
  );
}
