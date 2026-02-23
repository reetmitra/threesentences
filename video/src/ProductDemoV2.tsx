import React from "react";
import { AbsoluteFill, Sequence, staticFile, interpolate } from "remotion";
import { Audio } from "@remotion/media";
import { BG } from "./shared/tokens";
import { ParticleField } from "./shared/ParticleField";
import { GrainOverlay } from "./shared/GrainOverlay";
import { S0_CinematicOpen } from "./scenes-v2/S0_CinematicOpen";
import { S1_Problem } from "./scenes-v2/S1_Problem";
import { S2_Constraint } from "./scenes-v2/S2_Constraint";
import { S3_App } from "./scenes-v2/S3_App";
import { S4_Mirror } from "./scenes-v2/S4_Mirror";
import { S5_Streak } from "./scenes-v2/S5_Streak";
import { S6_Principles } from "./scenes-v2/S6_Principles";
import { S7_LogoCTA } from "./scenes-v2/S7_LogoCTA";

/**
 * ProductDemoV2 -- Elite 30s competition demo video
 *
 * 900 frames @ 30fps = 30 seconds
 * 3840x2160 (4K) with 1920x1080 variant
 *
 * Scene timeline (with overlaps for transitions):
 *   S0 Cinematic:   0-80    (2.7s)  atmospheric teaser
 *   S1 Problem:     65-155  (3.0s)  kinetic typography hook
 *   S2 Constraint:  135-240 (3.5s)  text scramble reveal
 *   S3 App:         220-540 (10.7s) floating UI demo
 *   S4 Mirror:      510-700 (6.3s)  AI reflection card
 *   S5 Streak:      680-780 (3.3s)  calendar + friends
 *   S6 Principles:  760-855 (3.2s)  kinetic typography
 *   S7 Logo/CTA:    845-900 (1.8s)  brand reveal
 */
export const ProductDemoV2: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* ─── AUDIO ──────────────────────────────────────────────── */}
      {/* Voiceover: cinematic open + S1 are silent, VO starts at S2 */}
      <Audio
        src={staticFile("voiceover-v2.mp3")}
        volume={(f) => {
          // Cinematic open + Problem scene are silent (text only)
          if (f < 135) return 0;
          // Fade in over 15 frames as S2 Constraint begins
          if (f < 150)
            return interpolate(f, [135, 150], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
          // Fade out during logo reveal
          if (f > 860)
            return interpolate(f, [860, 890], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
          return 1;
        }}
      />

      {/* Background layer: floating particles */}
      <ParticleField count={40} opacity={0.45} />

      {/* ─── SCENES ─────────────────────────────────────────────── */}

      <Sequence from={0} durationInFrames={80}>
        <S0_CinematicOpen />
      </Sequence>

      <Sequence from={65} durationInFrames={90}>
        <S1_Problem />
      </Sequence>

      <Sequence from={135} durationInFrames={105}>
        <S2_Constraint />
      </Sequence>

      <Sequence from={220} durationInFrames={320}>
        <S3_App />
      </Sequence>

      <Sequence from={510} durationInFrames={190}>
        <S4_Mirror />
      </Sequence>

      <Sequence from={680} durationInFrames={100}>
        <S5_Streak />
      </Sequence>

      <Sequence from={760} durationInFrames={95}>
        <S6_Principles />
      </Sequence>

      <Sequence from={845} durationInFrames={55}>
        <S7_LogoCTA />
      </Sequence>

      {/* Top layer: film grain */}
      <GrainOverlay opacity={0.025} />
    </AbsoluteFill>
  );
};
