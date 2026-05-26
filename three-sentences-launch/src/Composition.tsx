/**
 * Launch — root composition for the 10-second Three Sentences teaser.
 *
 * Scene layout (composition frames):
 *   SceneMark     0   → 75    (main 0-60, exit 60-75)
 *   SceneHeadline 60  → 150   (enter 60-72, main 72-135, exit 135-150)
 *   SceneRule     135 → 220   (enter 135-147, phone 145-175, typing 145-199, exit 210-220)
 *   ScenePromise  208 → 280   (enter 208-220, text 220-250, exit 268-280)
 *   SceneCTA      265 → 300   (enter 265-275, hold to end)
 *
 * Each scene owns its own T.paper background — later sequences render on top,
 * their bg fade-in creates the cross-fade illusion.
 *
 * premountFor on each Sequence pre-renders components 1 s before they appear
 * so there's no pop on enter.
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T } from "./tokens";
import { DotGrid } from "./components/DotGrid";
import { SceneMark } from "./scenes/SceneMark";
import { SceneHeadline } from "./scenes/SceneHeadline";
import { SceneRule } from "./scenes/SceneRule";
import { ScenePromise } from "./scenes/ScenePromise";
import { SceneCTA } from "./scenes/SceneCTA";

export const Launch: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: T.paper }}>
      {/* Persistent dot-grid over every scene */}
      <DotGrid />

      {/* ── Scene 1: The mark arrives (comp 0–75) ── */}
      <Sequence from={0} durationInFrames={75} premountFor={0}>
        <SceneMark />
      </Sequence>

      {/* ── Scene 2: The headline (comp 60–150) ── */}
      <Sequence from={60} durationInFrames={90} premountFor={15}>
        <SceneHeadline />
      </Sequence>

      {/* ── Scene 3: The rule, demonstrated (comp 135–220) ── */}
      <Sequence from={135} durationInFrames={85} premountFor={15}>
        <SceneRule />
      </Sequence>

      {/* ── Scene 4: The promise (comp 208–280) ── */}
      <Sequence from={208} durationInFrames={72} premountFor={15}>
        <ScenePromise />
      </Sequence>

      {/* ── Scene 5: The call (comp 265–300) ── */}
      <Sequence from={265} durationInFrames={35} premountFor={10}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
