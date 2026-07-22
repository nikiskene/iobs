// src/components/home/HomepageContentSections.tsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { HomepageSection } from '../../lib/types';

export default function HomepageContentSections({
  sections,
}: {
  sections: HomepageSection[];
}) {
  return (
    <>
      {sections.map((section) =>
        isPresenceSection(section) ? (
          <NetworkPresenceSection key={section.id} section={section} />
        ) : (
          <NarrativeSection key={section.id} section={section} />
        )
      )}
    </>
  );
}

function isPresenceSection(section: HomepageSection) {
  const key = section.section_key.toLowerCase();
  const headline = section.headline?.toLowerCase() || '';

  return (
    key.includes('location') ||
    key.includes('presence') ||
    key.includes('institute') ||
    headline.includes('operating systems in the world')
  );
}

function NetworkPresenceSection({ section }: { section: HomepageSection }) {
  const locations = parseLocations(section.body);

  return (
    <section className="relative z-10 overflow-hidden border-t border-white/5 px-6 py-28">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          {section.subheadline && (
            <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">
              {section.subheadline}
            </p>
          )}

          {section.headline && (
            <h2 className="mt-5 max-w-xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              {section.headline}
            </h2>
          )}

          <div className="mt-7 h-px w-16 bg-sky-400" />

          <p className="mt-8 max-w-md text-sm leading-relaxed text-zinc-400">
            We welcome Explorers from every neck of the woods. Currently, the
            network is present in:
          </p>

          {locations.length > 0 && <LocationList locations={locations} />}

          <Link
            to="/about"
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
          >
            Learn more about us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <NetworkMap />
      </div>
    </section>
  );
}

function LocationList({ locations }: { locations: string[] }) {
  return (
    <div className="mt-8 space-y-3">
      {locations.map((location) => (
        <div
          key={location}
          className="flex items-center gap-4 border-b border-white/5 py-3"
        >
          <div className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.9)]" />
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-200">
            {location}
          </span>
        </div>
      ))}
    </div>
  );
}

function NetworkMap() {
  return (
    <div className="relative min-h-[420px]">
      <div className="network-map" />
      <span className="network-pin pin-us" />
      <span className="network-pin pin-eu" />
      <span className="network-pin pin-lt" />
      <span className="network-pin pin-dubai" />
      <span className="network-pin pin-hk" />

      <div className="network-arc arc-one" />
      <div className="network-arc arc-two" />
      <div className="network-arc arc-three" />
    </div>
  );
}

function NarrativeSection({ section }: { section: HomepageSection }) {
  return (
    <section className="relative z-10 flex min-h-screen items-center px-6 py-28">
      <div className="mx-auto max-w-4xl">
        {section.subheadline && (
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">
            {section.subheadline}
          </p>
        )}

        {section.headline && (
          <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            {section.headline}
          </h2>
        )}

        {section.body && (
          <p className="mt-8 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-zinc-300 md:text-xl">
            {section.body}
          </p>
        )}
      </div>
    </section>
  );
}

function parseLocations(body?: string | null) {
  if (!body) return [];

  return body
    .split(/\n|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
}