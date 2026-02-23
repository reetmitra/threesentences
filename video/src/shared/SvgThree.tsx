import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { useScale } from "./tokens";

// ─── SVG path from BrandIntro.tsx ────────────────────────────────
const THREE_PATH = [
  "M 165 130",
  "L 340 130",
  "C 375 130, 395 155, 395 185",
  "C 395 230, 375 265, 340 280",
  "C 315 290, 285 295, 270 298",
  "C 310 305, 365 330, 390 370",
  "C 415 410, 420 450, 415 480",
  "C 410 530, 380 565, 340 580",
  "C 300 595, 255 595, 220 585",
  "C 190 575, 165 555, 150 530",
].join(" ");

const PATH_LENGTH = 1550;

interface SvgThreeProps {
  startFrame: number;
  /** How many frames the trace animation takes */
  traceDuration?: number;
  /** Size of the SVG viewport (scales with useScale) */
  size?: number;
  style?: React.CSSProperties;
}

/**
 * The "3" brand mark with stroke trace animation.
 * Draws itself from nothing, then holds with a subtle glow.
 */
export const SvgThree: React.FC<SvgThreeProps> = ({
  startFrame,
  traceDuration = 40,
  size = 300,
  style,
}) => {
  const frame = useCurrentFrame();
  const s = useScale();

  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;

  // Trace progress: 0 → 1
  const traceProgress = interpolate(
    elapsed,
    [0, traceDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const dashOffset = PATH_LENGTH * (1 - traceProgress);

  // Glow appears after trace completes
  const glowOpacity = interpolate(
    elapsed,
    [traceDuration, traceDuration + 15],
    [0, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Subtle glow pulse after fully drawn
  const glowPulse = elapsed > traceDuration
    ? Math.sin((elapsed - traceDuration) * 0.08) * 0.1 + 0.2
    : 0;

  const scaledSize = size * s;

  return (
    <div style={{ width: scaledSize, height: scaledSize, position: "relative", ...style }}>
      <svg
        viewBox="100 80 350 560"
        width={scaledSize}
        height={scaledSize}
        fill="none"
      >
        {/* Glow layer */}
        <path
          d={THREE_PATH}
          stroke="rgba(255,255,255,1)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={`drop-shadow(0 0 ${12 * s}px rgba(255,255,255,${glowOpacity + glowPulse}))`}
          strokeDasharray={PATH_LENGTH}
          strokeDashoffset={dashOffset}
          opacity={glowOpacity > 0 ? 1 : 0}
        />
        {/* Main stroke */}
        <path
          d={THREE_PATH}
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={PATH_LENGTH}
          strokeDashoffset={dashOffset}
        />
      </svg>
    </div>
  );
};
