import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";

interface ClipRevealProps {
  startFrame: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  direction?: "up" | "down";
  /** Spring damping — higher = less bouncy */
  damping?: number;
}

/**
 * Clip-mask reveal: content slides up into view from behind a mask.
 * Uses spring physics for organic motion.
 */
export const ClipReveal: React.FC<ClipRevealProps> = ({
  startFrame,
  children,
  style,
  direction = "up",
  damping = 14,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { damping, stiffness: 120, mass: 0.8 },
  });

  const translateY = direction === "up"
    ? `translateY(${(1 - progress) * 100}%)`
    : `translateY(${(progress - 1) * 100}%)`;

  return (
    <div style={{ overflow: "hidden", ...style }}>
      <div
        style={{
          transform: translateY,
          opacity: progress,
        }}
      >
        {children}
      </div>
    </div>
  );
};
