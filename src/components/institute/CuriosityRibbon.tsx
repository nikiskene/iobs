// src/components/institute/CuriosityRibbon.tsx

const WORDS = [
  "Curiosity",
  "Identity",
  "Civilization",
  "Beautiful Success",
  "Future",
  "Expeditions",
  "Salon",
  "Explorer",
  "WorldOS",
];

export default function CuriosityRibbon() {
  const items = [...WORDS, ...WORDS];

  return (
    <section
      style={{
        overflow: "hidden",
        margin: "120px 0",
        padding: "24px 0",
        borderTop: "1px solid rgba(184,138,59,.12)",
        borderBottom: "1px solid rgba(184,138,59,.12)",
        background: "rgba(255,255,255,.28)",
        backdropFilter: "blur(18px)",
      }}
    >
      <style>
        {`
          @keyframes curiosity-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}
      </style>

      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: "curiosity-marquee 34s linear infinite",
        }}
      >
        {items.map((word, index) => (
          <div
            key={`${word}-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 42,
                color: "#8d6328",
                margin: "0 32px",
              }}
            >
              {word}
            </span>

            <span
              style={{
                color: "#b58a3d",
                fontSize: 18,
              }}
            >
              ✦
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}