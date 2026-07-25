// src/components/institute/PhilosophyTimeline.tsx

const STEPS = [
  {
    number: "01",
    title: "Curiosity",
    text:
      "Every meaningful transformation starts with a better question.",
  },
  {
    number: "02",
    title: "Clarity",
    text:
      "Understanding what the world is becoming creates strategic advantage.",
  },
  {
    number: "03",
    title: "Identity",
    text:
      "The future belongs to people and organizations that know who they are becoming.",
  },
  {
    number: "04",
    title: "Beautiful Success",
    text:
      "Success is measured by the possibility you create for others.",
  },
];

export default function PhilosophyTimeline() {
  return (
    <section
      style={{
        maxWidth: 1180,
        margin: "220px auto",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: 80,
        }}
      >
        <div
          style={{
            color: "#b58a3d",
            fontSize: 13,
            letterSpacing: ".35em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Philosophy
        </div>

        <h2
          style={{
            margin: 0,
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 500,
            fontSize: "clamp(58px,6vw,96px)",
            lineHeight: 0.95,
          }}
        >
          Four ideas.
          <br />
          One direction.
        </h2>
      </div>

      <div
        style={{
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 38,
            top: 40,
            bottom: 40,
            width: 1,
            background: "rgba(184,138,59,.22)",
          }}
        />

        {STEPS.map((step) => (
          <div
            key={step.number}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr",
              gap: 34,
              marginBottom: 60,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: "#fff",
                border: "1px solid rgba(184,138,59,.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 28,
                color: "#a77d37",
                zIndex: 1,
              }}
            >
              {step.number}
            </div>

            <div
              style={{
                paddingTop: 8,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: "Cormorant Garamond, serif",
                  fontWeight: 600,
                  fontSize: 42,
                }}
              >
                {step.title}
              </h3>

              <p
                style={{
                  marginTop: 16,
                  maxWidth: 720,
                  fontSize: 20,
                  lineHeight: 1.9,
                  color: "#655b50",
                }}
              >
                {step.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}