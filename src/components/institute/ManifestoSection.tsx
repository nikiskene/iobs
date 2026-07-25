// src/components/institute/ManifestoSection.tsx

export default function ManifestoSection() {
  return (
    <section
      style={{
        maxWidth: 980,
        margin: '0 auto',
        padding: '40px 0 120px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          color: '#b58a3d',
          textTransform: 'uppercase',
          letterSpacing: '.35em',
          fontSize: 13,
          marginBottom: 28,
        }}
      >
        Manifesto
      </div>

      <h2
        style={{
          margin: 0,
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 500,
          fontSize: 'clamp(52px,6vw,88px)',
          lineHeight: 0.95,
        }}
      >
        Success was never meant
        <br />
        to be measured.
      </h2>

      <p
        style={{
          margin: '44px auto 0',
          maxWidth: 760,
          fontSize: 23,
          lineHeight: 1.9,
          color: '#64594e',
        }}
      >
        We inherited definitions of success that reward accumulation,
        comparison and optimization. They produced extraordinary
        progress—but also exhaustion, polarization and a world that is
        increasingly difficult to understand.
      </p>

      <p
        style={{
          margin: '28px auto 0',
          maxWidth: 760,
          fontSize: 23,
          lineHeight: 1.9,
          color: '#64594e',
        }}
      >
        We believe there is another path. Beautiful Success is not about
        having more. It is about creating more value, more possibility,
        more curiosity and more humanity than existed before you arrived.
      </p>

      <blockquote
        style={{
          margin: '70px auto',
          maxWidth: 860,
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(38px,4vw,58px)',
          lineHeight: 1.2,
          color: '#9d7633',
          fontStyle: 'italic',
        }}
      >
        "If you could build anything in the world,
        <br />
        what would it be?"
      </blockquote>

      <p
        style={{
          margin: 0,
          maxWidth: 760,
          marginInline: 'auto',
          fontSize: 21,
          lineHeight: 1.9,
          color: '#64594e',
        }}
      >
        That question is the beginning of every expedition, every
        conversation and every idea explored by the Institute of
        Beautiful Success.
      </p>
    </section>
  );
}