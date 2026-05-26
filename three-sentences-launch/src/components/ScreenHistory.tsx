import React from "react";
import { interpolate } from "remotion";
import { T, F } from "../tokens";

interface ScreenHistoryProps {
  /** 0–1: cells animate in as reveal goes 0→1. Pass 1 for all shown. */
  reveal?: number;
}

const DAYS_IN_JUNE = 30;
const JUNE_START_DOW = 1; // Monday (0=Sun, 1=Mon)
const WRITTEN = new Set([1,2,3,4,5,7,8,9,10,11,12,14,15,16,17,18,20,21,22,23,24,25,27,28,29,30]);
const TODAY_DATE = 18;
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export const ScreenHistory: React.FC<ScreenHistoryProps> = ({
  reveal = 1,
}) => {
  // Build flat array of {day, gridIndex} for all grid cells
  const rows = Math.ceil((JUNE_START_DOW + DAYS_IN_JUNE) / 7);
  const totalCells = rows * 7;
  const cells: Array<{ day: number | null; idx: number }> = [];

  for (let i = 0; i < totalCells; i++) {
    const day = i < JUNE_START_DOW ? null : i - JUNE_START_DOW + 1;
    cells.push({ day: day !== null && day <= DAYS_IN_JUNE ? day : null, idx: i });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "0 18px 14px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 26,
            color: T.ink,
            lineHeight: 1,
            marginBottom: 2,
          }}
        >
          History
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
          184 ENTRIES
        </div>
      </div>

      {/* Month nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 10,
          letterSpacing: "2px",
          textTransform: "uppercase" as const,
          color: T.ink,
        }}
      >
        <span style={{ color: T.inkFade }}>‹</span>
        <span>June 2026</span>
        <span style={{ color: T.inkFade }}>›</span>
      </div>

      {/* Weekday header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: 4,
        }}
      >
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 8,
              letterSpacing: "1px",
              color: T.inkFade,
              textTransform: "uppercase" as const,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 3,
          flex: 1,
        }}
      >
        {cells.map(({ day, idx }) => {
          if (day === null) return <div key={idx} />;

          const cellReveal = interpolate(
            reveal,
            [idx / totalCells, (idx + 1) / totalCells],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const isWritten = WRITTEN.has(day);
          const isToday = day === TODAY_DATE;

          return (
            <div
              key={idx}
              style={{
                aspectRatio: "1",
                borderRadius: 4,
                background: isWritten ? T.ink : "transparent",
                border: isToday
                  ? `1.5px solid ${T.inkBright}`
                  : isWritten
                  ? "none"
                  : `1px solid ${T.frame}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.mono,
                fontWeight: 500,
                fontSize: 8,
                color: isWritten ? T.paper : T.inkFade,
                opacity: cellReveal,
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Stats strip */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: `1px solid ${T.frame}`,
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 8,
          letterSpacing: "1.5px",
          textTransform: "uppercase" as const,
          color: T.inkDim,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span>17 / 30 This Month</span>
        <span style={{ color: T.inkFade }}>·</span>
        <span>184 Total</span>
        <span style={{ color: T.inkFade }}>·</span>
        <span>57%</span>
      </div>
    </div>
  );
};
