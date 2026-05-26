// src/scenes/launch/Scene05_AppTour.tsx
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { T, F } from "../../tokens";
import { PhoneFrame } from "../../components/PhoneFrame";
import { ScreenToday } from "../../components/ScreenToday";
import { ScreenHistory } from "../../components/ScreenHistory";
import { ScreenInsights } from "../../components/ScreenInsights";
import { ScreenCircle } from "../../components/ScreenCircle";
import { JugglingDots } from "../../components/JugglingDots";
import { ease } from "../../motion/easing";

// Sub-scene windows (local frames within Scene05's 360-frame budget)
const S1_START = 0;    // Today (locked from Scene04)
const S2_START = 90;   // History
const S3_START = 180;  // Insights
const S4_START = 270;  // The Circle
const CLUSTER_START = 300; // 2×2 grid

// Caption for each screen
const CAPTIONS = [
  { eyebrow: "THE PRACTICE.", body: "A locked entry, every day. No edits, ever." },
  { eyebrow: "THE RECORD.", body: "A quiet calendar. Forgiveness built in." },
  { eyebrow: "THE PATTERN.", body: "Patterns surface when you stop performing." },
  { eyebrow: "THE PEOPLE.", body: "A small, private circle. End-to-end encrypted." },
];

// Which sub-scene index is active (returns -1 for cluster)
function getActiveScene(f: number): number {
  if (f >= CLUSTER_START) return -1;
  if (f >= S4_START) return 3;
  if (f >= S3_START) return 2;
  if (f >= S2_START) return 1;
  return 0;
}

const LOCKED_TEXT =
  "The rain stopped just after lunch.\nI walked the long way to the post office.\nA small kindness from a stranger.";

export const Scene05_AppTour: React.FC = () => {
  const frame = useCurrentFrame(); // local 0–360
  const active = getActiveScene(frame);

  // Cluster fade-in progress (f300→f330)
  const clusterProgress = interpolate(frame, [CLUSTER_START, CLUSTER_START + 30], [0, 1], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Cluster view ──────────────────────────────────────────────────────────
  if (frame >= CLUSTER_START) {
    const labels = ["01 TODAY", "02 HISTORY", "03 INSIGHTS", "04 THE CIRCLE"];
    return (
      <AbsoluteFill
        style={{ background: T.paper, alignItems: "center", justifyContent: "center" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            opacity: clusterProgress,
          }}
        >
          {[0, 1, 2, 3].map((i: number) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: F.mono,
                  fontWeight: 500,
                  fontSize: 9,
                  letterSpacing: "2px",
                  textTransform: "uppercase" as const,
                  color: T.inkDim,
                }}
              >
                {labels[i]}
              </div>
              <PhoneFrame width={200} height={410}>
                {i === 0 && (
                  <ScreenToday
                    sentencesDone={3}
                    typedText={LOCKED_TEXT}
                    locked
                    lockedText={LOCKED_TEXT}
                    streak={12}
                    submitFill={1}
                  />
                )}
                {i === 1 && <ScreenHistory reveal={1} />}
                {i === 2 && <ScreenInsights streak={12} tilesReveal={1} />}
                {i === 3 && <ScreenCircle friendsReveal={1} />}
              </PhoneFrame>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    );
  }

  // ── Per-screen view ───────────────────────────────────────────────────────
  const subStarts = [S1_START, S2_START, S3_START, S4_START];
  const subStart = subStarts[active] ?? 0;
  const localSub = frame - subStart;

  // Transition dots: show for first 25 frames of each sub-scene
  const dotsOpacity = interpolate(
    localSub,
    [0, 8, 20, 25],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Screen reveal: starts at f15 of each sub-scene
  const screenReveal = interpolate(localSub, [15, 45], [0, 1], {
    easing: ease.editorial,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Caption opacity
  const captionOpacity = interpolate(localSub, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Per-screen animated reveal values
  const calendarReveal = active === 1 ? screenReveal : 1;
  const insightsReveal = active === 2
    ? interpolate(localSub, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  const circleReveal = active === 3
    ? interpolate(localSub, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  const caption = CAPTIONS[active] ?? CAPTIONS[0];

  return (
    <AbsoluteFill
      style={{
        background: T.paper,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
      }}
    >
      {/* Phone */}
      <PhoneFrame width={320} height={660}>
        {active === 0 && (
          <ScreenToday
            sentencesDone={3}
            typedText={LOCKED_TEXT}
            locked
            lockedText={LOCKED_TEXT}
            streak={12}
            submitFill={1}
          />
        )}
        {active === 1 && <ScreenHistory reveal={calendarReveal} />}
        {active === 2 && <ScreenInsights streak={12} tilesReveal={insightsReveal} />}
        {active === 3 && <ScreenCircle friendsReveal={circleReveal} />}
      </PhoneFrame>

      {/* Caption to the right */}
      <div
        style={{
          opacity: captionOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxWidth: 260,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 12,
            letterSpacing: "3px",
            textTransform: "uppercase" as const,
            color: T.inkBright,
          }}
        >
          {caption.eyebrow}
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontWeight: 400,
            fontSize: 16,
            color: T.inkDim,
            lineHeight: 1.5,
          }}
        >
          {caption.body}
        </div>
      </div>

      {/* Transition dots overlay */}
      {dotsOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: dotsOpacity,
          }}
        >
          <JugglingDots start={0} mode="idle" size={22} />
        </div>
      )}
    </AbsoluteFill>
  );
};
