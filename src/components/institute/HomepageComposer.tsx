// src/components/institute/HomepageComposer.tsx
import EntranceHero from './EntranceHero';
import ScaleStoryPanel from './ScaleStoryPanel';
import AwardHomepageSections from '../awards/AwardHomepageSections';
import BeautifulSuccessCases from '../awards/BeautifulSuccessCases';
import InstituteFooter from './InstituteFooter';
import './recoveredSections.css';

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
