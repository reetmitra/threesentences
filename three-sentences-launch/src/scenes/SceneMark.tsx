/**
 * Scene 1 · 0–60 (comp) — "The mark arrives"
 * Sequence: from=0, durationInFrames=75
 * Local frame 0-60: main content. Local 60-75: exit fade.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { T, F } from "../tokens";
import { Mark } from "../components/Mark";

export const SceneMark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── Mark entrance (frames 0–18): scale 0.6→1.0, opacity 0→1 ── */
  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 100 },
  });
  const markScale = interpolate(entranceSpring, [0, 1], [0.6, 1.0]);
  const markOpacity = interpolate(entranceSpring, [0, 1], [0, 1]);

  /* ── Mark hover (frames 18+): sine oscillation ±8px at 0.5 Hz ── */
  const hoverBlend = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hoverY = 8 * Math.sin((frame * Math.PI) / fps) * hoverBlend;
  // Math.PI/fps at 30fps = 0.5 Hz → period = 2 s = 60 frames

  /* ── Eyebrow lines (frames 30+ and 44+) ── */
  const eyebrow1Opacity = interpolate(frame, [30, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eyebrow2Opacity = interpolate(frame, [44, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ── Scene exit (frames 60–75) ── */
  const sceneOpacity = interpolate(frame, [60, 75], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: T.paper,
        opacity: sceneOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
      }}
    >
      {/* Mark */}
      <div
        style={{
          opacity: markOpacity,
          transform: `translateY(${hoverY}px) scale(${markScale})`,
          transformOrigin: "center center",
        }}
      >
        <Mark size={320} />
      </div>

      {/* Eyebrow block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            opacity: eyebrow1Opacity,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 28,
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: T.ink,
          }}
        >
          Three Sentences
        </div>
        <div
          style={{
            opacity: eyebrow2Opacity,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: T.inkDim,
          }}
        >
          BY 363™
        </div>
      </div>
    </AbsoluteFill>
  );
};
