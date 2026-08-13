// src/components/institute/HomepageComposer.tsx
import EntranceHero from './EntranceHero';
import ScaleStoryPanel from './ScaleStoryPanel';
import AwardHomepageSections from '../awards/AwardHomepageSections';
import InstituteFooter from './InstituteFooter';
import BeautifulSuccessCases from '../awards/BeautifulSuccessCases';

export default function HomepageComposer() {
  return (
    <>
      <EntranceHero />
      <ScaleStoryPanel />
      <BeautifulSuccessCases />
      <AwardHomepageSections />
      <InstituteFooter />
    </>
  );
}
