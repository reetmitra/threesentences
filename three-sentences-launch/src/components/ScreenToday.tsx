import React from "react";
import { T, F } from "../tokens";

interface ScreenTodayProps {
  sentencesDone?: number;
  typedText?: string;
  submitFill?: number;
  locked?: boolean;
  lockedText?: string;
  streak?: number;
  showCursor?: boolean;
  frame?: number;
}

const CountDot: React.FC<{ filled: boolean }> = ({ filled }) => (
  <div
    style={{
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: filled ? T.inkBright : "transparent",
      border: `1.5px solid ${filled ? T.inkBright : T.inkFade}`,
      flexShrink: 0,
    }}
  />
);

export const ScreenToday: React.FC<ScreenTodayProps> = ({
  sentencesDone = 0,
  typedText = "",
  submitFill = 0,
  locked = false,
  lockedText = "",
  streak = 12,
  showCursor = false,
  frame = 0,
}) => {
  const submitActive = sentencesDone >= 3;
  const submitBg =
    submitFill > 0 ? `rgba(235,231,220,${submitFill})` : "transparent";
  const submitTextColor = submitFill > 0.5 ? T.paper : T.inkDim;
  const submitBorderColor = submitActive ? T.ink : T.inkFade;

  const counterLabel = locked
    ? "✓ LOCKED"
    : sentencesDone === 3
    ? "3 / 3 · READY"
    : `${sentencesDone} / 3 · ${3 - sentencesDone} MORE`;

  const headerText = locked ? "Done." : "Today.";

  // Cursor blink: on for 8 frames, off for 8 frames
  const blinkOn = showCursor && Math.floor(frame / 8) % 2 === 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "0 24px 18px",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 9,
              letterSpacing: "2px",
              textTransform: "uppercase" as const,
              color: T.inkDim,
              marginBottom: 2,
            }}
          >
            TUE · JUN 18
          </div>
          <div
            style={{
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 28,
              color: T.ink,
              lineHeight: 1,
            }}
          >
            {headerText}
          </div>
        </div>
        {/* Streak pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            border: `1.5px solid ${locked ? T.inkBright : T.frame}`,
            borderRadius: 999,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 11,
            color: T.ink,
            letterSpacing: "1px",
          }}
        >
          🔥 {streak}
        </div>
      </div>

      {/* Prompt strip */}
      <div
        style={{
          borderLeft: `2px solid ${T.inkFade}`,
          paddingLeft: 12,
          fontFamily: F.serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 12,
          color: T.inkDim,
          lineHeight: 1.4,
          marginBottom: 12,
        }}
      >
        What is one thing you would do again?
      </div>

      {/* Writing surface / locked card */}
      <div style={{ flex: 1, minHeight: 0, marginBottom: 10 }}>
        {locked ? (
          <div
            style={{
              padding: "14px 16px",
              background: T.surface,
              borderLeft: `2px solid ${T.inkBright}`,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontFamily: F.serif,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: 1.6,
                color: T.ink,
                marginBottom: 8,
                whiteSpace: "pre-wrap",
              }}
            >
              {lockedText}
            </div>
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
              ✓ SUBMITTED 9:14 PM · LOCKED
            </div>
          </div>
        ) : (
          <div
            style={{
              fontFamily: F.serif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 15,
              lineHeight: 1.6,
              color: typedText ? T.ink : T.inkFade,
              whiteSpace: "pre-wrap",
            }}
          >
            {typedText || "Three sentences. What happened?"}
            {blinkOn && (
              <span
                style={{
                  display: "inline-block",
                  width: 1,
                  height: "1.1em",
                  background: T.inkBright,
                  marginLeft: 1,
                  verticalAlign: "text-bottom",
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Counter strip */}
      {!locked && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {[0, 1, 2].map((i) => (
            <CountDot key={i} filled={sentencesDone > i} />
          ))}
          <span
            style={{
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 9,
              letterSpacing: "1.8px",
              textTransform: "uppercase" as const,
              color: T.inkDim,
              marginLeft: 4,
            }}
          >
            {counterLabel}
          </span>
        </div>
      )}

      {/* Submit pill */}
      {!locked && (
        <div
          style={{
            height: 44,
            borderRadius: 999,
            border: `1.5px solid ${submitBorderColor}`,
            background: submitBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: F.sans,
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.5px",
            color: submitTextColor,
            pointerEvents: "none",
          }}
        >
          {submitFill > 0.85
            ? "✓ Locked"
            : submitFill > 0.3
            ? "Locking…"
            : "Submit"}
        </div>
      )}
    </div>
  );
};
