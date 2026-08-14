// src/components/institute/EntranceHero.tsx
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { useScaleWorlds } from '../../providers/ScaleWorldsProvider';
import ImpactDial from './ImpactDial';

const SUCCESS_QUESTIONS: Record<string, string> = {
  me: 'What would you celebrate as success?',
  circle: 'What would your community celebrate as success?',
  teams: 'What would your team celebrate as success?',
  organizations: 'What would your company celebrate as success?',
  country: 'What would your country celebrate as success?',
  society: 'What would our world celebrate as success?',
  world: 'What would the universe celebrate as success?',
};

export default function EntranceHero() {
  const { scale } = useImpactScale();
  const worlds = useScaleWorlds();
  const world = worlds.find((item) => item.slug === scale) ?? worlds[0];
  const successQuestion = SUCCESS_QUESTIONS[scale] ?? SUCCESS_QUESTIONS.me;

  return (
    <main className="entrance" key={world.slug}>
      <div className="hero-copy">
        <p className="hero-kicker"><span>{String(scaleIndex(scale)).padStart(2, '0')}</span>{world.eyebrow}</p>
        <h1>{successQuestion}</h1>
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
