import React from "react";

/** Subtle radial dot-grid backdrop — always absolute-fills the parent. */
export const DotGrid: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "radial-gradient(rgba(235,231,220,0.035) 1px, transparent 1px)",
      backgroundSize: "36px 36px",
      pointerEvents: "none",
    }}
  />
);
