import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import './beautifulSuccessIntro.css';

const MuxPlayer = lazy(() => import('@mux/mux-player-react'));

const PLAYBACK_ID = 'ozIj7reZjM7uaKi01AT582khjGBQhiDrreD3mRlN02hdk';
const INTRO_SEEN_KEY = 'beautiful-success-intro-seen';
const MOBILE_QUERY = '(max-width: 560px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type PlaybackMode = 'autoplay' | 'manual' | null;

export default function BeautifulSuccessIntro() {
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const closeTimerRef = useRef<number>();
  const [mode, setMode] = useState<PlaybackMode>(null);
  const [isFading, setIsFading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const closeOverlay = useCallback((holdOnBlack = false) => {
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsFading(true);
      closeTimerRef.current = window.setTimeout(() => {
        setMode(null);
        setIsFading(false);
        setIsMuted(false);
      }, 800);
    }, holdOnBlack ? 350 : 0);
  }, []);

  useEffect(() => {
    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
    const reducesMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    let hasSeenIntro = false;

    try {
      hasSeenIntro = window.localStorage.getItem(INTRO_SEEN_KEY) === 'true';
    } catch (error) {
      console.warn('Beautiful Success intro state could not be read.', error);
    }

    if (!isMobile && !reducesMotion && !hasSeenIntro) {
      setMode('autoplay');
      try {
        window.localStorage.setItem(INTRO_SEEN_KEY, 'true');
      } catch (error) {
        console.warn('Beautiful Success intro state could not be saved.', error);
      }
    }

    return () => window.clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!mode) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mode]);

  useEffect(() => {
    if (!mode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeOverlay();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeOverlay, mode]);

  useEffect(() => {
    if (!mode) return;

    const startupTimeout = window.setTimeout(() => {
      if (!playerRef.current?.hasPlayed) {
        console.error('Beautiful Success intro playback did not begin in time.');
        closeOverlay();
      }
    }, 8000);
    return () => window.clearTimeout(startupTimeout);
  }, [closeOverlay, mode]);

  const openManualPlayback = () => {
    setIsFading(false);
    setMode('manual');
  };

  const handlePlaybackError = (event: Event) => {
    console.error('Beautiful Success intro playback failed.', event);
    closeOverlay();
  };

  const syncMutedState = () => {
    setIsMuted(Boolean(playerRef.current?.muted));
  };

  const enableSound = () => {
    if (!playerRef.current) return;
    playerRef.current.muted = false;
    playerRef.current.volume = 1;
    setIsMuted(false);
  };

  return (
    <>
      <button
        className="beautiful-success-watch-film"
        type="button"
        onClick={openManualPlayback}
        aria-label="Watch the Beautiful Success film"
      >
        Watch the film <span aria-hidden="true">→</span>
      </button>

      {mode && (
        <div
          className={`beautiful-success-intro${isFading ? ' is-fading' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Beautiful Success film"
        >
          <Suspense fallback={null}>
            <MuxPlayer
              ref={playerRef}
              className="beautiful-success-intro__player"
              playbackId={PLAYBACK_ID}
              autoPlay="any"
              preload={mode === 'autoplay' ? 'metadata' : 'none'}
              poster=""
              playsInline
              nohotkeys
              noMutedPref
              noVolumePref
              metadata={{ video_title: 'Beautiful Success Award is here' }}
              onPlaying={syncMutedState}
              onVolumeChange={syncMutedState}
              onEnded={() => closeOverlay(true)}
              onError={handlePlaybackError}
            />
          </Suspense>

          <button
            className="beautiful-success-intro__close"
            type="button"
            onClick={() => closeOverlay()}
            aria-label="Close the Beautiful Success film"
          >
            <span aria-hidden="true">×</span>
          </button>

          {isMuted && (
            <button
              className="beautiful-success-intro__sound"
              type="button"
              onClick={enableSound}
              aria-label="Enable sound for the Beautiful Success film"
            >
              Sound on
            </button>
          )}
        </div>
      )}
    </>
  );
}
