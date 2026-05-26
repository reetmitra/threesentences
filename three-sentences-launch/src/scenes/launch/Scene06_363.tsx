// src/scenes/launch/Scene06_363.tsx
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { T, F } from "../../tokens";

export const Scene06_363: React.FC = () => {
  const frame = useCurrentFrame(); // local 0–180

  // Ghost phone grid in bg (opacity 0→0.06)
  const bgOpacity = interpolate(frame, [0, 20], [0, 0.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 363 count-up (f20→f80, ease-out exponential).
  // Uses Easing.out(Easing.exp) directly — not in the ease.* brand abstraction
  // because this count-up needs a strong deceleration that overshoots the brand
  // editorial curve. Intentional deviation; update ease.ts if reused elsewhere.
  const countProgress = interpolate(frame, [20, 80], [0, 363], {
    easing: Easing.out(Easing.exp),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayNumber = String(Math.round(countProgress)).padStart(3, "0");

  // "NOT 365." types in (f80→f110, 1.5f/char)
  const notText = "NOT 365.".slice(
    0,
    Math.max(0, Math.floor((frame - 80) / 1.5))
  );

  // Philosophy line 1: "You cannot be perfect," (f120→f144)
  const line1Opacity = interpolate(frame, [120, 144], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Philosophy line 2: "but you can be relentless." (f132→f155)
  const line2Opacity = interpolate(frame, [132, 155], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ background: T.paper, alignItems: "center", justifyContent: "center" }}
    >
      {/* Background ghost phone outlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bgOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {[0, 1, 2, 3].map((i: number) => (
          <div
            key={i}
            style={{
              width: 160,
              height: 328,
              borderRadius: 20,
              border: `1px solid ${T.frame}`,
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          position: "relative",
        }}
      >
        {/* 363 numeral — large display */}
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 480,
            letterSpacing: "-12px",
            lineHeight: 0.95,
            color: T.ink,
            pointerEvents: "none",
          }}
        >
          {displayNumber}
        </div>

        {/* "NOT 365." eyebrow */}
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "4px",
            textTransform: "uppercase" as const,
            color: T.inkDim,
            pointerEvents: "none",
            minHeight: 20,
          }}
        >
          {notText}
        </div>

        {/* Philosophy lines */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            marginTop: 8,
          }}
        >
          <div
            style={{
              opacity: line1Opacity,
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 56,
              letterSpacing: "-1.4px",
              lineHeight: 1.05,
              color: T.inkDim,
              pointerEvents: "none",
            }}
          >
            You cannot be perfect,
          </div>
          <div
            style={{
              opacity: line2Opacity,
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 56,
              letterSpacing: "-1.4px",
              lineHeight: 1.05,
              color: T.inkBright,
              pointerEvents: "none",
            }}
          >
            but you can be relentless.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
