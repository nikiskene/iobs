// src/components/institute/FinalCallToAction.tsx

export default function FinalCallToAction() {
  return (
    <section
      style={{
        maxWidth: 1180,
        margin: "220px auto 120px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          padding: "110px 70px",
          borderRadius: 44,
          background:
            "linear-gradient(180deg, rgba(255,255,255,.82), rgba(244,236,222,.94))",
          border: "1px solid rgba(184,138,59,.18)",
          backdropFilter: "blur(28px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            right: -180,
            top: -180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(184,138,59,.18), transparent 72%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              color: "#b58a3d",
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: ".35em",
              marginBottom: 24,
            }}
          >
            One Question
          </div>

          <h2
            style={{
              margin: 0,
              fontFamily: "Cormorant Garamond, serif",
              fontWeight: 500,
              fontSize: "clamp(64px,7vw,110px)",
              lineHeight: 0.92,
            }}
          >
            If you could build
            <br />
            anything in the world,
            <br />
            what would it be?
          </h2>

          <p
            style={{
              maxWidth: 760,
              margin: "42px auto 0",
              fontSize: 23,
              lineHeight: 1.9,
              color: "#665b50",
            }}
          >
            That question has started companies, expeditions,
            friendships, movements and civilizations.
            It might also be the beginning of yours.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 22,
              flexWrap: "wrap",
              marginTop: 56,
            }}
          >
            <button
              style={{
                border: "none",
                borderRadius: 999,
                padding: "20px 40px",
                background: "#b58a3d",
                color: "#fff",
                fontSize: 16,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Join the Institute
            </button>

            <button
              style={{
                borderRadius: 999,
                padding: "20px 40px",
                background: "transparent",
                border: "1px solid rgba(184,138,59,.35)",
                color: "#7d6332",
                fontSize: 16,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Explore the World
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}