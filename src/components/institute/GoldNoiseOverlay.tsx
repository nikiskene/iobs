// src/components/institute/GoldNoiseOverlay.tsx

export default function GoldNoiseOverlay() {
  return (
    <>
      <svg
        width="0"
        height="0"
        style={{ position: "absolute" }}
      >
        <filter id="ibs-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="saturate"
            values="0"
          />
        </filter>
      </svg>

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          opacity: 0.028,
          mixBlendMode: "multiply",
          background:
            "linear-gradient(180deg,#fff8ef,#f3e3c0,#fffaf4)",
          filter: "url(#ibs-noise)",
        }}
      />
    </>
  );
}