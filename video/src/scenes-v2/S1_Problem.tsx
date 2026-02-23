import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { ClipReveal } from "../shared/ClipReveal";
import { useScale } from "../shared/tokens";
import { fo, blurOut } from "../shared/helpers";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "500"],
  subsets: ["latin"],
});

const lines = [
  { text: "You\u2019ve tried journaling before.", opacity: 0.35, weight: "300" as const },
  { text: "You bought the notebook.", opacity: 0.35, weight: "300" as const },
  { text: "You wrote for three days.", opacity: 0.4, weight: "300" as const },
  { text: "Then you stopped.", opacity: 0.7, weight: "500" as const, large: true },
];

/**
 * Scene 1: "The Problem" (90 frames / 3s)
 * Pure black. Kinetic typography with clip-reveal + scale entrance.
 * Each line breathes into view with spring physics.
 * Final line hits harder with a dramatic pause and glow.
 * Exit: blur dissolve.
 */
export const S1_Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();

  // Scene exit: blur + fade out
  const exitOpacity = fo(frame, 78, 12);
  const exitBlur = blurOut(frame, 78, 12);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        opacity: exitOpacity,
        filter: exitBlur,
      }}
    >
      {/* Subtle background glow that builds with the last line */}
      <div
        style={{
          position: "absolute",
          width: 1200 * s,
          height: 600 * s,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
          opacity: interpolate(frame, [42, 58], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14 * s,
        }}
      >
        {lines.map((line, i) => {
          // Stagger: 16 frames apart, last line has a dramatic pause
          const startFrame = i < 3 ? i * 16 : 52;
          const fontSize = line.large ? 88 * s : 60 * s;

          // Subtle scale animation (0.97 -> 1.0) for organic feel
          const scaleSpring = spring({
            frame: Math.max(0, frame - startFrame),
            fps,
            config: { damping: 20, stiffness: 100, mass: 1.2 },
          });
          const lineScale = 0.97 + scaleSpring * 0.03;

          // Subtle letter-spacing animation for the final line
          const letterSpacing = line.large
            ? interpolate(
                frame,
                [startFrame, startFrame + 25],
                [0.04, -0.02],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )
            : -0.02;

          return (
            <ClipReveal key={i} startFrame={startFrame} damping={18}>
              <p
                style={{
                  fontSize,
                  fontWeight: line.weight,
                  color: `rgba(255, 255, 255, ${line.opacity})`,
                  letterSpacing: `${letterSpacing}em`,
                  margin: 0,
                  textAlign: "center",
                  lineHeight: 1.3,
                  transform: `scale(${lineScale})`,
                }}
              >
                {line.text}
              </p>
            </ClipReveal>
          );
        })}
      </div>

      {/* Thin decorative line beneath text, fades in with final line */}
      <div
        style={{
          position: "absolute",
          bottom: "32%",
          width: interpolate(frame, [56, 72], [0, 120 * s], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          height: 0.5 * s,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
        }}
      />
    </AbsoluteFill>
  );
};
