// src/components/institute/SpeakersSection.tsx

const SPEAKERS = [
  {
    role: "Future",
    title: "Keynotes",
    text:
      "Provocations that challenge assumptions and help organizations see the future with greater clarity.",
  },
  {
    role: "Leadership",
    title: "Speaker Coaching",
    text:
      "Helping founders, executives and thought leaders turn expertise into unforgettable talks.",
  },
  {
    role: "Transformation",
    title: "Workshops",
    text:
      "Interactive experiences that translate ideas into practical shifts for teams and organizations.",
  },
];

export default function SpeakersSection() {
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
          marginBottom: 72,
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
          Speaking
        </div>

        <h2
          style={{
            margin: 0,
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 500,
            fontSize: "clamp(56px,6vw,92px)",
            lineHeight: 0.95,
          }}
        >
          Ideas only matter
          <br />
          when they move people.
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
          Talks, coaching and immersive experiences designed to create
          clarity, curiosity and meaningful action.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(340px,1fr))",
          gap: 32,
        }}
      >
        {SPEAKERS.map((item) => (
          <article
            key={item.title}
            style={{
              padding: 40,
              borderRadius: 32,
              background: "rgba(255,255,255,.48)",
              backdropFilter: "blur(22px)",
              border: "1px solid rgba(184,138,59,.18)",
            }}
          >
            <div
              style={{
                color: "#b58a3d",
                textTransform: "uppercase",
                letterSpacing: ".2em",
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              {item.role}
            </div>

            <h3
              style={{
                margin: 0,
                fontFamily: "Cormorant Garamond, serif",
                fontWeight: 600,
                fontSize: 42,
              }}
            >
              {item.title}
            </h3>

            <p
              style={{
                marginTop: 20,
                fontSize: 18,
                lineHeight: 1.8,
                color: "#655b50",
              }}
            >
              {item.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}