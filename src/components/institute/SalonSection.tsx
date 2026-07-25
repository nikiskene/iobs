// src/components/institute/SalonSection.tsx

const SALONS = [
  {
    category: "Conversation",
    title: "Founders",
    description:
      "Private evenings with entrepreneurs building the next generation of companies.",
  },
  {
    category: "Dialogue",
    title: "Scientists",
    description:
      "Understand the discoveries reshaping society before they reach the headlines.",
  },
  {
    category: "Perspective",
    title: "Artists",
    description:
      "Creativity is often the earliest signal that the world is changing.",
  },
  {
    category: "Civilization",
    title: "Leaders",
    description:
      "Explore how governments, institutions and organizations prepare for the decades ahead.",
  },
];

export default function SalonSection() {
  return (
    <section
      style={{
        maxWidth: 1240,
        margin: "180px auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: 80,
          alignItems: "start",
          marginBottom: 60,
        }}
      >
        <div>
          <div
            style={{
              color: "#b58a3d",
              letterSpacing: ".35em",
              textTransform: "uppercase",
              fontSize: 13,
              marginBottom: 22,
            }}
          >
            The Salon
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
            Great ideas
            <br />
            deserve beautiful
            <br />
            conversations.
          </h2>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: 1.9,
            color: "#655b50",
            maxWidth: 620,
          }}
        >
          The Salon brings together curious minds across disciplines.
          No keynote stage. No panels. Just remarkable people asking
          remarkable questions in an atmosphere designed for deep
          conversation.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: 28,
        }}
      >
        {SALONS.map((item) => (
          <article
            key={item.title}
            style={{
              padding: 36,
              borderRadius: 30,
              background: "rgba(255,255,255,.5)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(184,138,59,.16)",
              minHeight: 260,
            }}
          >
            <div
              style={{
                color: "#b58a3d",
                textTransform: "uppercase",
                letterSpacing: ".18em",
                fontSize: 12,
                marginBottom: 18,
              }}
            >
              {item.category}
            </div>

            <h3
              style={{
                margin: 0,
                fontFamily: "Cormorant Garamond, serif",
                fontWeight: 600,
                fontSize: 40,
              }}
            >
              {item.title}
            </h3>

            <p
              style={{
                marginTop: 18,
                lineHeight: 1.8,
                color: "#655b50",
                fontSize: 18,
              }}
            >
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}