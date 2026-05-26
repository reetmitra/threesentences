// src/scenes/launch/Scene02_Antagonist.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { T, F } from "../../tokens";
import { ease } from "../../motion/easing";

function typeIn(
  text: string,
  startF: number,
  delayPerChar: number,
  frame: number
): string {
  return text.slice(
    0,
    Math.max(0, Math.floor((frame - startF) / delayPerChar))
  );
}

const LINE1 = "Most journaling apps ask you to write a lot.";
const LINE2 = "So most days, you write nothing.";
const DISPLAY_SIZE = 72;

export const Scene02_Antagonist: React.FC = () => {
  const frame = useCurrentFrame(); // local 0–240

  // Dots enter from top-left at scene start (f0→f20)
  const dotsOpacity = interpolate(frame, [0, 20], [0, 1], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 1 types (f40→f110, ~1.5f/char)
  const line1Text = typeIn(LINE1, 40, 1.5, frame);
  const line1Opacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 1 dims as line 2 starts (f130→f145) — color transition
  const line1DimProgress = interpolate(frame, [130, 145], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Interpolate between T.ink and T.inkDim using opacity trick:
  // We apply a second opacity layer over line1 to dim it
  const line1DimOpacity = 1 - line1DimProgress * 0.45; // ink → inkDim approximation

  // Line 2 types (f130→f195, ~1.8f/char)
  const line2Text = typeIn(LINE2, 130, 1.8, frame);
  const line2Opacity = interpolate(frame, [130, 145], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dots fade after drop at f200
  const dotsDropProgress = interpolate(frame, [200, 224], [0, 1], {
    easing: ease.discipline,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const postDropDotOpacity = 1 - dotsDropProgress * 0.7; // fades to 0.3

  return (
    <AbsoluteFill style={{ background: T.paper }}>
      {/* Header dots — top left */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 200,
          opacity: frame < 200 ? dotsOpacity : postDropDotOpacity,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: frame >= 200 ? T.inkFade : T.ink,
          }}
        />
      </div>

      {/* Full dots block (f0→f199, before drop) */}
      {frame < 200 && (
        <div
          style={{
            position: "absolute",
            top: 180,
            left: 226, // offset to avoid overlap with the single dot
            opacity: dotsOpacity,
            display: "flex",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: `1.5px solid ${T.ink}`,
            }}
          />
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: `1.5px solid ${T.ink}`,
            }}
          />
        </div>
      )}

      {/* Text block */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 200,
          right: 200,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            opacity: line1Opacity * line1DimOpacity,
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: DISPLAY_SIZE,
            letterSpacing: "-2px",
            lineHeight: 1.1,
            color: T.ink,
            pointerEvents: "none",
          }}
        >
          {line1Text}
          {line1Text.length < LINE1.length && frame >= 40 && (
            <span style={{ opacity: 0.7 }}>|</span>
          )}
        </div>

        {/* Line 2 */}
        {frame >= 130 && (
          <div
            style={{
              opacity: line2Opacity,
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: DISPLAY_SIZE,
              letterSpacing: "-2px",
              lineHeight: 1.1,
              color: T.inkDim,
              pointerEvents: "none",
            }}
          >
            {line2Text.includes("nothing") ? (
              <>
                {line2Text.slice(0, line2Text.indexOf("nothing"))}
                <span style={{ color: T.inkBright }}>
                  {line2Text.slice(line2Text.indexOf("nothing"))}
                </span>
              </>
            ) : (
              line2Text
            )}
            {line2Text.length < LINE2.length && (
              <span style={{ opacity: 0.7 }}>|</span>
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
