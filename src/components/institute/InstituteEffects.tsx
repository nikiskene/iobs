// src/components/institute/InstituteEffects.tsx

import Atmosphere from './Atmosphere';
import FloatingOrnaments from './FloatingOrnaments';
import GoldNoiseOverlay from './GoldNoiseOverlay';
import MouseGlow from './MouseGlow';
import ParallaxBackground from './ParallaxBackground';
import ScrollProgress from './ScrollProgress';
import FloatingQuote from './FloatingQuote';

export default function InstituteEffects() {
  return (
    <>
      <ParallaxBackground />

      <Atmosphere />

      <GoldNoiseOverlay />

      <FloatingOrnaments />

      <MouseGlow />

      <ScrollProgress />

      <FloatingQuote />
    </>
  );
}