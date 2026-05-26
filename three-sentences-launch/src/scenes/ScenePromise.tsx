/**
 * Scene 4 · 210–270 (comp) — "The promise"
 * Sequence: from=208, durationInFrames=72
 * Local 0-12: bg fades in. Local 12-27: line 1. Local 27-42: line 2.
 * Local 60-72: scene exits.
 *
 * Faint "363" serif watermark behind the text.
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

export const ScenePromise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── Background fade-in (local 0–12) ── */
  const bgOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ── Line 1 "You cannot be perfect." (local 12–27) ── */
  const line1Spring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 100 },
  });
  const line1Opacity = interpolate(line1Spring, [0, 1], [0, 1]);
  const line1Y = interpolate(line1Spring, [0, 1], [16, 0]);

  /* ── Line 2 "But you can be relentless." (local 27–42) ── */
  const line2Spring = spring({
    frame: frame - 27,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 100 },
  });
  const line2Opacity = interpolate(line2Spring, [0, 1], [0, 1]);
  const line2Y = interpolate(line2Spring, [0, 1], [16, 0]);

  /* ── Scene exit (local 60–72) ── */
  const exitOpacity = interpolate(frame, [60, 72], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: T.paper,
        opacity: bgOpacity * exitOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      {/* Faint "363" watermark */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: F.serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 720,
          color: T.ink,
          opacity: 0.04,
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        363
      </div>

      {/* Text lines */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          position: "relative",
          pointerEvents: "none",
        }}
      >
        {/* Line 1 — dim */}
        <div
          style={{
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 84,
            letterSpacing: "-1.4px",
            lineHeight: 1.1,
            color: T.inkDim,
            textAlign: "center",
            textWrap: "balance" as React.CSSProperties["textWrap"],
          }}
        >
          You cannot be perfect.
        </div>

        {/* Line 2 — bright */}
        <div
          style={{
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px)`,
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 84,
            letterSpacing: "-1.4px",
            lineHeight: 1.1,
            color: T.ink,
            textAlign: "center",
            textWrap: "balance" as React.CSSProperties["textWrap"],
          }}
        >
          But you can be relentless.
        </div>
      </div>
    </AbsoluteFill>
  );
};
