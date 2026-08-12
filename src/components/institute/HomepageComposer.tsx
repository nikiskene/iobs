// src/components/institute/HomepageComposer.tsx
import EntranceHero from './EntranceHero';
import ScaleStoryPanel from './ScaleStoryPanel';
import AwardHomepageSections from '../awards/AwardHomepageSections';
import InstituteFooter from './InstituteFooter';

export default function HomepageComposer() {
  return (
    <>
      <EntranceHero />
      <ScaleStoryPanel />
      <AwardHomepageSections />
      <InstituteFooter />
    </>
  );
}
