// src/pages/InstituteHomePage.tsx

import InstituteShell from '../components/institute/InstituteShell';
import HomepageComposer from '../components/institute/HomepageComposer';
import BeautifulSuccessIntro from '../components/institute/BeautifulSuccessIntro';
import { ScaleWorldsProvider } from '../providers/ScaleWorldsProvider';

export default function InstituteHomePage() {
  return (
    <ScaleWorldsProvider>
      <InstituteShell>
        <HomepageComposer />
      </InstituteShell>
      <BeautifulSuccessIntro />
    </ScaleWorldsProvider>
  );
}
