// src/LaunchFilm.tsx
// Master 55-second (1650-frame) editorial launch film composition.
// Seven scenes orchestrated via <Sequence> using shared timing constants.
// Post-effects (Grain, Vignette) sit above all scenes.
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T } from "./tokens";
import { DotGrid } from "./components/DotGrid";
import { Grain } from "./components/Grain";
import { Vignette } from "./components/Vignette";
import { SCENE_STARTS, SCENE_DURATIONS } from "./motion/timing";
import { Scene01_Opening } from "./scenes/launch/Scene01_Opening";
import { Scene02_Antagonist } from "./scenes/launch/Scene02_Antagonist";
import { Scene03_TheRule } from "./scenes/launch/Scene03_TheRule";
import { Scene04_TypingDemo } from "./scenes/launch/Scene04_TypingDemo";
import { Scene05_AppTour } from "./scenes/launch/Scene05_AppTour";
import { Scene06_363 } from "./scenes/launch/Scene06_363";
import { Scene07_Close } from "./scenes/launch/Scene07_Close";

const SCENES = [
  { Component: Scene01_Opening,    start: SCENE_STARTS.s1, duration: SCENE_DURATIONS.s1 },
  { Component: Scene02_Antagonist, start: SCENE_STARTS.s2, duration: SCENE_DURATIONS.s2 },
  { Component: Scene03_TheRule,    start: SCENE_STARTS.s3, duration: SCENE_DURATIONS.s3 },
  { Component: Scene04_TypingDemo, start: SCENE_STARTS.s4, duration: SCENE_DURATIONS.s4 },
  { Component: Scene05_AppTour,    start: SCENE_STARTS.s5, duration: SCENE_DURATIONS.s5 },
  { Component: Scene06_363,        start: SCENE_STARTS.s6, duration: SCENE_DURATIONS.s6 },
  { Component: Scene07_Close,      start: SCENE_STARTS.s7, duration: SCENE_DURATIONS.s7 },
] as const;

export const LaunchFilm: React.FC = () => (
  <AbsoluteFill style={{ background: T.paper }}>
    {/* Subtle dot-grid backdrop — lower opacity than the teaser */}
    <DotGrid opacity={0.012} cell={28} />

    {/* Seven scenes, each owns its own AbsoluteFill background */}
    {SCENES.map(({ Component, start, duration }, i) => (
      <Sequence key={i} from={start} durationInFrames={duration}>
        <Component />
      </Sequence>
    ))}

    {/* Post-effects sit above all scene content */}
    <Grain opacity={0.015} />
    <Vignette strength={0.08} />
  </AbsoluteFill>
);
