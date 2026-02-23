import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { seededRandom } from "./helpers";

interface ParticleFieldProps {
  count?: number;
  opacity?: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  baseOpacity: number;
  pulseFreq: number;
  pulseOffset: number;
}

/**
 * Deterministic floating particle field for Remotion.
 * Pure CSS circles — no canvas — with positions computed from frame number.
 */
export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 40,
  opacity = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Generate particles once (deterministic from seed)
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: seededRandom(i * 7 + 1) * width,
      y: seededRandom(i * 7 + 2) * height,
      size: seededRandom(i * 7 + 3) * 3 + 1,
      speedY: -(seededRandom(i * 7 + 4) * 0.4 + 0.1),
      speedX: (seededRandom(i * 7 + 5) - 0.5) * 0.2,
      baseOpacity: seededRandom(i * 7 + 6) * 0.06 + 0.02,
      pulseFreq: seededRandom(i * 7 + 7) * 0.06 + 0.02,
      pulseOffset: seededRandom(i * 7 + 8) * Math.PI * 2,
    }));
  }, [count, width, height]);

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      {particles.map((p, i) => {
        // Deterministic position based on frame
        const currentY = ((p.y + frame * p.speedY) % (height + 20) + height + 20) % (height + 20) - 10;
        const currentX = p.x + Math.sin(frame * 0.01 + i) * 30 + frame * p.speedX;

        // Pulse opacity
        const pulse = Math.sin(frame * p.pulseFreq + p.pulseOffset) * 0.5 + 0.5;
        const alpha = p.baseOpacity * (0.5 + pulse * 0.5);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: currentX,
              top: currentY,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: `rgba(255, 255, 255, ${alpha})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
