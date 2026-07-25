// src/components/institute/ImpactStatement.tsx

import { useImpactScale } from '../../providers/ImpactScaleProvider';

const CONTENT = {
  self: {
    label: 'Impact',
    value: 'One Life',
    text:
      'Every civilization begins with one human deciding to build something beautiful.',
  },
  relationships: {
    label: 'Impact',
    value: 'Two People',
    text:
      'The quality of a relationship becomes the smallest unit of cultural change.',
  },
  team: {
    label: 'Impact',
    value: 'One Team',
    text:
      'Shared identity transforms groups of individuals into organizations capable of impossible things.',
  },
  organization: {
    label: 'Impact',
    value: 'One Organization',
    text:
      'Companies shape the daily reality of millions. Their identity matters more than ever.',
  },
  industry: {
    label: 'Impact',
    value: 'Entire Industries',
    text:
      'Every breakthrough eventually becomes an invitation for an industry to redefine itself.',
  },
  world: {
    label: 'Impact',
    value: 'Civilization',
    text:
      'Beautiful Success asks the largest question imaginable: What should humanity become next?',
  },
} as const;

export default function ImpactStatement() {
  const { scale } = useImpactScale();
  const content = CONTENT[scale];

  return (
    <section
      style={{
        margin: '140px auto',
        maxWidth: 980,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          color: '#b58a3d',
          textTransform: 'uppercase',
          letterSpacing: '.35em',
          fontSize: 13,
          marginBottom: 20,
        }}
      >
        {content.label}
      </div>

      <h2
        style={{
          margin: 0,
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 500,
          fontSize: 'clamp(48px,6vw,82px)',
          lineHeight: 1,
        }}
      >
        {content.value}
      </h2>

      <p
        style={{
          margin: '34px auto 0',
          maxWidth: 760,
          fontSize: 22,
          lineHeight: 1.8,
          color: '#655b51',
        }}
      >
        {content.text}
      </p>
    </section>
  );
}