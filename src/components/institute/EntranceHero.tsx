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
        <p className="hero-body">{world.introduction}</p>
      </div>
      <div className="hero-instrument">
        {world.textImageUrl && <img className="scale-text-art" src={world.textImageUrl} alt="" />}
        {world.iconUrl && <img className="scale-icon-art" src={world.iconUrl} alt="" />}
        <ImpactDial />
      </div>
    </main>
  );
}

function scaleIndex(scale: string) {
  return ['me', 'circle', 'teams', 'organizations', 'society', 'world'].indexOf(scale) + 1;
}
