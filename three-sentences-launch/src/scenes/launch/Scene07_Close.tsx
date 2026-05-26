// src/scenes/launch/Scene07_Close.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { T, F } from "../../tokens";

export const Scene07_Close: React.FC = () => (
  <AbsoluteFill style={{ background: T.paper, alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: F.mono, color: T.inkDim, fontSize: 24, letterSpacing: 4 }}>
      SCENE 07 · CLOSE
    </div>
  </AbsoluteFill>
);
