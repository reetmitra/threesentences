// src/scenes/launch/Scene01_Opening.tsx
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { T, F } from "../../tokens";
import { JugglingDots } from "../../components/JugglingDots";
import { ease } from "../../motion/easing";

export const Scene01_Opening: React.FC = () => {
  const frame = useCurrentFrame();

  // Radial glow (breathes in f0→f30, then brightens f30→f60)
  const glowOpacity = interpolate(frame, [0, 30, 60], [0.03, 0.05, 0.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dots Y drift (f60→f96): from optical center to 80px below + 60px right
  const dotsDriftProgress = interpolate(frame, [60, 96], [0, 1], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dotsTranslateY = dotsDriftProgress * 80;
  const dotsTranslateX = dotsDriftProgress * 60;

  // Wordmark fade (f60→f84)
  const wordmarkOpacity = interpolate(frame, [60, 84], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wordmarkY = interpolate(frame, [60, 84], [8, 0], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hairline scaleX (f96→f110)
  const hairlineScale = interpolate(frame, [96, 110], [0, 1], {
    easing: ease.discipline,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline fade (f120→f138)
  const taglineOpacity = interpolate(frame, [120, 138], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [120, 138], [8, 0], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: T.paper }}>
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at center, rgba(255,255,255,${glowOpacity}) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      {/* Center stage */}
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
        {/* Wordmark (fades in as dots drift) */}
        <div
          style={{
            opacity: wordmarkOpacity,
            transform: `translateY(${wordmarkY}px)`,
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 180,
            letterSpacing: "-6px",
            lineHeight: 1,
            color: T.ink,
            textAlign: "center",
            marginBottom: 16,
            pointerEvents: "none",
          }}
        >
          Three
          <br />
          Sentences
        </div>

        {/* Hairline */}
        <div
          style={{
            width: 120,
            height: 1,
            background: T.inkFade,
            transform: `scaleX(${hairlineScale})`,
            transformOrigin: "center",
            marginBottom: 16,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "4.8px",
            textTransform: "uppercase" as const,
            color: T.ink,
            pointerEvents: "none",
            marginBottom: 48,
          }}
        >
          {"BE BETTER.  DO BETTER."}
        </div>

        {/* Juggling dots — anchored beneath wordmark after drift */}
        <div
          style={{
            transform: `translate(${dotsTranslateX}px, ${dotsTranslateY}px)`,
          }}
        >
          <JugglingDots
            start={12}
            mode={frame < 30 ? "enter" : "idle"}
            size={22}
            color={T.ink}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
