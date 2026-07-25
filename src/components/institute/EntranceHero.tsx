// src/components/institute/EntranceHero.tsx

import { useImpactScale } from '../../providers/ImpactScaleProvider';

const COPY = {
  self: {
    eyebrow: 'The Institute of Beautiful Success',
    title: 'If you could build anything in the world, what would it be?',
    body:
      'Most people optimize their lives. A few redesign them. Beautiful Success begins with choosing who you want to become.',
  },

  relationships: {
    eyebrow: 'The Institute of Beautiful Success',
    title: 'Every relationship creates a tiny civilization.',
    body:
      'Every conversation changes culture. Every interaction leaves an echo. Beautiful Success expands far beyond ourselves.',
  },

  team: {
    eyebrow: 'The Institute of Beautiful Success',
    title: 'Great teams share an identity before they share a strategy.',
    body:
      'Alignment does not come from management. It comes from knowing what you are becoming together.',
  },

  organization: {
    eyebrow: 'The Institute of Beautiful Success',
    title: 'Organizations become what they repeatedly reward.',
    body:
      'Culture is architecture. Identity is infrastructure. Strategy merely follows both.',
  },

  industry: {
    eyebrow: 'The Institute of Beautiful Success',
    title: 'Industries rarely change because of technology.',
    body:
      'They change when someone redefines what success looks like for everyone else.',
  },

  world: {
    eyebrow: 'The Institute of Beautiful Success',
    title: 'The world is waiting for better questions.',
    body:
      'The Institute explores what humanity could become when Beautiful Success becomes the new operating system.',
  },
} as const;

export default function EntranceHero() {
  const { scale } = useImpactScale();
  const copy = COPY[scale];

  return (
    <section
      style={{
        maxWidth: 1100,
        margin: '110px auto 0',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 14,
          letterSpacing: '.32em',
          textTransform: 'uppercase',
          color: '#a78858',
          marginBottom: 28,
        }}
      >
        {copy.eyebrow}
      </div>

      <h1
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 500,
          fontSize: 'clamp(62px,8vw,108px)',
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          margin: 0,
        }}
      >
        {copy.title}
      </h1>

      <p
        style={{
          maxWidth: 760,
          margin: '42px auto 0',
          fontSize: 24,
          lineHeight: 1.75,
          color: '#645a4f',
        }}
      >
        {copy.body}
      </p>
    </section>
  );
}