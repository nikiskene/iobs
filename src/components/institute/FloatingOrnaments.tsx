// src/components/institute/FloatingOrnaments.tsx

export default function FloatingOrnaments() {
  const ornaments = [
    {
      left: "12%",
      top: "18%",
      size: 70,
      rotate: -18,
    },
    {
      right: "10%",
      top: "24%",
      size: 90,
      rotate: 24,
    },
    {
      left: "18%",
      bottom: "16%",
      size: 80,
      rotate: 12,
    },
    {
      right: "16%",
      bottom: "22%",
      size: 64,
      rotate: -26,
    },
  ];

  return (
    <>
      {ornaments.map((item, index) => (
        <div
          key={index}
          style={{
            position: "fixed",
            ...item,
            opacity: 0.08,
            pointerEvents: "none",
            zIndex: 1,
            transform: `rotate(${item.rotate}deg)`,
          }}
        >
          <svg
            width={item.size}
            height={item.size}
            viewBox="0 0 100 100"
            fill="none"
          >
            <path
              d="M50 8
                 C57 28 72 43 92 50
                 C72 57 57 72 50 92
                 C43 72 28 57 8 50
                 C28 43 43 28 50 8Z"
              stroke="#b58a3d"
              strokeWidth="1.4"
            />

            <circle
              cx="50"
              cy="50"
              r="5"
              fill="#b58a3d"
            />

            <path
              d="M50 22
                 C53 34 66 47 78 50
                 C66 53 53 66 50 78
                 C47 66 34 53 22 50
                 C34 47 47 34 50 22Z"
              fill="#b58a3d"
              opacity=".22"
            />
          </svg>
        </div>
      ))}
    </>
  );
}