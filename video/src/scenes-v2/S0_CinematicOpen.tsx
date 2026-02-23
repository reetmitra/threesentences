import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { useScale } from "../shared/tokens";
import { seededRandom } from "../shared/helpers";

const { fontFamily } = loadFont("normal", {
  weights: ["200", "300"],
  subsets: ["latin"],
});

// ─── Rising ember particles (deterministic) ──────────────────────
interface Ember {
  x: number;
  startY: number;
  speed: number;
  size: number;
  opacity: number;
  delay: number;
  drift: number;
}

const EMBER_COUNT = 30;

/**
 * Scene 0: "Cinematic Open" (80 frames / ~2.7s)
 *
 * Pure atmosphere. Builds from absolute darkness:
 *   - Central glow blooms from nothing
 *   - A thin horizon line expands from center
 *   - Ember particles rise like sparks
 *   - A massive "3" watermark breathes in the background
 *   - Text whisper: "What if you could only say three things?"
 *   - Everything dissolves with blur into Scene 1
 */
export const S0_CinematicOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = useScale();

  // Generate embers once
  const embers: Ember[] = useMemo(() => {
    return Array.from({ length: EMBER_COUNT }, (_, i) => ({
      x: seededRandom(i * 11 + 1) * 100,
      startY: 75 + seededRandom(i * 11 + 2) * 25,
      speed: 0.2 + seededRandom(i * 11 + 3) * 0.35,
      size: 1.5 + seededRandom(i * 11 + 4) * 3,
      opacity: 0.08 + seededRandom(i * 11 + 5) * 0.25,
      delay: seededRandom(i * 11 + 6) * 25,
      drift: (seededRandom(i * 11 + 7) - 0.5) * 0.15,
    }));
  }, []);

  // ─── Central glow (blooms from nothing) ────────────────────────
  const glowScale = interpolate(frame, [3, 50], [0.2, 1.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glowOpacity = interpolate(frame, [3, 20, 60, 80], [0, 0.08, 0.08, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── Horizon light line ────────────────────────────────────────
  const lineWidth = interpolate(frame, [5, 40], [0, 800 * s], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineOpacity = interpolate(
    frame,
    [5, 18, 58, 75],
    [0, 0.5, 0.5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const lineHeight = interpolate(frame, [5, 25], [0.5 * s, 1 * s], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── Large "3" watermark ───────────────────────────────────────
  const threeOpacity = interpolate(
    frame,
    [12, 35, 58, 78],
    [0, 0.035, 0.035, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const threeScale = interpolate(frame, [12, 78], [0.92, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── Text: "What if you could only say three things?" ──────────
  const textSpring = spring({
    frame: Math.max(0, frame - 28),
    fps,
    config: { damping: 22, stiffness: 60, mass: 1.4 },
  });
  const textOpacity = interpolate(
    frame,
    [28, 42, 62, 78],
    [0, 0.65, 0.65, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const textY = (1 - textSpring) * 35 * s;

  // ─── Secondary vertical lines (cinematic framing) ──────────────
  const vLineHeight = interpolate(frame, [10, 45], [0, 300 * s], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vLineOpacity = interpolate(
    frame,
    [10, 25, 55, 75],
    [0, 0.06, 0.06, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ─── Exit blur ─────────────────────────────────────────────────
  const exitBlur = interpolate(frame, [65, 80], [0, 12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        filter: `blur(${exitBlur}px)`,
      }}
    >
      {/* Central glow orb */}
      <div
        style={{
          position: "absolute",
          width: 1600 * s,
          height: 1600 * s,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 25%, transparent 65%)",
          transform: `scale(${glowScale})`,
          opacity: glowOpacity,
        }}
      />

      {/* Secondary warm glow (offset) */}
      <div
        style={{
          position: "absolute",
          width: 1000 * s,
          height: 600 * s,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)",
          transform: `translateY(${-60 * s}px) scale(${glowScale * 0.8})`,
          opacity: glowOpacity * 0.6,
        }}
      />

      {/* Horizon light line */}
      <div
        style={{
          position: "absolute",
          width: lineWidth,
          height: lineHeight,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 70%, transparent 100%)",
          opacity: lineOpacity,
        }}
      />

      {/* Vertical framing lines */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0.5 * s,
          height: vLineHeight,
          background:
            "linear-gradient(180deg, transparent, rgba(255,255,255,0.4), transparent)",
          opacity: vLineOpacity,
          top: `calc(50% - ${vLineHeight / 2}px)`,
        }}
      />

      {/* Large "3" watermark */}
      <div
        style={{
          position: "absolute",
          fontSize: 900 * s,
          fontWeight: 200,
          color: "white",
          opacity: threeOpacity,
          transform: `scale(${threeScale})`,
          lineHeight: 0.85,
          letterSpacing: "-0.05em",
          userSelect: "none",
        }}
      >
        3
      </div>

      {/* Rising ember particles */}
      {embers.map((ember, i) => {
        const emberFrame = frame - ember.delay;
        if (emberFrame < 0) return null;

        const y = ember.startY - emberFrame * ember.speed;
        if (y < -5) return null;

        const driftX = Math.sin(emberFrame * 0.05 + i) * 2;

        const emberOpacity = interpolate(
          emberFrame,
          [0, 10, 35, 50],
          [0, ember.opacity, ember.opacity * 0.6, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        // Global fade out
        const globalFade = interpolate(frame, [60, 78], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${ember.x + driftX}%`,
              top: `${y}%`,
              width: ember.size * s,
              height: ember.size * s,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.9)",
              opacity: emberOpacity * globalFade,
              filter: `blur(${0.5 * s}px)`,
            }}
          />
        );
      })}

      {/* Text whisper */}
      <div
        style={{
          position: "absolute",
          bottom: "28%",
          textAlign: "center",
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 38 * s,
            fontWeight: 200,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          What if you could only say three things?
        </p>
      </div>
    </AbsoluteFill>
  );
};
