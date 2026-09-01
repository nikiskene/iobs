import { useEffect, useRef, useState } from 'react';
import { HOME_V3_COPY, HOME_V3_HERO_IMAGES } from '../../content/homeV3Content';

export default function HomeV3Hero({ onImageChange }: { onImageChange: (index: number) => void }) {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const currentRef = useRef(0);
  const clearRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const advance = () => {
      if (document.hidden) return;
      const next = (currentRef.current + 1) % HOME_V3_HERO_IMAGES.length;
      setPrevious(currentRef.current);
      currentRef.current = next;
      setCurrent(next);
      onImageChange(next);
      if (clearRef.current) window.clearTimeout(clearRef.current);
      clearRef.current = window.setTimeout(() => setPrevious(null), 850);
    };
    const interval = window.setInterval(advance, 3000);
    return () => {
      window.clearInterval(interval);
      if (clearRef.current) window.clearTimeout(clearRef.current);
    };
  }, [onImageChange, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const preload = new Image();
    preload.src = HOME_V3_HERO_IMAGES[(current + 1) % HOME_V3_HERO_IMAGES.length];
  }, [current, reducedMotion]);

  return <section className="home-v3-hero" aria-labelledby="home-v3-title">
    <div className="home-v3-hero-copy">
      <p className="home-v3-label">{HOME_V3_COPY.heroEyebrow}</p>
      <h1 id="home-v3-title"><em>Beautiful</em><strong>SUCCESS</strong></h1>
      <p className="home-v3-hero-statement">{HOME_V3_COPY.heroLead}<br /><span>{HOME_V3_COPY.heroFollow}</span></p>
      <a className="home-v3-text-cta" href="#the-principle">DISCOVER BEAUTIFUL SUCCESS <span aria-hidden="true">↓</span></a>
    </div>
    <div className="home-v3-portrait" aria-hidden="true">
      {previous !== null && <img className="leaving" src={HOME_V3_HERO_IMAGES[previous]} alt="" />}
      <img className="arriving" key={current} src={HOME_V3_HERO_IMAGES[current]} alt="" decoding="async" fetchPriority={current === 0 ? 'high' : 'auto'} />
    </div>
  </section>;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}
