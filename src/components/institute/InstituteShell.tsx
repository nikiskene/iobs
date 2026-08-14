// src/components/institute/InstituteShell.tsx

import { PropsWithChildren } from 'react';
import InstituteBackground from './InstituteBackground';
import InstituteHeader from './InstituteHeader';
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import './instituteHome.css';
import './awardSite.css';
import './foundingStripFix.css';
import './compactAwardLayout.css';

export default function InstituteShell({
  children,
}: PropsWithChildren) {
  const { scale } = useImpactScale();

  return (
    <div className={`institute-shell scale-${scale}`}>
      <InstituteBackground />

      <div className="institute-frame">
        <InstituteHeader />
        {children}
      </div>
    </div>
  );
}
