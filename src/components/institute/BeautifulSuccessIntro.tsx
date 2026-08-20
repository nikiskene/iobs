import { lazy, Suspense, useEffect, useState } from 'react';
import './beautifulSuccessIntro.css';

const BeautifulSuccessFilmOverlay = lazy(() => import('./BeautifulSuccessFilmOverlay'));
const INTRO_SEEN_KEY = 'beautiful-success-intro-seen';
const MOBILE_VIEWPORT_QUERY = '(max-width: 900px)';
const TOUCH_DEVICE_QUERY = '(hover: none) and (pointer: coarse)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export type IntroPlaybackMode = 'autoplay' | 'manual';

export default function BeautifulSuccessIntro() {
  const [mode, setMode] = useState<IntroPlaybackMode | null>(null);

  useEffect(() => {
    const hasMobileViewport = window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
    const isTouchDevice = window.matchMedia(TOUCH_DEVICE_QUERY).matches;
    const hasMobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const reducesMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    let hasSeenIntro = false;

    try {
      hasSeenIntro = window.localStorage.getItem(INTRO_SEEN_KEY) === 'true';
    } catch (error) {
      console.warn('Beautiful Success intro state could not be read.', error);
    }

    if (!hasMobileViewport && !isTouchDevice && !hasMobileUserAgent && !reducesMotion && !hasSeenIntro) {
      setMode('autoplay');
      try {
        window.localStorage.setItem(INTRO_SEEN_KEY, 'true');
      } catch (error) {
        console.warn('Beautiful Success intro state could not be saved.', error);
      }
    }
  }, []);

  return (
    <>
      <button className="beautiful-success-watch-film" type="button" onClick={() => setMode('manual')} aria-label="Watch the Beautiful Success film">
        Watch the film <span aria-hidden="true">→</span>
      </button>

      {mode && (
        <Suspense fallback={null}>
          <BeautifulSuccessFilmOverlay mode={mode} onClosed={() => setMode(null)} />
        </Suspense>
      )}
    </>
  );
}
