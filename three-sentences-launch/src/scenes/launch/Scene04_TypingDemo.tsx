// src/scenes/launch/Scene04_TypingDemo.tsx
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { T } from "../../tokens"; // T.inkBright used for flash overlay
import { PhoneFrame } from "../../components/PhoneFrame";
import { ScreenToday } from "../../components/ScreenToday";

// ── Typing engine: deterministic variable-delay per character ──────────────
const SENTENCES = [
  "The rain stopped just after lunch.",
  "I walked the long way to the post office.",
  "A small kindness from a stranger.",
];
const FULL_TEXT = SENTENCES.join("\n");

// Seeded LCG — deterministic between renders
function makePrng(seed: number) {
  let s = seed;
  return () => {
    s = ((Math.imul as (a: number, b: number) => number)(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

// Precompute cumulative frame for each character (0-indexed)
function buildCharFrames(startFrame: number): number[] {
  const rng = makePrng(42);
  const frames: number[] = [];
  let f = startFrame;
  for (const char of FULL_TEXT) {
    const isPause = char === "." || char === ",";
    const baseDelay = Math.round(1 + rng() * 1.4); // 1–2 frames
    f += baseDelay;
    frames.push(f);
    if (isPause) f += 4; // hold after punctuation
  }
  return frames;
}

const TYPING_START = 80;
const CHAR_FRAMES = buildCharFrames(TYPING_START);
const TOTAL_CHARS = FULL_TEXT.length;

// Frame when each sentence completes
const sentence1End = CHAR_FRAMES[SENTENCES[0].length - 1];
const sentence2End = CHAR_FRAMES[SENTENCES[0].length + SENTENCES[1].length - 1];
const sentence3End = CHAR_FRAMES[TOTAL_CHARS - 1];

// Submit sequence starts 10 frames after last sentence
const SUBMIT_START = sentence3End + 10;
const LOCK_FLASH = SUBMIT_START + 20; // luminance flash frame
const LOCKED_AT = SUBMIT_START + 30;

// ── Component ──────────────────────────────────────────────────────────────
export const Scene04_TypingDemo: React.FC = () => {
  const frame = useCurrentFrame(); // local 0–300
  const { fps } = useVideoConfig();

  // Phone slide up from bottom (f0→f40)
  const phoneSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 1 },
  });
  const phoneY = interpolate(phoneSpring, [0, 1], [600, 0]);
  const phoneOpacity = Math.min(1, phoneSpring * 2);

  // How many characters are visible at current frame
  const charsTyped = CHAR_FRAMES.filter((cf) => cf <= frame).length;
  const typedText = FULL_TEXT.slice(0, charsTyped);

  // How many sentences are done
  const sentencesDone =
    frame >= sentence3End ? 3 :
    frame >= sentence2End ? 2 :
    frame >= sentence1End ? 1 : 0;

  // Submit pill fill progress
  const submitFill = interpolate(
    frame,
    [SUBMIT_START, SUBMIT_START + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Single-frame luminance flash
  const flashOpacity = frame === LOCK_FLASH ? 0.08 : 0;

  const locked = frame >= LOCKED_AT;

  return (
    <AbsoluteFill
      style={{
        background: T.paper,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Phone frame */}
      <div
        style={{
          transform: `translateY(${phoneY}px)`,
          opacity: phoneOpacity,
        }}
      >
        <PhoneFrame width={380} height={780}>
          <ScreenToday
            sentencesDone={sentencesDone}
            typedText={typedText}
            submitFill={submitFill}
            locked={locked}
            lockedText={FULL_TEXT}
            streak={12}
            frame={frame}
          />
        </PhoneFrame>
      </div>

      {/* Single-frame luminance flash on lock */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: T.inkBright,
            opacity: flashOpacity,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
