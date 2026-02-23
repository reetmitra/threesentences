import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { TextScramble } from "../shared/TextScramble";
import { useScale } from "../shared/tokens";
import { fi, fo, blurIn } from "../shared/helpers";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "700"],
  subsets: ["latin"],
});

/**
 * Scene 2: "The Constraint" (frames 0-112 within its Sequence)
 * Text scramble reveal of "Three sentences." + supporting text.
 * Exit: main text scales down for morphing transition to Scene 3.
 */
export const S2_Constraint: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();

  // ─── Decorative line (draws from center outward) ─────────────
  const lineWidth = interpolate(frame, [0, 25], [0, 200 * s], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── "Three sentences." scramble starts at frame 5 ───────────
  const scrambleOpacity = fi(frame, 0, 10);

  // ─── "No more. No less." fades up ────────────────────────────
  const subProgress = spring({
    frame: Math.max(0, frame - 40),
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  // ─── "Constraint breeds creativity." blur focus pull ─────────
  const philosophyOpacity = fi(frame, 60, 18);
  const philosophyBlur = blurIn(frame, 60, 18, 8);
  const philosophyY = interpolate(frame, [60, 78], [15 * s, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── Exit: scale down + fade ─────────────────────────────────
  const exitScale = interpolate(frame, [95, 112], [1, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = fo(frame, 95, 17);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      {/* Decorative line */}
      <div
        style={{
          width: lineWidth,
          height: 1 * s,
          backgroundColor: "rgba(255,255,255,0.1)",
          marginBottom: 40 * s,
        }}
      />

      {/* Main scramble text */}
      <div style={{ opacity: scrambleOpacity }}>
        <TextScramble
          text="Three sentences."
          startFrame={5}
          duration={30}
          style={{
            fontSize: 160 * s,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.03em",
            display: "block",
            textAlign: "center",
          }}
        />
      </div>

      {/* "No more. No less." */}
      <p
        style={{
          fontSize: 42 * s,
          fontWeight: 300,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.08em",
          marginTop: 16 * s,
          opacity: subProgress,
          transform: `translateY(${(1 - subProgress) * 12 * s}px)`,
        }}
      >
        No more. No less.
      </p>

      {/* "Constraint breeds creativity." */}
      <p
        style={{
          fontSize: 28 * s,
          fontWeight: 300,
          color: "rgba(255,255,255,0.2)",
          marginTop: 50 * s,
          opacity: philosophyOpacity,
          filter: philosophyBlur,
          transform: `translateY(${philosophyY}px)`,
        }}
      >
        Constraint breeds creativity.
      </p>
    </AbsoluteFill>
  );
};
