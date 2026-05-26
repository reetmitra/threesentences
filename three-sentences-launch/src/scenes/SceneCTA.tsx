/**
 * Scene 5 · 270–300 (comp) — "The call"
 * Sequence: from=265, durationInFrames=35
 * Local 0-10: bg fades in. Mark springs. Copy fades.
 * Hold to end — no fade-to-black (loop-friendly for Reels).
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

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── Background fade-in (local 0–10) ── */
  const bgOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ── Mark spring (local 0–20) ── */
  const markSpring = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 100 },
    durationInFrames: 20,
  });
  const markOpacity = interpolate(markSpring, [0, 1], [0, 1]);
  const markScale = interpolate(markSpring, [0, 1], [0.7, 1.0]);

  /* ── "Start with today." (local 8–22) ── */
  const taglineSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 100 },
  });
  const taglineOpacity = interpolate(taglineSpring, [0, 1], [0, 1]);
  const taglineY = interpolate(taglineSpring, [0, 1], [18, 0]);

  /* ── Meta line (local 18–30) ── */
  const metaOpacity = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: T.paper,
        opacity: bgOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      {/* Mark */}
      <div
        style={{
          opacity: markOpacity,
          transform: `scale(${markScale})`,
          transformOrigin: "center center",
        }}
      >
        <Mark size={140} />
      </div>

      {/* Tagline + meta */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          paddingLeft: 60,
          paddingRight: 60,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 96,
            letterSpacing: "-1px",
            lineHeight: 1.05,
            color: T.ink,
            textAlign: "center",
            textWrap: "balance" as React.CSSProperties["textWrap"],
          }}
        >
          Start with today.
        </div>

        <div
          style={{
            opacity: metaOpacity,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: "3.6px",
            textTransform: "uppercase",
            color: T.inkDim,
            textAlign: "center",
          }}
        >
          INVITE ONLY · iOS · Q4 2026
        </div>
      </div>
    </AbsoluteFill>
  );
};
