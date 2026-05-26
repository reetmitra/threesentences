// src/scenes/launch/Scene04_TypingDemo.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { T, F } from "../../tokens";

export const Scene04_TypingDemo: React.FC = () => (
  <AbsoluteFill style={{ background: T.paper, alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: F.mono, color: T.inkDim, fontSize: 24, letterSpacing: 4 }}>
      SCENE 04 · TYPING DEMO
    </div>
  </AbsoluteFill>
);
