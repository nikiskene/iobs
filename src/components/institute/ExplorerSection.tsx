// src/components/institute/ExplorerSection.tsx

export default function ExplorerSection() {
  return (
    <section
      style={{
        maxWidth: 1220,
        margin: '180px auto',
        display: 'grid',
        gridTemplateColumns: '1.1fr .9fr',
        gap: 90,
        alignItems: 'center',
      }}
    >
      <div>
        <div
          style={{
            color: '#b58a3d',
            letterSpacing: '.32em',
            textTransform: 'uppercase',
            fontSize: 13,
            marginBottom: 22,
          }}
        >
          Become an Explorer
        </div>

        <h2
          style={{
            margin: 0,
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 500,
            fontSize: 'clamp(52px,6vw,86px)',
            lineHeight: .95,
          }}
        >
          Curiosity
          <br />
          deserves a home.
        </h2>

        <p
          style={{
            marginTop: 36,
            maxWidth: 620,
            fontSize: 22,
            lineHeight: 1.85,
            color: '#665b50',
          }}
        >
          Join a global community of founders, artists, scientists,
          leaders and explorers who believe that the most valuable
          conversations are still ahead of us.
        </p>

        <p
          style={{
            marginTop: 22,
            maxWidth: 620,
            fontSize: 22,
            lineHeight: 1.85,
            color: '#665b50',
          }}
        >
          Access expeditions, salons, essays, the Identity Engine and a
          growing collection of people who choose to build the future
          rather than merely react to it.
        </p>

        <button
          style={{
            marginTop: 48,
            padding: '18px 34px',
            borderRadius: 999,
            border: 'none',
            background: '#b58a3d',
            color: '#fff',
            fontSize: 16,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Become an Explorer
        </button>
      </div>

      <div
        style={{
          borderRadius: 36,
          padding: 48,
          background:
            'linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,.28))',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(184,138,59,.18)',
        }}
      >
        <Stat
          value="100+"
          label="Essays, frameworks and conversations"
        />

        <Stat
          value="Daily"
          label="Identity signals from around the world"
        />

        <Stat
          value="Global"
          label="Community of explorers and builders"
        />

        <Stat
          value="∞"
          label="Beautiful questions still waiting to be asked"
        />
      </div>
    </section>
  );
}

type StatProps = {
  value: string;
  label: string;
};

function Stat({ value, label }: StatProps) {
  return (
    <div
      style={{
        padding: '26px 0',
        borderBottom: '1px solid rgba(184,138,59,.12)',
      }}
    >
      <div
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 58,
          color: '#a67d37',
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 18,
          lineHeight: 1.7,
          color: '#655b50',
        }}
      >
        {label}
      </div>
    </div>
  );
}