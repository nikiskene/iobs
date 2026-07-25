// src/components/institute/TestimonialSection.tsx

const TESTIMONIALS = [
  {
    quote:
      "I didn't come back with answers. I came back asking dramatically better questions.",
    author: "CEO",
  },
  {
    quote:
      "The tour completely changed how our leadership team thinks about AI and the future.",
    author: "Managing Director",
  },
  {
    quote:
      "The conversations were worth more than months of reading reports.",
    author: "Founder",
  },
];

export default function TestimonialSection() {
  return (
    <section
      style={{
        maxWidth: 1220,
        margin: "200px auto",
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
          Voices
        </div>

        <h2
          style={{
            margin: 0,
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 500,
            fontSize: "clamp(58px,6vw,94px)",
            lineHeight: 0.95,
          }}
        >
          The best ideas
          <br />
          continue after
          <br />
          the journey.
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(340px,1fr))",
          gap: 32,
        }}
      >
        {TESTIMONIALS.map((item) => (
          <article
            key={item.quote}
            style={{
              padding: 42,
              borderRadius: 34,
              background: "rgba(255,255,255,.55)",
              backdropFilter: "blur(22px)",
              border: "1px solid rgba(184,138,59,.16)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 320,
            }}
          >
            <blockquote
              style={{
                margin: 0,
                fontFamily: "Cormorant Garamond, serif",
                fontStyle: "italic",
                fontSize: 34,
                lineHeight: 1.35,
                color: "#7a6132",
              }}
            >
              “{item.quote}”
            </blockquote>

            <div
              style={{
                marginTop: 36,
                color: "#a77d37",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                fontSize: 13,
              }}
            >
              {item.author}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}