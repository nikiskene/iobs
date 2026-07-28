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
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: theme.background,
        color: theme.text,
        transition:
          'background-color .8s ease, color .8s ease',
      }}
    >
      <InstituteBackground />

      <InstituteEffects />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: theme.maxWidth,
          margin: '0 auto',
          padding: '0 40px 120px',
        }}
      >
        <InstituteHeader />

        <PageFadeIn>{children}</PageFadeIn>
      </div>
    </div>
  );
}