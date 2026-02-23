import React from "react";
import { useScale, SURFACE, BORDER } from "./tokens";

interface PhoneFrameProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Premium phone device chrome for 4K.
 * Scales proportionally with useScale().
 */
export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, style }) => {
  const s = useScale();

  const phoneWidth = 420 * s;
  const phoneHeight = 860 * s;
  const borderRadius = 48 * s;
  const bezelPad = 16 * s;
  const notchWidth = 120 * s;
  const notchHeight = 28 * s;

  return (
    <div
      style={{
        width: phoneWidth,
        height: phoneHeight,
        borderRadius,
        border: `${1.5 * s}px solid ${BORDER}`,
        backgroundColor: SURFACE,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 ${40 * s}px ${80 * s}px -${15 * s}px rgba(0,0,0,0.7), 0 ${8 * s}px ${24 * s}px rgba(0,0,0,0.3)`,
        ...style,
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: notchWidth,
          height: notchHeight,
          backgroundColor: SURFACE,
          borderRadius: `0 0 ${14 * s}px ${14 * s}px`,
          zIndex: 10,
          borderBottom: `${1 * s}px solid ${BORDER}`,
          borderLeft: `${1 * s}px solid ${BORDER}`,
          borderRight: `${1 * s}px solid ${BORDER}`,
        }}
      />

      {/* Content area */}
      <div
        style={{
          position: "absolute",
          top: bezelPad,
          left: bezelPad,
          right: bezelPad,
          bottom: bezelPad,
          overflow: "hidden",
          borderRadius: borderRadius - bezelPad,
        }}
      >
        {children}
      </div>

      {/* Bottom reflection line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: 1 * s,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />
    </div>
  );
};
