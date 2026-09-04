// src/routes/ScrollToTop.tsx
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
      return;
    }

    const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    resetScroll();

    // Browsers may restore a previous page position after the first React paint.
    // Reset once more after layout and when a cached page is shown again.
    const frame = window.requestAnimationFrame(resetScroll);
    window.addEventListener('pageshow', resetScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pageshow', resetScroll);
    };
  }, [pathname, search, hash]);

  return null;
}
