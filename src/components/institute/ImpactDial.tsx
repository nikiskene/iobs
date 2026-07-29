// src/components/institute/ImpactDial.tsx

import { useImpactScale, type ImpactScale } from '../../providers/ImpactScaleProvider';

export const SCALE_STEPS: { value: ImpactScale; label: string; short: string }[] = [
  { value: 'self', label: 'Just you', short: 'You' },
  { value: 'relationships', label: 'Your circle', short: 'Circle' },
  { value: 'team', label: 'Your company', short: 'Company' },
  { value: 'organization', label: 'Your community', short: 'Community' },
  { value: 'industry', label: 'Society', short: 'Society' },
  { value: 'world', label: 'The whole world', short: 'World' },
];

export default function ImpactDial() {
  const { scale, setScale } = useImpactScale();
  const active = SCALE_STEPS.findIndex((step) => step.value === scale);
  const angle = -125 + active * 50;

  return (
    <div className="dial-stage" aria-label="Choose the scale of your ambition">
      <p className="dial-instruction">Turn the scale of possibility</p>
      <div className="dial-hardware">
        <div className="dial-ticks" />
        <button
          className="dial-knob"
          type="button"
          onClick={() => setScale(SCALE_STEPS[(active + 1) % SCALE_STEPS.length].value)}
          style={{ '--dial-angle': `${angle}deg` } as React.CSSProperties}
          aria-label={`Current scale: ${SCALE_STEPS[active].label}. Select next scale.`}
        >
          <span className="dial-pointer" />
          <span className="dial-center">IBS</span>
        </button>
      </div>

      <input
        className="dial-range"
        type="range"
        min="0"
        max={SCALE_STEPS.length - 1}
        value={active}
        onChange={(event) => setScale(SCALE_STEPS[Number(event.target.value)].value)}
        aria-label="Impact scale"
      />

      <div className="dial-labels">
        {SCALE_STEPS.map((step, index) => (
          <button
            className={index === active ? 'active' : ''}
            key={step.value}
            type="button"
            onClick={() => setScale(step.value)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {step.short}
          </button>
        ))}
      </div>
    </div>
  );
}
