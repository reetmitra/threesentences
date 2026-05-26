/**
 * MiniPhone — editorial device frame with typing demo inside.
 * All animation driven by useCurrentFrame() (local to its parent Sequence).
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { T, F } from "../tokens";
import { TypingText, getSentenceEndFrames, TypingLine } from "./TypingText";

/* ── Typing content ─────────────────────────────────────────────────────── */
const SENTENCES: TypingLine[] = [
  { text: "The rain stopped just after lunch." },
  { text: "I walked the long way to the post office." },
  { text: "A small kindness from a stranger." },
];
const TYPING_START = 10; // local frame (phone starts appearing at frame 10)
const CHARS_PER_FRAME = 2; // ~2 chars/frame → all 108 chars done at local ≈ 64

/* Local completion frames for each sentence */
const SENTENCE_ENDS = getSentenceEndFrames(SENTENCES, TYPING_START, CHARS_PER_FRAME);
// ≈ [27, 48, 64] local frames

/* Submit pill fills at: third sentence done + 1 frame */
const SUBMIT_START = SENTENCE_ENDS[2]; // ≈ 64
const SUBMIT_END = SUBMIT_START + 8;

/* ── Dots counter ───────────────────────────────────────────────────────── */
const Dot: React.FC<{ filled: boolean }> = ({ filled }) => (
  <div
    style={{
      width: 14,
      height: 14,
      borderRadius: "50%",
      background: filled ? T.ink : "transparent",
      border: `1.5px solid ${filled ? T.ink : T.inkFade}`,
      transition: "none",
    }}
  />
);

/* ── MiniPhone ──────────────────────────────────────────────────────────── */
interface MiniPhoneProps {
  /** Scale to apply to the whole phone (for entrance spring — applied by parent) */
  style?: React.CSSProperties;
}

export const MiniPhone: React.FC<MiniPhoneProps> = ({ style }) => {
  const frame = useCurrentFrame();

  /* --- Typing progress --------------------------------------------------- */
  const totalChars = SENTENCES.reduce((s, l) => s + l.text.length, 0);
  const elapsed = Math.max(0, frame - TYPING_START);
  const charsTyped = Math.min(
    Math.floor(elapsed * CHARS_PER_FRAME),
    totalChars
  );

  /* How many sentences are fully done */
  const sentencesDone = SENTENCE_ENDS.filter((end) => frame >= end).length;

  /* Submit pill fill */
  const submitFill = interpolate(frame, [SUBMIT_START, SUBMIT_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const submitBg =
    submitFill > 0
      ? `rgba(235,231,220,${submitFill})`
      : "transparent";
  const submitColor =
    submitFill > 0.5 ? T.paper : T.inkDim;

  /* -------------------------------------------------------------------- */
  return (
    <div
      style={{
        width: 640,
        height: 1320,
        background: T.paper2,
        borderRadius: 84,
        border: `2px solid ${T.frame}`,
        boxShadow:
          "0 80px 160px -40px rgba(0,0,0,0.9), 0 30px 60px -30px rgba(0,0,0,0.5)",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Dynamic island */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: "50%",
          transform: "translateX(-50%)",
          width: 96,
          height: 44,
          background: "#000",
          borderRadius: 999,
          zIndex: 10,
        }}
      />

      {/* Home indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 110,
          height: 4,
          background: T.ink,
          opacity: 0.5,
          borderRadius: 999,
        }}
      />

      {/* Content area */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "80px 36px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Date line */}
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 18,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: T.inkDim,
            marginBottom: 14,
            pointerEvents: "none",
          }}
        >
          TUE · JUN 18
        </div>

        {/* "Today" heading */}
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 56,
            color: T.ink,
            lineHeight: 1.05,
            marginBottom: 22,
            pointerEvents: "none",
          }}
        >
          Today
        </div>

        {/* Prompt with left border */}
        <div
          style={{
            borderLeft: `2px solid ${T.inkFade}`,
            paddingLeft: 16,
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 22,
            color: T.inkDim,
            lineHeight: 1.4,
            marginBottom: 28,
            pointerEvents: "none",
          }}
        >
          What did you notice today?
        </div>

        {/* Typing area */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <TypingText
            lines={SENTENCES}
            startFrame={TYPING_START}
            charsPerFrame={CHARS_PER_FRAME}
            lineStyle={{
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 30,
              lineHeight: 1.6,
              color: T.ink,
              pointerEvents: "none",
              marginBottom: 4,
            }}
            activeLineStyle={{
              color: T.ink,
            }}
          />
        </div>

        {/* Bottom: dots + counter + submit */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            paddingTop: 16,
          }}
        >
          {/* Dots row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {[0, 1, 2].map((i) => (
              <Dot key={i} filled={sentencesDone > i} />
            ))}
            <span
              style={{
                fontFamily: F.mono,
                fontWeight: 500,
                fontSize: 16,
                letterSpacing: "2px",
                color: T.inkDim,
                marginLeft: 10,
                pointerEvents: "none",
              }}
            >
              {sentencesDone} / 3
              {sentencesDone < 3 ? " · …" : ""}
            </span>
          </div>

          {/* Submit pill */}
          <div
            style={{
              height: 80,
              borderRadius: 999,
              border: `1.5px solid ${submitFill > 0 ? T.ink : T.inkFade}`,
              background: submitBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.sans,
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: "1px",
              color: submitColor,
              pointerEvents: "none",
            }}
          >
            Submit
          </div>
        </div>
      </div>
    </div>
  );
};
