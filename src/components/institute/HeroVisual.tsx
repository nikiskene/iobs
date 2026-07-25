// src/components/institute/HeroVisual.tsx

export default function HeroVisual() {
  return (
    <section
      style={{
        maxWidth: 1280,
        margin: "110px auto 180px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 760,
          borderRadius: 42,
          overflow: "hidden",
          background:
            "linear-gradient(135deg,#efe4d1 0%,#fbf8f2 35%,#e3d5bc 100%)",
          border: "1px solid rgba(184,138,59,.16)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 72% 28%, rgba(181,138,61,.28), transparent 34%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 24% 78%, rgba(181,138,61,.16), transparent 42%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 70,
            border: "1px solid rgba(181,138,61,.12)",
            borderRadius: 30,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: 430,
            height: 430,
            borderRadius: "50%",
            border: "1px solid rgba(181,138,61,.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: "50%",
              border: "1px solid rgba(181,138,61,.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 170,
                height: 170,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,#b58a3d 0%,#8c6427 100%)",
                boxShadow:
                  "0 30px 80px rgba(181,138,61,.35)",
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 90,
            left: 90,
            maxWidth: 250,
          }}
        >
          <div
            style={{
              color: "#b58a3d",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              fontSize: 12,
            }}
          >
            Identity
          </div>

          <div
            style={{
              marginTop: 12,
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 40,
            }}
          >
            Become
            <br />
            someone.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 90,
            right: 90,
            maxWidth: 250,
            textAlign: "right",
          }}
        >
          <div
            style={{
              color: "#b58a3d",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              fontSize: 12,
            }}
          >
            Organizations
          </div>

          <div
            style={{
              marginTop: 12,
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 40,
            }}
          >
            Build
            <br />
            cultures.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 90,
            bottom: 90,
            maxWidth: 250,
          }}
        >
          <div
            style={{
              color: "#b58a3d",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              fontSize: 12,
            }}
          >
            Society
          </div>

          <div
            style={{
              marginTop: 12,
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 40,
            }}
          >
            Create
            <br />
            civilizations.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 90,
            bottom: 90,
            maxWidth: 250,
            textAlign: "right",
          }}
        >
          <div
            style={{
              color: "#b58a3d",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              fontSize: 12,
            }}
          >
            Beautiful Success
          </div>

          <div
            style={{
              marginTop: 12,
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 40,
            }}
          >
            Leave
            <br />
            an echo.
          </div>
        </div>
      </div>
    </section>
  );
}