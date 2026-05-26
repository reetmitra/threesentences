// src/components/JugglingDots.tsx
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../tokens";
import { ease } from "../motion/easing";

export type JugglingMode =
  | "enter"
  | "exit"
  | "idle"
  | "fill"
  | "morph-to-mark"
  | "morph-to-check";

export interface JugglingDotsProps {
  start: number;        // absolute composition frame when animation begins
  mode: JugglingMode;
  filled?: number;      // 0–3 float: controls how many dots are solid (used in fill mode)
  color?: string;       // default T.ink
  size?: number;        // dot diameter px, default 22
  markSize?: number;    // for morph-to-mark: BrandMark tile size, default 120
  style?: React.CSSProperties;
}

export const JugglingDots: React.FC<JugglingDotsProps> = ({
  start,
  mode,
  filled = 0,
  color = T.ink,
  size = 22,
  markSize = 120,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - start; // local frame relative to start

  const gap = size * 1.2;

  const dotSpring = (dotIndex: number) =>
    spring({
      frame: Math.max(0, lf - dotIndex * 4),
      fps,
      config: { damping: 8, stiffness: 120, mass: 1 },
    });

  const breathY = Math.sin((frame / 60) * Math.PI * 2) * 2;

  const getDotState = (i: number) => {
    let y = 0, opacity = 1, scale = 1;
    let dotFilled = true;

    switch (mode) {
      case "enter": {
        const spr = dotSpring(i);
        y = (1 - spr) * -160;
        scale = 0.6 + spr * 0.4;
        opacity = Math.min(1, spr * 8);
        break;
      }
      case "exit": {
        const spr = dotSpring(i);
        y = spr * 200;
        opacity = Math.max(0, 1 - spr * 1.5);
        break;
      }
      case "idle": {
        y = breathY;
        break;
      }
      case "fill": {
        dotFilled = filled > i;
        break;
      }
      case "morph-to-check":
        // Intentional placeholder — morph-to-check is not used in the LaunchFilm.
        // Falls back to idle breath. Implement fully if this mode is needed.
        y = breathY;
        break;
    }
    return { y, opacity, scale, dotFilled };
  };

  // morph-to-mark renders a tile + positioned dots — handled separately
  if (mode === "morph-to-mark") {
    const dotDiam = (markSize / 9) * 2;
    const dotGap = markSize / 8;
    const tileRadius = markSize * 0.22;

    const tileScale = interpolate(lf, [0, 12], [0, 1], {
      easing: ease.discipline,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Origins are ~5× the tile size off-screen to ensure dots start fully hidden.
    // At markSize=120 (default), these put dots well outside any viewport.
    const origins = [
      { x: -600, y: 0 },   // dot 0: from left
      { x: 0, y: 450 },    // dot 1: from below
      { x: 600, y: 0 },    // dot 2: from right
    ];

    return (
      <div
        style={{
          position: "relative",
          width: markSize,
          height: markSize,
          flexShrink: 0,
          ...style,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#fff",
            borderRadius: tileRadius,
            transform: `scale(${tileScale})`,
            transformOrigin: "center center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: dotGap,
          }}
        >
          {[0, 1, 2].map((i) => {
            const progress = interpolate(
              lf,
              [i * 4, i * 4 + 25],
              [0, 1],
              {
                easing: ease.editorial,
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            const ox = origins[i].x * (1 - progress);
            const oy = origins[i].y * (1 - progress);
            const dotOpacity = Math.min(1, progress * 4);
            return (
              <div
                key={i}
                style={{
                  width: dotDiam,
                  height: dotDiam,
                  borderRadius: "50%",
                  background: "#0a0a0a",
                  flexShrink: 0,
                  transform: `translate(${ox}px, ${oy}px)`,
                  opacity: dotOpacity,
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  const borderWidth = Math.max(1, Math.round(size / 14));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap,
        position: "relative",
        flexShrink: 0,
        ...style,
      }}
    >
      {[0, 1, 2].map((i) => {
        const { y, opacity, scale } = getDotState(i);
        let bg = color;
        let dotOpacity = opacity;

        if (mode === "fill") {
          const fillFrac = Math.max(0, Math.min(1, filled - i));
          bg = fillFrac > 0 ? color : "transparent";
          dotOpacity = fillFrac > 0 ? opacity * fillFrac : opacity * 0.3; // outlined dots show at 30%
        }

        return (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: bg,
              border: `${borderWidth}px solid ${color}`,
              transform: `translateY(${y}px) scale(${scale})`,
              opacity: dotOpacity,
              flexShrink: 0,
              transition: "none",
            }}
          />
        );
      })}
    </div>
  );
};
