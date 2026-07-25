// src/components/institute/WorldMapSection.tsx

export default function WorldMapSection() {
  return (
    <section
      style={{
        maxWidth: 1280,
        margin: "220px auto",
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
          Global Community
        </div>

        <h2
          style={{
            margin: 0,
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 500,
            fontSize: "clamp(58px,6vw,94px)",
            lineHeight: .95,
          }}
        >
          Curious people.
          <br />
          Everywhere.
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
          The Institute is becoming a worldwide network of explorers,
          founders, artists, scientists and leaders connected by one
          shared question: What should we build next?
        </p>
      </div>

      <div
        style={{
          position: "relative",
          height: 620,
          borderRadius: 36,
          overflow: "hidden",
          background:
            "radial-gradient(circle at center, rgba(255,255,255,.95), rgba(244,237,225,.88))",
          border: "1px solid rgba(184,138,59,.18)",
        }}
      >
        {/* World map placeholder */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: .18,
            backgroundImage:
              "url('/images/world-map-light.svg')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "88%",
          }}
        />

        {[
          { left: "18%", top: "34%" },
          { left: "28%", top: "27%" },
          { left: "46%", top: "31%" },
          { left: "51%", top: "42%" },
          { left: "62%", top: "30%" },
          { left: "70%", top: "37%" },
          { left: "79%", top: "63%" },
          { left: "84%", top: "41%" },
        ].map((pin, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: pin.left,
              top: pin.top,
              width: 16,
              height: 16,
              marginLeft: -8,
              marginTop: -8,
              borderRadius: "50%",
              background: "#b58a3d",
              boxShadow:
                "0 0 0 8px rgba(181,138,61,.12)",
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: 32,
            padding: "16px 22px",
            borderRadius: 18,
            background: "rgba(255,255,255,.82)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontFamily: "Cormorant Garamond, serif",
              color: "#a77d37",
            }}
          >
            40+
          </div>

          <div
            style={{
              color: "#655b50",
              fontSize: 16,
            }}
          >
            countries represented
          </div>
        </div>
      </div>
    </section>
  );
}