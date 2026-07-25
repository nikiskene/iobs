// src/components/institute/MembershipSection.tsx

const BENEFITS = [
  "Unlimited access to the Digital Library",
  "Weekly Identity Engine Briefing",
  "Invitations to private Salons",
  "Priority access to Expeditions",
  "Member directory of global Explorers",
  "Exclusive essays and research",
];

export default function MembershipSection() {
  return (
    <section
      style={{
        maxWidth: 1240,
        margin: "200px auto",
      }}
    >
      <div
        style={{
          borderRadius: 42,
          padding: "80px 70px",
          background:
            "linear-gradient(180deg, rgba(255,255,255,.72), rgba(247,240,227,.88))",
          border: "1px solid rgba(184,138,59,.18)",
          backdropFilter: "blur(24px)",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            textAlign: "center",
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
            Membership
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
            Become part of
            <br />
            the conversation.
          </h2>

          <p
            style={{
              margin: "36px auto 0",
              fontSize: 22,
              lineHeight: 1.9,
              color: "#655b50",
            }}
          >
            Membership is for people who believe curiosity is not a hobby,
            but a way of navigating the future.
          </p>
        </div>

        <div
          style={{
            marginTop: 70,
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(320px,1fr))",
            gap: 22,
          }}
        >
          {BENEFITS.map((benefit) => (
            <div
              key={benefit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "22px 26px",
                borderRadius: 20,
                background: "rgba(255,255,255,.58)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#b58a3d",
                  flexShrink: 0,
                }}
              />

              <span
                style={{
                  fontSize: 18,
                  color: "#655b50",
                }}
              >
                {benefit}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 60,
          }}
        >
          <button
            style={{
              border: "none",
              borderRadius: 999,
              padding: "18px 38px",
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
        </div>
      </div>
    </section>
  );
}