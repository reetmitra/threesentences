import React from "react";

export const Vignette: React.FC<{ strength?: number }> = ({
  strength = 0.08,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
      zIndex: 9998,
    }}
  />
);
