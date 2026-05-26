// src/components/Dot.tsx
import React from "react";
import { T } from "../tokens";

export interface DotProps {
  size?: number;          // diameter in px, default 22
  color?: string;         // default T.ink (ivory)
  filled?: boolean;       // solid bg vs transparent (outlined), default true
  opacity?: number;
  style?: React.CSSProperties;
}

export const Dot: React.FC<DotProps> = ({
  size = 22,
  color = T.ink,
  filled = true,
  opacity = 1,
  style,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: filled ? color : "transparent",
      border: `${Math.max(1, Math.round(size / 14))}px solid ${color}`,
      opacity,
      flexShrink: 0,
      ...style,
    }}
  />
);
