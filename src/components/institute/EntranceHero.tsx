// src/components/institute/EntranceHero.tsx
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { useScaleWorlds } from '../../providers/ScaleWorldsProvider';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import ImpactDial from './ImpactDial';

const HERO_KEYS: Record<string, string> = {
  me: 'hero_me',
  circle: 'hero_community',
  teams: 'hero_team',
  organizations: 'hero_company',
  country: 'hero_country',
  society: 'hero_world',
  world: 'hero_universe',
};

export default function EntranceHero() {
  const { scale } = useImpactScale();
  const worlds = useScaleWorlds();
  const { get } = useAwardSiteContent();
  const world = worlds.find((item) => item.slug === scale) ?? worlds[0];
  const content = get(HERO_KEYS[scale] || 'hero_me');

  return (
    <main className="entrance" key={world.slug}>
      <div className="hero-copy">
        <p className="hero-kicker"><span>{String(scaleIndex(scale)).padStart(2, '0')}</span>{content?.label || world.eyebrow}</p>
        <h1>{content?.headline || world.title}</h1>
        {content?.body && <p className="hero-body">{content.body}</p>}
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
