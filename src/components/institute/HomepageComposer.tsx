// src/components/institute/HomepageComposer.tsx

import EntranceHero from './EntranceHero';
import HeroVisual from './HeroVisual';
import ImpactDial from './ImpactDial';
import ImpactStatement from './ImpactStatement';
import SectionDivider from './SectionDivider';
import ManifestoSection from './ManifestoSection';
import QuoteSection from './QuoteSection';
import PhilosophyTimeline from './PhilosophyTimeline';
import IdentityEnginePreview from './IdentityEnginePreview';
import ExpeditionsSection from './ExpeditionsSection';
import SalonSection from './SalonSection';
import SpeakersSection from './SpeakersSection';
import TestimonialSection from './TestimonialSection';
import WorldMapSection from './WorldMapSection';
import ExplorerSection from './ExplorerSection';
import MembershipSection from './MembershipSection';
import NewsletterSection from './NewsletterSection';
import FinalCallToAction from './FinalCallToAction';
import InstituteFooter from './InstituteFooter';

export default function HomepageComposer() {
  return (
    <>
      <EntranceHero />

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 80,
        }}
      >
        <ImpactDial />
      </div>

      <ImpactStatement />

      <HeroVisual />

      <SectionDivider />

      <ManifestoSection />

      <QuoteSection />

      <PhilosophyTimeline />

      <IdentityEnginePreview />

      <ExpeditionsSection />

      <SalonSection />

      <SpeakersSection />

      <TestimonialSection />

      <WorldMapSection />

      <ExplorerSection />

      <MembershipSection />

      <NewsletterSection />

      <FinalCallToAction />

      <InstituteFooter />
    </>
  );
}