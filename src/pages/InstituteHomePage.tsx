// src/pages/InstituteHomePage.tsx

import EntranceHero from '../components/institute/EntranceHero';
import ImpactDial from '../components/institute/ImpactDial';
import ImpactStatement from '../components/institute/ImpactStatement';
import InstituteFooter from '../components/institute/InstituteFooter';
import InstituteShell from '../components/institute/InstituteShell';

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

      <section
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(320px,1fr))',
          gap: 36,
        }}
      >
        <FeatureCard
          title="Library"
          text="Ideas, essays and frameworks exploring what Beautiful Success looks like—from the individual to civilization."
        />

        <FeatureCard
          title="Expeditions"
          text="Curated journeys into the places where tomorrow is already being built."
        />

        <FeatureCard
          title="Salon"
          text="Conversations with founders, artists, scientists and leaders shaping the future."
        />

        <FeatureCard
          title="Observatory"
          text="The Identity Engine. Daily signals showing what the world is becoming."
        />

        <FeatureCard
          title="Institute"
          text="Courses, talks and experiences designed to help people build a life of Beautiful Success."
        />

        <FeatureCard
          title="Fellows"
          text="A global community of people choosing to build something larger than themselves."
        />
      </section>

      <InstituteFooter />
    </InstituteShell>
  );
}

type CardProps = {
  title: string;
  text: string;
};

function FeatureCard({ title, text }: CardProps) {
  return (
    <article
      style={{
        padding: 34,
        borderRadius: 28,
        background: 'rgba(255,255,255,.55)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(184,138,59,.18)',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 34,
          fontWeight: 600,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          marginTop: 18,
          lineHeight: 1.8,
          color: '#62574c',
          fontSize: 17,
        }}
      >
        {text}
      </p>
    </article>
  );
}