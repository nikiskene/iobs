// src/components/institute/SectionDivider.tsx

export default function SectionDivider() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        margin: '140px auto',
        maxWidth: 900,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background:
            'linear-gradient(to right, transparent, rgba(184,138,59,.35))',
        }}
      />

      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
      >
        <circle
          cx="36"
          cy="36"
          r="32"
          stroke="rgba(184,138,59,.35)"
          strokeWidth="1"
        />

        <path
          d="M36 15
             C40 27 45 32 57 36
             C45 40 40 45 36 57
             C32 45 27 40 15 36
             C27 32 32 27 36 15Z"
          fill="#b88a3b"
          opacity=".85"
        />

        <circle
          cx="36"
          cy="36"
          r="4"
          fill="#ffffff"
        />
      </svg>

      <div
        style={{
          flex: 1,
          height: 1,
          background:
            'linear-gradient(to left, transparent, rgba(184,138,59,.35))',
        }}
      />
    </div>
  );
}