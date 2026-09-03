import { useEffect, useMemo, useRef, useState } from 'react';
import { cmsLines } from '../../content/homeV3Content';
import { optimizedImageUrl, viewportImageWidth } from '../../lib/media';
import type { AwardSiteContent } from '../../providers/AwardSiteContentProvider';

export default function HomeV3Hero({ content, images, onImageChange }: { content?: AwardSiteContent; images: string[]; onImageChange: (index: number) => void }) {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const currentRef = useRef(0);
  const clearRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const imageWidth = viewportImageWidth();
  const optimizedImages = useMemo(() => images.map((image) => optimizedImageUrl(image, imageWidth)), [imageWidth, images]);

  useEffect(() => {
    if (reducedMotion) return;
    const advance = () => {
      if (document.hidden) return;
      const next = (currentRef.current + 1) % images.length;
      setPrevious(currentRef.current);
      currentRef.current = next;
      setCurrent(next);
      onImageChange(next);
      if (clearRef.current) window.clearTimeout(clearRef.current);
      clearRef.current = window.setTimeout(() => setPrevious(null), 1250);
    };
    const interval = window.setInterval(advance, 5000);
    return () => {
      window.clearInterval(interval);
      if (clearRef.current) window.clearTimeout(clearRef.current);
    };
  }, [images.length, onImageChange, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    if ('connection' in navigator && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
    const preload = () => { const image = new Image(); image.src = optimizedImages[(current + 1) % optimizedImages.length]; };
    const timer = window.setTimeout(preload, 1800);
    return () => window.clearTimeout(timer);
  }, [current, optimizedImages, reducedMotion]);

  return <section className="home-v3-hero" aria-labelledby="home-v3-title">
    <div className="home-v3-hero-copy">
      <p className="home-v3-label">{content?.label}</p>
      <h1 id="home-v3-title"><strong>{content?.headline?.split(' ')[0].toUpperCase()}</strong><em>{content?.headline?.split(' ').slice(1).join(' ')}</em></h1>
      <p className="home-v3-hero-statement">{cmsLines(content?.subheadline).map((line) => <span key={line}>{line}<br /></span>)}</p>
      <a className="home-v3-text-cta" href="#the-principle">{content?.body} <span aria-hidden="true">↓</span></a>
    </div>
    <div className="home-v3-portrait" aria-hidden="true">
      {previous !== null && <img className="leaving" src={optimizedImages[previous]} alt="" decoding="async" />}
      <img className="arriving" key={current} src={optimizedImages[current]} alt="" loading="eager" decoding="async" fetchPriority={current === 0 ? 'high' : 'auto'} />
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
