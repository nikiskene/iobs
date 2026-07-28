// src/components/institute/InstituteEffects.tsx

import Atmosphere from './Atmosphere';
import FloatingOrnaments from './FloatingOrnaments';
import FloatingQuote from './FloatingQuote';
import GoldNoiseOverlay from './GoldNoiseOverlay';
import LuxuryCursor from './LuxuryCursor';
import LuxuryScrollbar from './LuxuryScrollbar';
import MouseGlow from './MouseGlow';
import ParallaxBackground from './ParallaxBackground';

export default function InstituteEffects() {
  return (
    <>
      <ParallaxBackground />

      <Atmosphere />

      <GoldNoiseOverlay />

      <FloatingOrnaments />

      <MouseGlow />

      <LuxuryCursor />

      <LuxuryScrollbar />

      <FloatingQuote />
    </>
  );
}