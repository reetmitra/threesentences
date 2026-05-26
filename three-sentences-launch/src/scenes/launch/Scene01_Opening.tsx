// src/scenes/launch/Scene01_Opening.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { T, F } from "../../tokens";

export const Scene01_Opening: React.FC = () => (
  <AbsoluteFill style={{ background: T.paper, alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: F.mono, color: T.inkDim, fontSize: 24, letterSpacing: 4 }}>
      SCENE 01 · OPENING
    </div>
  </AbsoluteFill>
);
