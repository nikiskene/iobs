// src/components/institute/ExpeditionsSection.tsx

const EXPEDITIONS = [
  {
    city: "Silicon Valley",
    title: "The Future in Motion",
    text:
      "Meet founders, researchers and institutions shaping the next operating system of business and society.",
  },
  {
    city: "Shenzhen",
    title: "Where Products Become Reality",
    text:
      "Experience the fastest innovation ecosystem on Earth—from prototype to production in days.",
  },
  {
    city: "Dubai",
    title: "Designing Tomorrow",
    text:
      "Explore how governments and entrepreneurs intentionally build entirely new economic systems.",
  },
];

export default function ExpeditionsSection() {
  return (
    <section
      style={{
        maxWidth: 1240,
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
          Expeditions
        </div>

        <h2
          style={{
            margin: 0,
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 500,
            fontSize: "clamp(56px,6vw,92px)",
            lineHeight: .95,
          }}
        >
          The world's best
          <br />
          classroom has no walls.
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
          We don't study the future. We visit the people already building it.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(360px,1fr))",
          gap: 34,
        }}
      >
        {EXPEDITIONS.map((trip) => (
          <article
            key={trip.city}
            style={{
              position: "relative",
              minHeight: 520,
              borderRadius: 34,
              overflow: "hidden",
              background:
                "linear-gradient(180deg,#f6f0e4 0%,#ded2bc 100%)",
              border: "1px solid rgba(184,138,59,.18)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at top right, rgba(184,138,59,.28), transparent 60%)",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: 38,
                background:
                  "linear-gradient(180deg, transparent, rgba(255,255,255,.92))",
              }}
            >
              <div
                style={{
                  color: "#a77d37",
                  textTransform: "uppercase",
                  letterSpacing: ".18em",
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                {trip.city}
              </div>

              <h3
                style={{
                  margin: 0,
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: 42,
                  fontWeight: 600,
                }}
              >
                {trip.title}
              </h3>

              <p
                style={{
                  marginTop: 20,
                  lineHeight: 1.8,
                  color: "#665b50",
                  fontSize: 18,
                }}
              >
                {trip.text}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}