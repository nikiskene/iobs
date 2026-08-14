// src/components/institute/EntranceHero.tsx
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { useScaleWorlds } from '../../providers/ScaleWorldsProvider';
import ImpactDial from './ImpactDial';

export default function EntranceHero() {
  const { scale } = useImpactScale();
  const worlds = useScaleWorlds();
  const world = worlds.find((item) => item.slug === scale) ?? worlds[0];

  return (
    <main className="entrance" key={world.slug}>
      <div className="hero-copy">
        <p className="hero-kicker"><span>{String(scaleIndex(scale)).padStart(2, '0')}</span>{world.eyebrow}</p>
        <h1>{world.title}</h1>
        <p className="hero-body">The Beautiful Success Awards recognize achievements that make the world better through their success.</p>
      </div>
      <div className="hero-instrument">
        <ImpactDial />
      </div>
    </main>
  );
}

function scaleIndex(scale: string) {
  return ['me', 'circle', 'teams', 'organizations', 'country', 'society', 'world'].indexOf(scale) + 1;
}
