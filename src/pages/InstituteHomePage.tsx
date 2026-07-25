// src/pages/InstituteHomePage.tsx

import EntranceHero from '../components/institute/EntranceHero';
import ExpeditionsSection from '../components/institute/ExpeditionsSection';
import ExplorerSection from '../components/institute/ExplorerSection';
import FinalCallToAction from '../components/institute/FinalCallToAction';
import HeroVisual from '../components/institute/HeroVisual';
import IdentityEnginePreview from '../components/institute/IdentityEnginePreview';
import ImpactDial from '../components/institute/ImpactDial';
import ImpactStatement from '../components/institute/ImpactStatement';
import InstituteFooter from '../components/institute/InstituteFooter';
import InstituteShell from '../components/institute/InstituteShell';
import ManifestoSection from '../components/institute/ManifestoSection';
import MembershipSection from '../components/institute/MembershipSection';
import NewsletterSection from '../components/institute/NewsletterSection';
import PhilosophyTimeline from '../components/institute/PhilosophyTimeline';
import QuoteSection from '../components/institute/QuoteSection';
import SalonSection from '../components/institute/SalonSection';
import SectionDivider from '../components/institute/SectionDivider';
import SpeakersSection from '../components/institute/SpeakersSection';
import TestimonialSection from '../components/institute/TestimonialSection';
import WorldMapSection from '../components/institute/WorldMapSection';

export default function InstituteHomePage() {
  return (
    <InstituteShell>
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
    </InstituteShell>
  );
}