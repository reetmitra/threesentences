import React from "react";
import { useCurrentFrame } from "remotion";

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.015 }) => {
  const frame = useCurrentFrame();
  const seed = frame % 50;

  return (
    <>
      <svg
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter id="grain-filter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              seed={seed}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: "url(#grain-filter)",
          opacity,
          mixBlendMode: "overlay",
          background: "#888888",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
    </>
  );
};
