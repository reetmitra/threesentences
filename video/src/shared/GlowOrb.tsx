import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface GlowOrbProps {
  x: string;
  y: string;
  size: number;
  color?: string;
  startFrame?: number;
}

/**
 * Soft radial gradient orb that pulses gently.
 * Creates ambient depth and fills dead space.
 */
export const GlowOrb: React.FC<GlowOrbProps> = ({
  x,
  y,
  size,
  color = "255, 255, 255",
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [startFrame, startFrame + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gentle sine-based scale oscillation
  const scale = 1 + Math.sin(frame * 0.03) * 0.12;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) scale(${scale})`,
        background: `radial-gradient(circle, rgba(${color}, 0.06) 0%, rgba(${color}, 0.02) 40%, transparent 70%)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};
