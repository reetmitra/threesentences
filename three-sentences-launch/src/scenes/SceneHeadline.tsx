/**
 * Scene 2 · 60–135 (comp) — "The headline"
 * Sequence: from=60, durationInFrames=90
 * Local 0-15: bg fades in + mark springs to top-third.
 * Local 15-90: headline lines + mono meta appear.
 * Local 75-90: scene exits.
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

export const SceneHeadline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── Background fade-in (frames 0–12) ── */
  const bgOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ── Mark: spring to top-third (frames 0–20) ── */
  // From center (translateY 0) to ~680px above center → top ≈ 280px
  const markSpring = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 100 },
    durationInFrames: 20,
  });
  const markOffsetY = interpolate(markSpring, [0, 1], [0, -660]);
  const markScale = interpolate(markSpring, [0, 1], [1.0, 0.4]);

  /* ── Headline line 1 "Three." (frames 15–33) ── */
  const line1Spring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 100 },
  });
  const line1Opacity = interpolate(line1Spring, [0, 1], [0, 1]);
  const line1Y = interpolate(line1Spring, [0, 1], [24, 0]);

  /* ── Headline line 2 "Sentences." (frames 30–50) ── */
  const line2Spring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 100 },
  });
  const line2Opacity = interpolate(line2Spring, [0, 1], [0, 1]);
  const line2Y = interpolate(line2Spring, [0, 1], [24, 0]);

  /* ── Mono meta (frames 50–68) ── */
  const metaOpacity = interpolate(frame, [50, 68], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ── Scene exit (frames 75–90) ── */
  const exitOpacity = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: T.paper,
        opacity: bgOpacity * exitOpacity,
      }}
    >
      {/* Mark — centered, then springs to top-third */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${markOffsetY}px) scale(${markScale})`,
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
      >
        <Mark size={320} />
      </div>

      {/* Headline + meta — centered below mark */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          bottom: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 340, // clears the mark at top
          paddingLeft: 60,
          paddingRight: 60,
          pointerEvents: "none",
        }}
      >
        {/* Giant italic headline */}
        <div
          style={{
            width: "100%",
            textAlign: "center",
          }}
        >
          {/* Line 1 */}
          <div
            style={{
              opacity: line1Opacity,
              transform: `translateY(${line1Y}px)`,
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 180,
              letterSpacing: "-6px",
              lineHeight: 0.95,
              color: T.ink,
              textWrap: "balance" as React.CSSProperties["textWrap"],
              display: "block",
            }}
          >
            Three.
          </div>

          {/* Line 2 */}
          <div
            style={{
              opacity: line2Opacity,
              transform: `translateY(${line2Y}px)`,
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 180,
              letterSpacing: "-6px",
              lineHeight: 0.95,
              color: T.ink,
              textWrap: "balance" as React.CSSProperties["textWrap"],
              display: "block",
            }}
          >
            Sentences.
          </div>
        </div>

        {/* Mono meta line */}
        <div
          style={{
            opacity: metaOpacity,
            marginTop: 48,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 24,
            letterSpacing: "4.8px",
            textTransform: "uppercase",
            color: T.inkDim,
          }}
        >
          BE BETTER. DO BETTER.
        </div>
      </div>
    </AbsoluteFill>
  );
};
