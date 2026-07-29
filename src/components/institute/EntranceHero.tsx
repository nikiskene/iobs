// src/components/institute/EntranceHero.tsx

import { useImpactScale } from '../../providers/ImpactScaleProvider';
import ImpactDial, { SCALE_STEPS } from './ImpactDial';

const WORLDS = {
  self: {
    number: 'I',
    eyebrow: 'A private beginning',
    title: 'What would you build if success could be beautiful?',
    body: 'Begin with the life you are becoming. Identity is the first architecture.',
    word: 'BECOME',
  },
  relationships: {
    number: 'II',
    eyebrow: 'The intimate world',
    title: 'Every relationship creates a tiny civilization.',
    body: 'Shape a circle where candour, imagination and belonging can flourish.',
    word: 'BELONG',
  },
  team: {
    number: 'III',
    eyebrow: 'The shared endeavour',
    title: 'Build the company people wish existed.',
    body: 'Turn collective identity into culture, decisions and uncommon momentum.',
    word: 'CREATE',
  },
  organization: {
    number: 'IV',
    eyebrow: 'The civic imagination',
    title: 'Make your community feel newly possible.',
    body: 'Gather people around a more generous vision of place, participation and progress.',
    word: 'GATHER',
  },
  industry: {
    number: 'V',
    eyebrow: 'The systems scale',
    title: 'Redefine what society calls success.',
    body: 'Change the incentives, stories and institutions that quietly design everyday life.',
    word: 'REWRITE',
  },
  world: {
    number: 'VI',
    eyebrow: 'The beautiful impossible',
    title: 'The whole world is still ours to imagine.',
    body: 'Build the operating systems for a civilization worthy of its potential.',
    word: 'TRANSFORM',
  },
} as const;

export default function EntranceHero() {
  const { scale } = useImpactScale();
  const world = WORLDS[scale];
  const label = SCALE_STEPS.find((step) => step.value === scale)?.label;

  return (
    <main className="entrance">
      <div className="hero-copy">
        <p className="hero-kicker"><span>{world.number}</span>{world.eyebrow}</p>
        <h1>{world.title}</h1>
        <p className="hero-body">{world.body}</p>
        <div className="hero-actions">
          <a href="#method">Discover the method</a>
          <a href="/expeditions">Enter an expedition <span>→</span></a>
        </div>
      </div>
      <div className="hero-instrument">
        <span className="world-word" aria-hidden="true">{world.word}</span>
        <ImpactDial />
        <p className="current-world">Now viewing <strong>{label}</strong></p>
      </div>
    </main>
  );
}
