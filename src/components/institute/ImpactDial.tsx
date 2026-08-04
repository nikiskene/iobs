// src/components/institute/ImpactDial.tsx
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { useScaleWorlds } from '../../providers/ScaleWorldsProvider';

export default function ImpactDial() {
  const { scale, setScale } = useImpactScale();
  const worlds = useScaleWorlds();
  const active = worlds.findIndex((world) => world.slug === scale);
  const world = worlds[active];

  return (
    <div className="scale-dial" aria-label="Choose the scale of your ambition">
      <p className="dial-instruction">Turn the scale of possibility</p>
      <button
        className="rendered-knob"
        type="button"
        onClick={() => setScale(worlds[(active + 1) % worlds.length].slug)}
        aria-label={`Current scale: ${world.label}. Select next scale.`}
      >
        {worlds.map((item, index) => (
          <img
            className={index === active ? 'active' : ''}
            key={item.slug}
            src={item.knobImageUrl}
            alt=""
            aria-hidden="true"
          />
        ))}
      </button>
      <div className="dial-labels" role="group" aria-label="Impact scales">
        {worlds.map((item, index) => (
          <button
            className={index === active ? 'active' : ''}
            key={item.slug}
            type="button"
            onClick={() => setScale(item.slug)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>{item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
