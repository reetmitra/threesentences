import React from "react";
import { T, F } from "../tokens";

export const Eyebrow: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: F.mono,
      fontWeight: 500,
      fontSize: 14,
      letterSpacing: "4.8px",
      textTransform: "uppercase" as const,
      color: T.inkDim,
      pointerEvents: "none",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Display: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: F.serif,
      fontStyle: "italic",
      fontWeight: 400,
      fontSize: 180,
      letterSpacing: "-6px",
      lineHeight: 1,
      color: T.ink,
      pointerEvents: "none",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Lead: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: F.serif,
      fontStyle: "italic",
      fontWeight: 400,
      fontSize: 56,
      letterSpacing: "-1.4px",
      lineHeight: 1.05,
      color: T.ink,
      pointerEvents: "none",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Mono: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: F.mono,
      fontWeight: 500,
      fontSize: 14,
      letterSpacing: "3px",
      textTransform: "uppercase" as const,
      color: T.inkDim,
      pointerEvents: "none",
      ...style,
    }}
  >
    {children}
  </div>
);
