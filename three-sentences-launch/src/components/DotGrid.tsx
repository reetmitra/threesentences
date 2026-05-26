import React from "react";

interface DotGridProps {
  opacity?: number;  // default 0.025
  cell?: number;     // grid cell size in px, default 28
}

/** Subtle radial dot-grid backdrop — always absolute-fills the parent. */
export const DotGrid: React.FC<DotGridProps> = ({
  opacity = 0.025,
  cell = 28,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `radial-gradient(rgba(235,231,220,${opacity}) 1px, transparent 1px)`,
      backgroundSize: `${cell}px ${cell}px`,
      pointerEvents: "none",
    }}
  />
);
