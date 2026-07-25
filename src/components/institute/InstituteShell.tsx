// src/components/institute/InstituteShell.tsx

import { PropsWithChildren } from 'react';
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { getInstituteTheme } from '../../theme/instituteTheme';

export default function InstituteShell({
  children,
}: PropsWithChildren) {
  const { scale } = useImpactScale();
  const theme = getInstituteTheme(scale);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.background,
        color: theme.text,
        transition:
          'background-color .8s ease,color .8s ease',
      }}
    >
      <div
        style={{
          maxWidth: theme.maxWidth,
          margin: '0 auto',
          padding: '48px 32px 96px',
        }}
      >
        {children}
      </div>
    </div>
  );
}