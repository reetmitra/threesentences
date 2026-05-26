import React from "react";

interface MarkProps {
  size?: number;
}

/** The Three Sentences brand mark — white rounded square, three black circles. */
export const Mark: React.FC<MarkProps> = ({ size = 200 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.22,
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: size / 8,
      flexShrink: 0,
    }}
  >
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          display: "block",
          width: (size / 9) * 2,
          height: (size / 9) * 2,
          borderRadius: "50%",
          background: "#0a0a0a",
        }}
      />
    ))}
  </div>
);
