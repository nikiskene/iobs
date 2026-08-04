// src/components/institute/ScaleStoryPanel.tsx
import { Link } from 'react-router-dom';
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { useScaleWorlds } from '../../providers/ScaleWorldsProvider';

export default function ScaleStoryPanel() {
  const { scale } = useImpactScale();
  const worlds = useScaleWorlds();
  const world = worlds.find((item) => item.slug === scale) ?? worlds[0];

  return (
    <section className="scale-story" key={world.slug} aria-label={`${world.label} possibilities`}>
      <div className="story-heading">
        <p>{world.label} · the selected world</p>
        <h2>{world.introduction}</h2>
      </div>
      <div className="story-chapters">
        <Chapter index="01" title="I am" copy={world.iAm} />
        <Chapter index="02" title="I can be" copy={world.iCanBe} />
        <Chapter index="03" title="What to do" copy={world.whatToDo} />
      </div>
      <div className="story-links">
        <Link to={`/thesis?scale=${world.slug}`}>Explore related cases</Link>
        <Link to={`/events?scale=${world.slug}`}>Discover experiences</Link>
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
