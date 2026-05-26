// src/scenes/launch/Scene03_TheRule.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { T, F } from "../../tokens";
import { JugglingDots } from "../../components/JugglingDots";
import { ease } from "../../motion/easing";

// Character-by-character type-in
function typeIn(
  text: string,
  startFrame: number,
  delayPerChar: number,
  frame: number
): string {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.floor(elapsed / delayPerChar);
  return text.slice(0, chars);
}

const DOT_SIZE = 18;
const DISPLAY_SIZE = 132;

export const Scene03_TheRule: React.FC = () => {
  const frame = useCurrentFrame(); // local 0–240

  // Dots enter: start=20 (stagger 20/24/28 internally in JugglingDots)
  // At f40 all 3 dots have landed — switch to idle
  const dotsMode = frame >= 40 ? "idle" : "enter";

  // "Three" wordmark opacity/translateY (f60→f78)
  const threeOpacity = interpolate(frame, [60, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const threeY = interpolate(frame, [60, 78], [8, 0], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 2: "No more," types (f83→f108, 2f/char)
  const line2Text = typeIn("No more,", 83, 2, frame);
  const line2Opacity = interpolate(frame, [83, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 3: "no less." types (f113→f138, 2f/char)
  const line3Text = typeIn("no less.", 113, 2, frame);
  const line3Opacity = interpolate(frame, [113, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Eyebrow "THE ONLY RULE." (f173→f191)
  const eyebrowOpacity = interpolate(frame, [173, 191], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: T.paper,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "0 160px",
      }}
    >
      {/* Line 1: "Three" + dots as period */}
      <div
        style={{
          opacity: threeOpacity,
          transform: `translateY(${threeY}px)`,
          display: "flex",
          alignItems: "flex-end",
          gap: 4,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: DISPLAY_SIZE,
            letterSpacing: "-4px",
            lineHeight: 1,
            color: T.ink,
            pointerEvents: "none",
          }}
        >
          Three
        </div>
        {/* Dots sit here as the "period" — alignItems flex-end puts them at text baseline */}
        <div
          style={{
            paddingBottom: Math.round(DISPLAY_SIZE * 0.08),
            marginLeft: 6,
          }}
        >
          <JugglingDots
            start={20}
            mode={dotsMode}
            size={DOT_SIZE}
            color={T.ink}
          />
        </div>
      </div>

      {/* Line 2: No more, (INK_DIM) */}
      <div
        style={{
          opacity: line2Opacity,
          fontFamily: F.serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: DISPLAY_SIZE,
          letterSpacing: "-4px",
          lineHeight: 1,
          color: T.inkDim,
          marginBottom: 8,
          pointerEvents: "none",
        }}
      >
        {line2Text}
        {line2Text.length < 8 && frame >= 83 && (
          <span style={{ opacity: 0.7 }}>|</span>
        )}
      </div>

      {/* Line 3: no less. (INK_DIM) */}
      <div
        style={{
          opacity: line3Opacity,
          fontFamily: F.serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: DISPLAY_SIZE,
          letterSpacing: "-4px",
          lineHeight: 1,
          color: T.inkDim,
          marginBottom: 40,
          pointerEvents: "none",
        }}
      >
        {line3Text}
        {line3Text.length < 8 && frame >= 113 && (
          <span style={{ opacity: 0.7 }}>|</span>
        )}
      </div>

      {/* Eyebrow: THE ONLY RULE. */}
      <div
        style={{
          opacity: eyebrowOpacity,
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 14,
          letterSpacing: "3px",
          textTransform: "uppercase" as const,
          color: T.inkDim,
          pointerEvents: "none",
        }}
      >
        THE ONLY RULE.
      </div>
    </AbsoluteFill>
  );
};
