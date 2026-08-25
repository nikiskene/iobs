import MuxPlayer, { type MuxPlayerRefAttributes } from '@mux/mux-player-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { IntroPlaybackMode } from './BeautifulSuccessIntro';

const PLAYBACK_ID = 'rR8P8mSaKDzz02TsftugTUdI00cQPJX00oy';

type Props = { mode: IntroPlaybackMode; onClosed: () => void };

export default function BeautifulSuccessFilmOverlay({ mode, onClosed }: Props) {
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const closeTimerRef = useRef<number>();
  const [isFading, setIsFading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const closeOverlay = useCallback((holdOnBlack = false) => {
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsFading(true);
      closeTimerRef.current = window.setTimeout(onClosed, 800);
    }, holdOnBlack ? 350 : 0);
  }, [onClosed]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeOverlay();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeOverlay]);

  useEffect(() => {
    const startupTimeout = window.setTimeout(() => {
      if (!playerRef.current?.hasPlayed) {
        console.error('Beautiful Success intro playback did not begin in time.');
        closeOverlay();
      }
    }, mode === 'autoplay' ? 4000 : 8000);
    return () => window.clearTimeout(startupTimeout);
  }, [closeOverlay, mode]);

  const syncMutedState = () => setIsMuted(Boolean(playerRef.current?.muted));
  const enableSound = () => {
    if (!playerRef.current) return;
    playerRef.current.muted = false;
    playerRef.current.volume = 1;
    setIsMuted(false);
  };
  const handlePlaybackError = (event: Event) => {
    console.error('Beautiful Success intro playback failed.', event);
    closeOverlay();
  };

  return (
    <div className={`beautiful-success-intro${isFading ? ' is-fading' : ''}`} role="dialog" aria-modal="true" aria-label="Beautiful Success film">
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

      <button className="beautiful-success-intro__close" type="button" onClick={() => closeOverlay()} aria-label="Close the Beautiful Success film">
        <span aria-hidden="true">×</span>
      </button>

      {isMuted && (
        <button className="beautiful-success-intro__sound" type="button" onClick={enableSound} aria-label="Enable sound for the Beautiful Success film">
          Sound on
        </button>
      )}
    </div>
  );
}
