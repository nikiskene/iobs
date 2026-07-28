// src/components/institute/InstituteShell.tsx

import { PropsWithChildren } from 'react';
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { getInstituteTheme } from '../../theme/instituteTheme';

import InstituteBackground from './InstituteBackground';
import InstituteEffects from './InstituteEffects';
import InstituteHeader from './InstituteHeader';
import PageFadeIn from './PageFadeIn';

export default function InstituteShell({
  children,
}: PropsWithChildren) {
  const { scale } = useImpactScale();
  const theme = getInstituteTheme(scale);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        background: theme.background,
        color: theme.text,
        transition:
          'background .8s ease, color .8s ease',
      }}
    >
      <InstituteBackground />

      <InstituteEffects />

      <InstituteHeader />

      <main
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          maxWidth: theme.maxWidth,
          margin: '0 auto',
          padding: '120px 40px 140px',
        }}
      >
        <PageFadeIn>{children}</PageFadeIn>
      </main>
    </div>
  );
}