import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { useScale } from "../shared/tokens";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "500", "700"],
  subsets: ["latin"],
});

const principles = [
  {
    num: "01",
    title: "Three Sentences",
    subtitle: "The Constraint",
    tagline: "Say only what matters.",
  },
  {
    num: "03",
    title: "No Edits",
    subtitle: "The Truth",
    tagline: "Write it. Leave it. Mean it.",
  },
  {
    num: "05",
    title: "Execute",
    subtitle: "The Action",
    tagline: "Stop planning. Start doing.",
  },
];

// Each principle gets ~30 frames (1 second): 10 in, 10 hold, 10 out
const FRAMES_PER = 30;

/**
 * Scene 6: "The Principles" (100 frames / ~3.3s)
 * Kinetic typography: 3 principles slide in alternating directions.
 */
export const S6_Principles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* Subtle background glow */}
      <div
        style={{
          position: "absolute",
          width: 1200 * s,
          height: 1200 * s,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {principles.map((p, i) => {
        const startFrame = 5 + i * FRAMES_PER;
        const endFrame = startFrame + FRAMES_PER;
        const midFrame = startFrame + FRAMES_PER / 2;

        // Determine if this principle should be visible
        if (frame < startFrame - 5 || frame > endFrame + 5) return null;

        // Entrance spring
        const enterProgress = spring({
          frame: Math.max(0, frame - startFrame),
          fps,
          config: { damping: 14, stiffness: 120 },
        });

        // Exit
        const exitProgress = interpolate(
          frame,
          [endFrame - 8, endFrame],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        // Alternate direction: even from left, odd from right
        const direction = i % 2 === 0 ? -1 : 1;
        const enterX = (1 - enterProgress) * 120 * s * direction;
        const exitX = exitProgress * -80 * s * direction;

        const opacity = enterProgress * (1 - exitProgress);

        // Decorative line between principles
        const lineProgress = interpolate(
          frame,
          [startFrame - 3, startFrame + 8],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <React.Fragment key={p.num}>
            {i > 0 && frame >= startFrame - 3 && frame < endFrame && (
              <div
                style={{
                  position: "absolute",
                  top: `calc(50% - ${80 * s}px)`,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: lineProgress * 100 * s,
                  height: 1 * s,
                  backgroundColor: "rgba(255,255,255,0.06)",
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                textAlign: "center",
                opacity,
                transform: `translateX(${enterX + exitX}px)`,
              }}
            >
              <span
                style={{
                  fontSize: 18 * s,
                  color: "rgba(255,255,255,0.15)",
                  fontWeight: 300,
                  display: "block",
                  marginBottom: 12 * s,
                }}
              >
                {p.num}
              </span>
              <h3
                style={{
                  fontSize: 72 * s,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {p.title}
              </h3>
              <span
                style={{
                  fontSize: 22 * s,
                  color: "rgba(255,255,255,0.25)",
                  fontWeight: 300,
                  display: "block",
                  marginTop: 8 * s,
                }}
              >
                {p.subtitle}
              </span>
              <p
                style={{
                  fontSize: 20 * s,
                  color: "rgba(255,255,255,0.2)",
                  fontWeight: 300,
                  marginTop: 16 * s,
                }}
              >
                {p.tagline}
              </p>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
