import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import BeautifulSuccessCases from '../awards/BeautifulSuccessCases';
import { HOME_V3_SCALES } from '../../content/homeV3Content';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { useScaleWorlds } from '../../providers/ScaleWorldsProvider';

const STORAGE_KEY = 'beautiful-success-v3-scale';

export default function HomeV3ImpactRadius() {
  const { scale, setScale } = useImpactScale();
  const worlds = useScaleWorlds();
  const { get } = useAwardSiteContent();
  const content = get('v3_scale');
  const [params] = useSearchParams();
  const initialized = useRef(false);
  const active = Math.max(0, HOME_V3_SCALES.findIndex((item) => item.id === scale));
  const world = worlds.find((item) => item.slug === scale) ?? worlds[0];

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const requested = params.get('scale');
    const fromUrl = HOME_V3_SCALES.find((item) => item.urlId === requested);
    const stored = HOME_V3_SCALES.find((item) => item.urlId === window.sessionStorage.getItem(STORAGE_KEY));
    if (fromUrl) setScale(fromUrl.id);
    else if (stored) setScale(stored.id);
  }, [params, setScale]);

  function select(index: number) {
    const selected = HOME_V3_SCALES[index];
    setScale(selected.id);
    window.sessionStorage.setItem(STORAGE_KEY, selected.urlId);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    select((active + direction + HOME_V3_SCALES.length) % HOME_V3_SCALES.length);
  }

  return <section className="home-v3-scale" aria-labelledby="impact-radius-title" style={content?.media_url ? { backgroundImage:`linear-gradient(90deg,#020407 0%,#020407dd 25%,#02040744),url(${content.media_url})` } : undefined}>
    <div className="home-v3-scale-intro">
      <p className="home-v3-label">{content?.label}</p>
      <h2 id="impact-radius-title">{content?.headline}</h2>
      <strong>{content?.subheadline}</strong>
      <div>{content?.body?.split('\n').map((line) => <p key={line}>{line}</p>)}</div>
    </div>
    <div className="home-v3-radius" role="radiogroup" aria-label="Scale of impact" onKeyDown={onKeyDown}>
      <div className="home-v3-radius-arcs" aria-hidden="true"><i /><i /><i /></div>
      <div className="home-v3-radius-line" aria-hidden="true" />
      {HOME_V3_SCALES.map((item, index) => <button key={item.id} type="button" role="radio" aria-checked={index === active} tabIndex={index === active ? 0 : -1} className={index === active ? 'selected' : ''} onClick={() => select(index)}>
        <img src={worlds[index]?.knobImageUrl} alt="" /><strong>{worlds[index]?.label || item.label}</strong>
      </button>)}
    </div>
    <article className="home-v3-scale-story" key={world.slug}>
      <p className="home-v3-label">{world.label}</p><h3>{world.title}</h3><p>{world.introduction}</p>
    </article>
    <div className="home-v3-cases"><BeautifulSuccessCases /></div>
  </section>;
}
