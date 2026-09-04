import { useEffect, useRef, useState } from 'react';
import { cmsLines } from '../../content/homeV3Content';
import type { AwardSiteContent } from '../../providers/AwardSiteContentProvider';

export default function HomeV3Hero({ content, images, onImageChange }: { content?: AwardSiteContent; images: string[]; onImageChange: (index: number) => void }) {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const currentRef = useRef(0);
  const clearRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || images.length < 2) return;
    let cancelled = false;
    let timer: number | null = null;

    const schedule = () => {
      timer = window.setTimeout(advance, 5000);
    };
    const advance = async () => {
      if (document.hidden) {
        schedule();
        return;
      }
      const next = (currentRef.current + 1) % images.length;
      const preload = new Image();
      preload.src = images[next];
      try {
        if (!preload.complete) await preload.decode();
      } catch {
        schedule();
        return;
      }
      if (cancelled) return;
      setPrevious(currentRef.current);
      currentRef.current = next;
      setCurrent(next);
      onImageChange(next);
      if (clearRef.current) window.clearTimeout(clearRef.current);
      clearRef.current = window.setTimeout(() => setPrevious(null), 1250);
      schedule();
    };
    schedule();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      if (clearRef.current) window.clearTimeout(clearRef.current);
    };
  }, [images, onImageChange, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const preload = new Image();
    preload.src = images[(current + 1) % images.length];
  }, [current, images, reducedMotion]);

  return <section className="home-v3-hero" aria-labelledby="home-v3-title">
    <div className="home-v3-hero-copy">
      <p className="home-v3-label">{content?.label}</p>
      <h1 id="home-v3-title"><strong>{content?.headline?.split(' ')[0].toUpperCase()}</strong><em>{content?.headline?.split(' ').slice(1).join(' ')}</em></h1>
      <p className="home-v3-hero-statement">{cmsLines(content?.subheadline).map((line) => <span key={line}>{line}<br /></span>)}</p>
      <a className="home-v3-text-cta" href="#the-principle">{content?.body} <span aria-hidden="true">↓</span></a>
    </div>
    <div className="home-v3-portrait" aria-hidden="true">
      {previous !== null && <img className="leaving" src={images[previous]} alt="" />}
      <img className="arriving" key={current} src={images[current]} alt="" loading="eager" decoding="async" fetchPriority={current === 0 ? 'high' : 'auto'} />
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
