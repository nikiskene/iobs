// src/components/institute/ImpactDial.tsx
import { useEffect } from 'react';
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { useScaleWorlds } from '../../providers/ScaleWorldsProvider';
import { KNOB_SIZES, knobImageSet, knobImageUrl } from './knobImage';

export default function ImpactDial() {
  const { scale, setScale } = useImpactScale();
  const worlds = useScaleWorlds();
  const active = worlds.findIndex((world) => world.slug === scale);
  const world = worlds[active];
  const nextWorld = worlds[(active + 1) % worlds.length];

  useEffect(() => {
    const preload = new Image();
    preload.src = knobImageUrl(nextWorld.knobImageUrl, 800);
    preload.srcset = knobImageSet(nextWorld.knobImageUrl);
    preload.sizes = KNOB_SIZES;
  }, [nextWorld.knobImageUrl]);

  return (
    <div className="scale-dial" aria-label="Choose the scale of your ambition">
      <button
        className="rendered-knob"
        type="button"
        onClick={() => setScale(worlds[(active + 1) % worlds.length].slug)}
        aria-label={`Current scale: ${world.label}. Select next scale.`}
      >
        <img
          key={world.slug}
          src={knobImageUrl(world.knobImageUrl, 800)}
          srcSet={knobImageSet(world.knobImageUrl)}
          sizes={KNOB_SIZES}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
      </button>
    </div>
  );
}
