// src/scenes/launch/Scene07_Close.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { T, F } from "../../tokens";
import { JugglingDots } from "../../components/JugglingDots";
import { DotGrid } from "../../components/DotGrid";
import { ease } from "../../motion/easing";

export const Scene07_Close: React.FC = () => {
  const frame = useCurrentFrame(); // local 0–150

  // Radial glow returns (f0→f20)
  const glowOpacity = interpolate(frame, [0, 20], [0, 0.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Wordmark beneath mark (f45→f65)
  const wordmarkOpacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline (f65→f83)
  const taglineOpacity = interpolate(frame, [65, 83], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hairline (f83→f97)
  const hairlineScale = interpolate(frame, [83, 97], [0, 1], {
    easing: ease.discipline,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CTA (f97→f113)
  const ctaOpacity = interpolate(frame, [97, 113], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Meta line (f110→f125)
  const metaOpacity = interpolate(frame, [110, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: T.paper }}>
      <DotGrid opacity={0.025} cell={28} />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at center, rgba(255,255,255,${glowOpacity}) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      {/* Center column */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Mark morph — dots converge into brand mark tile */}
        <JugglingDots
          start={0}
          mode="morph-to-mark"
          markSize={120}
          style={{ marginBottom: 32 }}
        />

        {/* Wordmark */}
        <div
          style={{
            opacity: wordmarkOpacity,
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 96,
            letterSpacing: "-3px",
            lineHeight: 1,
            color: T.ink,
            textAlign: "center",
            marginBottom: 24,
            pointerEvents: "none",
          }}
        >
          Three
          <br />
          Sentences
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "4.8px",
            textTransform: "uppercase" as const,
            color: T.ink,
            marginBottom: 24,
            pointerEvents: "none",
          }}
        >
          {"BE BETTER.  DO BETTER."}
        </div>

        {/* Hairline */}
        <div
          style={{
            width: 200,
            height: 1,
            background: T.inkFade,
            transform: `scaleX(${hairlineScale})`,
            transformOrigin: "center",
            marginBottom: 20,
          }}
        />

        {/* CTA */}
        <div
          style={{
            opacity: ctaOpacity,
            fontFamily: F.sans,
            fontWeight: 500,
            fontSize: 18,
            color: T.ink,
            letterSpacing: "0.5px",
            marginBottom: 12,
            pointerEvents: "none",
          }}
        >
          REQUEST ACCESS — three63.com
        </div>

        {/* Meta */}
        <div
          style={{
            opacity: metaOpacity,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 11,
            letterSpacing: "2.4px",
            textTransform: "uppercase" as const,
            color: T.inkDim,
            pointerEvents: "none",
          }}
        >
          INVITE ONLY · iOS · Q4 2026
        </div>
      </div>
    </AbsoluteFill>
  );
};
