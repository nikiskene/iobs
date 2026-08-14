// src/components/institute/InstituteShell.tsx

import { PropsWithChildren } from 'react';
import InstituteBackground from './InstituteBackground';
import InstituteHeader from './InstituteHeader';
import { useImpactScale } from '../../providers/ImpactScaleProvider';
import { AwardSiteContentProvider } from '../../providers/AwardSiteContentProvider';
import { LocaleProvider } from '../../providers/LocaleProvider';
import './instituteHome.css';
import './awardSite.css';
import './foundingStripFix.css';
import './compactAwardLayout.css';
import './locale.css';

export default function InstituteShell({ children }: PropsWithChildren) {
  const { scale } = useImpactScale();

  return (
    <LocaleProvider>
      <AwardSiteContentProvider>
        <div className={`institute-shell scale-${scale}`}>
          <InstituteBackground />
          <div className="institute-frame">
            <InstituteHeader />
            {children}
          </div>
        </div>
      </AwardSiteContentProvider>
    </LocaleProvider>
  );
}
