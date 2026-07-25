// src/components/institute/ImpactDial.tsx

import { useImpactScale, type ImpactScale } from '../../providers/ImpactScaleProvider';

const STEPS: {
  value: ImpactScale;
  label: string;
}[] = [
  { value: 'self', label: 'Just Me' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'team', label: 'My Team' },
  { value: 'organization', label: 'Organization' },
  { value: 'industry', label: 'Industry' },
  { value: 'world', label: 'The Whole World' },
];

export default function ImpactDial() {
  const { scale, setScale } = useImpactScale();

  const active = STEPS.findIndex((s) => s.value === scale);

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
      }}
    >
      <div
        style={{
          width: 340,
          height: 340,
          borderRadius: '50%',
          border: '2px solid #c9b18f',
          background:
            'radial-gradient(circle,#fefbf6 0%,#efe3cf 70%,#dcc2a1 100%)',
          boxShadow:
            '0 30px 80px rgba(0,0,0,.12), inset 0 8px 20px rgba(255,255,255,.8)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 8,
            height: 120,
            background: '#6a4a2c',
            borderRadius: 20,
            transform: `translate(-50%,-100%) rotate(${active * 42 - 105}deg)`,
            transformOrigin: '50% 100%',
            transition: 'transform .6s ease',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: '37%',
            borderRadius: '50%',
            background: '#6a4a2c',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {STEPS.map((step) => (
          <button
            key={step.value}
            onClick={() => setScale(step.value)}
            style={{
              border:
                step.value === scale
                  ? '2px solid #6a4a2c'
                  : '1px solid #d7c6ae',
              background:
                step.value === scale ? '#6a4a2c' : 'white',
              color:
                step.value === scale ? 'white' : '#5d5348',
              padding: '10px 18px',
              borderRadius: 999,
              cursor: 'pointer',
              transition: '.25s',
            }}
          >
            {step.label}
          </button>
        ))}
      </div>
    </section>
  );
}