import React from "react";
import { T } from "../tokens";

interface PhoneFrameProps {
  children?: React.ReactNode;
  /** Logical device width before any parent scaling. Default 380. */
  width?: number;
  /** Logical device height before any parent scaling. Default 780. */
  height?: number;
  style?: React.CSSProperties;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  width = 380,
  height = 780,
  style,
}) => {
  const radius = width * 0.12;

  return (
    <div
      style={{
        width,
        height,
        background: T.paper2,
        borderRadius: radius,
        border: `1.5px solid ${T.frame}`,
        boxShadow: [
          "0 80px 160px -40px rgba(0,0,0,0.9)",
          "0 30px 60px -30px rgba(0,0,0,0.5)",
        ].join(", "),
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Dynamic island */}
      <div
        style={{
          position: "absolute",
          top: Math.round(height * 0.018),
          left: "50%",
          transform: "translateX(-50%)",
          width: Math.round(width * 0.22),
          height: Math.round(width * 0.055),
          background: "#000",
          borderRadius: 999,
          zIndex: 10,
        }}
      />
      {/* Content area */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          paddingTop: Math.round(height * 0.068),
          paddingBottom: Math.round(height * 0.04),
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      {/* Home indicator */}
      <div
        style={{
          position: "absolute",
          bottom: Math.round(height * 0.018),
          left: "50%",
          transform: "translateX(-50%)",
          width: Math.round(width * 0.3),
          height: 3,
          background: T.ink,
          opacity: 0.4,
          borderRadius: 999,
        }}
      />
    </div>
  );
};
