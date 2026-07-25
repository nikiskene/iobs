// src/components/institute/InstituteShell.tsx

import { PropsWithChildren } from 'react';
import InstituteHeader from './InstituteHeader';
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
          'background-color .9s ease,color .9s ease',
      }}
    >
      <div
        style={{
          maxWidth: theme.maxWidth,
          margin: '0 auto',
          padding: '0 40px 120px',
        }}
      >
        <InstituteHeader />

        {children}
      </div>
    </div>
  );
}