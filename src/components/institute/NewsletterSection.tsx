// src/components/institute/NewsletterSection.tsx

export default function NewsletterSection() {
  return (
    <section
      style={{
        maxWidth: 980,
        margin: "180px auto",
        textAlign: "center",
      }}
    >
      <div
        style={{
          padding: "72px 60px",
          borderRadius: 36,
          background: "rgba(255,255,255,.55)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(184,138,59,.18)",
        }}
      >
        <div
          style={{
            color: "#b58a3d",
            fontSize: 13,
            letterSpacing: ".35em",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          Weekly Letter
        </div>

        <h2
          style={{
            margin: 0,
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 500,
            fontSize: "clamp(54px,6vw,88px)",
            lineHeight: 0.95,
          }}
        >
          One thoughtful email.
          <br />
          Every week.
        </h2>

        <p
          style={{
            maxWidth: 700,
            margin: "34px auto 0",
            fontSize: 22,
            lineHeight: 1.85,
            color: "#655b50",
          }}
        >
          No AI hype. No productivity tricks. Just one carefully curated
          perspective about where the world is heading—and why it matters.
        </p>

        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 44,
          }}
        >
          <input
            type="email"
            placeholder="Your email"
            style={{
              width: 360,
              maxWidth: "100%",
              padding: "18px 22px",
              borderRadius: 999,
              border: "1px solid rgba(184,138,59,.22)",
              background: "#fff",
              fontSize: 17,
              outline: "none",
            }}
          />

          <button
            style={{
              padding: "18px 34px",
              borderRadius: 999,
              border: "none",
              background: "#b58a3d",
              color: "#fff",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: ".08em",
              fontSize: 15,
            }}
          >
            Subscribe
          </button>
        </div>

        <div
          style={{
            marginTop: 22,
            color: "#8a7d70",
            fontSize: 14,
          }}
        >
          One email per week. Unsubscribe anytime.
        </div>
      </div>
    </section>
  );
}