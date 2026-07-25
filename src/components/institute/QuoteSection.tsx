// src/components/institute/QuoteSection.tsx

const QUOTES = [
  {
    quote:
      'Information has become a commodity. Clarity has become the scarce resource.',
  },
  {
    quote:
      'The future belongs to those who design identities, not merely strategies.',
  },
  {
    quote:
      'Beautiful Success is measured by the world you leave behind—not the wealth you accumulate.',
  },
];

export default function QuoteSection() {
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: '160px auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(320px,1fr))',
          gap: 32,
        }}
      >
        {QUOTES.map((item) => (
          <article
            key={item.quote}
            style={{
              padding: 42,
              borderRadius: 30,
              background: 'rgba(255,255,255,.42)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(184,138,59,.18)',
              minHeight: 260,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <blockquote
              style={{
                margin: 0,
                textAlign: 'center',
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                fontSize: 36,
                lineHeight: 1.3,
                color: '#7b6031',
              }}
            >
              “{item.quote}”
            </blockquote>
          </article>
        ))}
      </div>
    </section>
  );
}