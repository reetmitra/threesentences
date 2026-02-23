import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

interface GrainOverlayProps {
  opacity?: number;
}

/**
 * Film grain overlay using SVG feTurbulence.
 * Shifts position each frame for subtle movement.
 * Rendered as the topmost layer across all scenes.
 */
export const GrainOverlay: React.FC<GrainOverlayProps> = ({
  opacity = 0.03,
}) => {
  const frame = useCurrentFrame();

  // Shift the noise pattern each frame for animation
  const offsetX = (frame * 0.7) % 200;
  const offsetY = (frame * 0.3) % 200;

  const svgNoise = `
    <svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/>
      </filter>
      <rect width='200' height='200' filter='url(#n)' opacity='1'/>
    </svg>
  `;

  const encodedSvg = `data:image/svg+xml;base64,${btoa(svgNoise)}`;

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${encodedSvg}")`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        backgroundRepeat: "repeat",
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};
