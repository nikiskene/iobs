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
        overflow: 'hidden',
        background: theme.background,
        color: theme.text,
        transition:
          'background-color .9s ease, color .9s ease',
      }}
    >
      <InstituteBackground />

      <InstituteEffects />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
        }}
      >
        <InstituteHeader />

        <main
          style={{
            width: '100%',
            maxWidth: theme.maxWidth,
            margin: '0 auto',
            padding: '120px 48px 160px',
          }}
        >
          <PageFadeIn>{children}</PageFadeIn>
        </main>
      </div>
    </div>
  );
}