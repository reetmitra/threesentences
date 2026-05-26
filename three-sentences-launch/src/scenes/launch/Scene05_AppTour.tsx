// src/scenes/launch/Scene05_AppTour.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { T, F } from "../../tokens";

export const Scene05_AppTour: React.FC = () => (
  <AbsoluteFill style={{ background: T.paper, alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: F.mono, color: T.inkDim, fontSize: 24, letterSpacing: 4 }}>
      SCENE 05 · APP TOUR
    </div>
  </AbsoluteFill>
);
