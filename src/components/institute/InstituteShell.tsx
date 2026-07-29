// src/components/institute/InstituteShell.tsx

import { PropsWithChildren } from 'react';
import InstituteBackground from './InstituteBackground';
import InstituteHeader from './InstituteHeader';
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { getInstituteTheme } from '../../theme/instituteTheme';
import './instituteHome.css';

export default function InstituteShell({
  children,
}: PropsWithChildren) {
  const { scale } = useImpactScale();
  const theme = getInstituteTheme(scale);

  return (
    <div
      className={`institute-shell scale-${scale}`}
      style={{
        minHeight: '100vh',
        background: theme.background,
        color: theme.text,
        transition:
          'background-color .9s ease, color .9s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <InstituteBackground />

      <div className="institute-frame">
        <InstituteHeader />
        {children}
      </div>
    </div>
  );
}
