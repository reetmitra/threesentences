import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { SvgThree } from "../shared/SvgThree";
import { TextScramble } from "../shared/TextScramble";
import { useScale } from "../shared/tokens";
import { fi, fo } from "../shared/helpers";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "400", "600"],
  subsets: ["latin"],
});

/**
 * Scene 7: "Logo Reveal + CTA" (55 frames / ~1.8s)
 * SVG "3" trace -> wordmark -> CTA -> fade to black.
 * Compressed timeline for punchy ending.
 */
export const S7_LogoCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();

  // ─── SVG trace (faster) ─────────────────────────────────────────
  const traceDur = 18;

  // ─── Wordmark "THREE" ─────────────────────────────────────────
  const wordmarkSpring = spring({
    frame: Math.max(0, frame - 16),
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const wordmarkScale = 0.6 + wordmarkSpring * 0.4;

  // ─── "be better, do better" ───────────────────────────────────
  const subSpring = spring({
    frame: Math.max(0, frame - 22),
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // ─── CTA button ───────────────────────────────────────────────
  const ctaSpring = spring({
    frame: Math.max(0, frame - 26),
    fps,
    config: { damping: 10, stiffness: 140 },
  });
  const ctaPulse = frame > 32 ? 1 + Math.sin((frame - 32) * 0.1) * 0.02 : 1;

  // ─── "Q4 2026" scramble ───────────────────────────────────────
  const q4Opacity = fi(frame, 30, 8);

  // ─── "by 363" footer ──────────────────────────────────────────
  const footerOpacity = fi(frame, 34, 8);

  // ─── Final fade to black ──────────────────────────────────────
  const exitOpacity = fo(frame, 43, 12);

  // ─── Background glow ─────────────────────────────────────────
  const glowOpacity = fi(frame, 5, 20) * exitOpacity;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        opacity: exitOpacity,
      }}
    >
      {/* Radial background glow */}
      <div
        style={{
          position: "absolute",
          width: 1600 * s,
          height: 1600 * s,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
          opacity: glowOpacity,
        }}
      />

      <div style={{ textAlign: "center", position: "relative" }}>
        {/* SVG "3" trace */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20 * s,
          }}
        >
          <SvgThree startFrame={0} traceDuration={traceDur} size={200} />
        </div>

        {/* "THREE" wordmark */}
        <h1
          style={{
            fontSize: 96 * s,
            fontWeight: 300,
            color: "white",
            letterSpacing: "-0.03em",
            margin: 0,
            opacity: wordmarkSpring,
            transform: `scale(${wordmarkScale})`,
          }}
        >
          THREE
        </h1>

        {/* "be better, do better" */}
        <p
          style={{
            fontSize: 24 * s,
            fontWeight: 300,
            color: "rgba(255,255,255,0.5)",
            marginTop: 8 * s,
            opacity: subSpring,
            transform: `translateY(${(1 - subSpring) * 12 * s}px)`,
          }}
        >
          be better, do better
        </p>

        {/* CTA button */}
        <div
          style={{
            marginTop: 36 * s,
            opacity: ctaSpring,
            transform: `scale(${ctaSpring * ctaPulse})`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: `${14 * s}px ${40 * s}px`,
              borderRadius: 50 * s,
              backgroundColor: "white",
              color: "black",
              fontSize: 16 * s,
              fontWeight: 600,
            }}
          >
            Get early access
          </div>
        </div>

        {/* "Q4 2026" scramble */}
        <div style={{ marginTop: 24 * s, opacity: q4Opacity }}>
          <TextScramble
            text="Q4 2026"
            startFrame={30}
            duration={12}
            charset="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            style={{
              fontSize: 12 * s,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.3em",
              fontVariantNumeric: "tabular-nums",
            }}
          />
        </div>

        {/* "by 363" footer */}
        <p
          style={{
            fontSize: 11 * s,
            color: "rgba(255,255,255,0.15)",
            marginTop: 16 * s,
            opacity: footerOpacity,
            letterSpacing: "0.15em",
          }}
        >
          by 363&trade;
        </p>
      </div>
    </AbsoluteFill>
  );
};
