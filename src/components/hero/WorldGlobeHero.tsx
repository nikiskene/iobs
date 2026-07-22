// src/components/hero/WorldGlobeHero.tsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { HomepageRotatingHeadline } from '../../lib/types';
import './worldGlobe.css';

const globeVideoUrl =
  'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/Globe.mp4';

export default function WorldGlobeHero({
  headline,
  body,
  user,
}: {
  headline?: HomepageRotatingHeadline;
  body?: string | null;
  mediaUrl?: string | null;
  user?: unknown;
}) {
  return (
    <section className="world-hero relative min-h-screen overflow-hidden bg-[#050608] text-white">
      <div className="absolute inset-0 bg-[#050608]" />
      <div className="world-ambient" />
      <div className="world-hero-grid" />
      <OrbitLayer />
      <NodeLayer />

      <div className="relative z-20 flex min-h-screen items-center px-6">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="pt-16 lg:pt-0">
            <p className="text-xs uppercase tracking-[0.45em] text-sky-300/80">
              World Operating System
            </p>

            {headline ? (
              <div key={headline.id} className="world-hero-headline mt-8">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-400/10 text-2xl font-bold text-sky-300">
                  {headline.prefix}
                </div>

                <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
                  {headline.subject}
                  <br />
                  {headline.first_line}
                  <br />
                  <span className="text-sky-300">
                    {headline.second_line}
                  </span>
                </h1>
              </div>
            ) : (
              <h1 className="mt-8 max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
                The world needs an{' '}
                <span className="text-sky-300">upgrade.</span>
              </h1>
            )}

            {body && (
              <p className="mt-8 max-w-xl whitespace-pre-line text-lg leading-relaxed text-zinc-300">
                {body}
              </p>
            )}

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/thesis"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-black transition hover:bg-zinc-200"
              >
                Explore Thesis <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/expeditions"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-sky-300/30 bg-sky-500/10 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-sky-100 transition hover:bg-sky-500/20"
              >
                Expeditions <ArrowRight className="h-4 w-4" />
              </Link>

              {!user && (
                <Link
                  to="/join"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
                >
                  Join <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="relative hidden min-h-[620px] lg:block">
            <div className="globe-video-glow" />

            <div className="globe-video-wrap">
  <video autoPlay muted loop playsInline preload="auto">
    <source src={globeVideoUrl} type="video/mp4" />
  </video>

  <div className="globe-dark-layer" />
</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrbitLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div className="world-orbit world-orbit-one" />
      <div className="world-orbit world-orbit-two" />
      <div className="world-orbit world-orbit-three" />
    </div>
  );
}

function NodeLayer() {
  const nodes = [
    { left: '68%', top: '36%', delay: '0s' },
    { left: '76%', top: '47%', delay: '0.7s' },
    { left: '61%', top: '52%', delay: '1.4s' },
    { left: '82%', top: '61%', delay: '2.1s' },
    { left: '57%', top: '42%', delay: '2.8s' },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
      {nodes.map((node, index) => (
        <span
          key={index}
          className="world-node"
          style={{
            left: node.left,
            top: node.top,
            animationDelay: node.delay,
          }}
        />
      ))}
    </div>
  );
}