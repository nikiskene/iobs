// src/components/institute/IdentityEnginePreview.tsx

export default function IdentityEnginePreview() {
  const signals = [
    {
      entity: "NVIDIA",
      shift: "From AI Infrastructure → AI Civilization",
      confidence: "98%",
    },
    {
      entity: "Denmark",
      shift: "From Digital Government → AI Government",
      confidence: "94%",
    },
    {
      entity: "OpenAI",
      shift: "From Research Lab → Global Platform",
      confidence: "97%",
    },
    {
      entity: "Toyota",
      shift: "From Automaker → Mobility Intelligence",
      confidence: "91%",
    },
  ];

  return (
    <section
      style={{
        maxWidth: 1220,
        margin: "180px auto",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: 70,
        }}
      >
        <div
          style={{
            fontSize: 13,
            letterSpacing: ".35em",
            textTransform: "uppercase",
            color: "#b58a3d",
            marginBottom: 22,
          }}
        >
          WorldOS Identity Engine
        </div>

        <h2
          style={{
            margin: 0,
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 500,
            fontSize: "clamp(54px,6vw,90px)",
            lineHeight: .95,
          }}
        >
          What is the world
          <br />
          becoming?
        </h2>

        <p
          style={{
            maxWidth: 760,
            margin: "36px auto 0",
            fontSize: 22,
            lineHeight: 1.85,
            color: "#655b50",
          }}
        >
          Every day the Identity Engine observes companies, governments,
          institutions and cultures—not to report events, but to understand
          identity.
        </p>
      </div>

      <div
        style={{
          borderRadius: 34,
          overflow: "hidden",
          border: "1px solid rgba(184,138,59,.18)",
          background: "rgba(255,255,255,.55)",
          backdropFilter: "blur(24px)",
        }}
      >
        {signals.map((signal, index) => (
          <div
            key={signal.entity}
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr 100px",
              gap: 28,
              alignItems: "center",
              padding: "28px 34px",
              borderBottom:
                index === signals.length - 1
                  ? "none"
                  : "1px solid rgba(184,138,59,.08)",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 20,
              }}
            >
              {signal.entity}
            </div>

            <div
              style={{
                color: "#655b50",
                fontSize: 18,
              }}
            >
              {signal.shift}
            </div>

            <div
              style={{
                textAlign: "right",
                color: "#b58a3d",
                fontWeight: 700,
              }}
            >
              {signal.confidence}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}