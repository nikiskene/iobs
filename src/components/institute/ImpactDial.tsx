// src/components/institute/ImpactDial.tsx
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { useScaleWorlds } from '../../providers/ScaleWorldsProvider';
import { useLocale } from '../../providers/LocaleProvider';

export default function ImpactDial() {
  const { scale, setScale } = useImpactScale();
  const worlds = useScaleWorlds();
  const { t } = useLocale();
  const active = worlds.findIndex((world) => world.slug === scale);
  const world = worlds[active];

  return (
    <div className="scale-dial" aria-label="Choose the scale of your ambition">
      <button
        className="rendered-knob"
        type="button"
        onClick={() => setScale(worlds[(active + 1) % worlds.length].slug)}
        aria-label={`Current scale: ${world.label}. Select next scale.`}
      >
        {worlds.map((item, index) => (
          <img className={index === active ? 'active' : ''} key={item.slug} src={item.knobImageUrl} alt="" aria-hidden="true" />
        ))}
      </button>
      <p className="dial-hint">{t('dial.hint')}</p>
    </div>
  );
}
