/**
 * Scene 3 · 135–210 (comp) — "The rule, demonstrated"
 * Sequence: from=135, durationInFrames=85
 * Local 0-15: fade in. Local 10-40: phone spring enter.
 * Local 10-65: typing (108 chars @ 2/frame → done at ≈ local 64).
 * Local 64-72: submit pill fills. Local 75-85: phone + scene exit.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { T } from "../tokens";
import { MiniPhone } from "../components/MiniPhone";

export const SceneRule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── Background fade-in (local 0–12) ── */
  const bgOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ── Phone spring entrance (local 10–40, comp 145–175) ── */
  const phoneEnterSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 100 },
    durationInFrames: 30,
  });
  const phoneEnterY = interpolate(phoneEnterSpring, [0, 1], [120, 0]);
  const phoneEnterOpacity = interpolate(phoneEnterSpring, [0, 1], [0, 1]);

  /* ── Phone exit (local 75–85) ── */
  const phoneExitProgress = interpolate(frame, [75, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phoneExitY = interpolate(phoneExitProgress, [0, 1], [0, -160]);
  const phoneExitOpacity = interpolate(phoneExitProgress, [0, 1], [1, 0]);

  /* ── Scene fade-out (local 75–85) ── */
  const sceneOpacity = interpolate(frame, [75, 85], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phoneY = phoneEnterY + phoneExitY;
  const phoneOpacity = Math.min(phoneEnterOpacity, phoneExitOpacity);

  return (
    <AbsoluteFill
      style={{
        background: T.paper,
        opacity: bgOpacity * sceneOpacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          transform: `translateY(${phoneY}px)`,
          opacity: phoneOpacity,
        }}
      >
        <MiniPhone />
      </div>
    </AbsoluteFill>
  );
};
