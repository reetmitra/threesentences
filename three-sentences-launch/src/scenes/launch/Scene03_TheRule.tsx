// src/scenes/launch/Scene03_TheRule.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { T, F } from "../../tokens";

export const Scene03_TheRule: React.FC = () => (
  <AbsoluteFill style={{ background: T.paper, alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: F.mono, color: T.inkDim, fontSize: 24, letterSpacing: 4 }}>
      SCENE 03 · THE RULE
    </div>
  </AbsoluteFill>
);
