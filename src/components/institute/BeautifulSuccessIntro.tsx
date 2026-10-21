import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { lazy, Suspense, useState } from 'react';
import './beautifulSuccessIntro.css';

const BeautifulSuccessFilmOverlay = lazy(() => import('./BeautifulSuccessFilmOverlay'));
export type IntroPlaybackMode = 'autoplay' | 'manual';

export default function BeautifulSuccessIntro() {
  const { translate: tr } = useAwardSiteContent();
  const [mode, setMode] = useState<IntroPlaybackMode | null>(null);

  return (
    <>
      <button className="beautiful-success-watch-film" type="button" onClick={() => setMode('manual')} aria-label={tr("Watch the Beautiful Success film")}>{tr("Watch the film")}<span aria-hidden="true">→</span>
      </button>

      {mode && (
        <Suspense fallback={null}>
          <BeautifulSuccessFilmOverlay mode={mode} onClosed={() => setMode(null)} />
        </Suspense>
      )}
    </>
  );
}
