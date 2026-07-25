// src/components/institute/EntranceHero.tsx

import { useImpactScale } from '../../providers/ImpactScaleProvider';

const COPY = {
  self: {
    eyebrow: 'Institute of Beautiful Success',
    title: 'If you could build yourself again, what would you keep?',
    body:
      'Beautiful success begins long before achievement. It begins with identity.',
  },
  relationships: {
    eyebrow: 'Institute of Beautiful Success',
    title: 'Every relationship becomes a culture.',
    body:
      'The smallest unit of civilization is not the individual. It is two people.',
  },
  team: {
    eyebrow: 'Institute of Beautiful Success',
    title: 'Teams inherit the identity of their conversations.',
    body:
      'Performance follows clarity. Culture follows identity.',
  },
  organization: {
    eyebrow: 'Institute of Beautiful Success',
    title: 'Organizations become what they repeatedly reward.',
    body:
      'Beautiful organizations are intentionally designed, not accidentally grown.',
  },
  industry: {
    eyebrow: 'Institute of Beautiful Success',
    title: 'Industries change when someone changes the question.',
    body:
      'Innovation rarely starts with technology. It starts with a different identity.',
  },
  world: {
    eyebrow: 'Institute of Beautiful Success',
    title: 'What would you build if the whole world was your responsibility?',
    body:
      'The future belongs to people who can think beautifully across civilizations.',
  },
} as const;

export default function EntranceHero() {
  const { scale } = useImpactScale();
  const copy = COPY[scale];

  return (
    <section
      style={{
        maxWidth: 980,
        margin: '80px auto',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontSize: 13,
          color: '#8a7862',
          marginBottom: 24,
        }}
      >
        {copy.eyebrow}
      </div>

      <h1
        style={{
          fontFamily: 'serif',
          fontWeight: 500,
          fontSize: 'clamp(52px,7vw,92px)',
          lineHeight: 1.02,
          margin: 0,
        }}
      >
        {copy.title}
      </h1>

      <p
        style={{
          maxWidth: 720,
          margin: '36px auto 0',
          fontSize: 22,
          lineHeight: 1.7,
          color: '#645a4f',
        }}
      >
        {copy.body}
      </p>
    </section>
  );
}