import React from "react";
import { T, F } from "../tokens";

interface ScreenInsightsProps {
  streak?: number;        // default 12 (can be float for animation)
  tilesReveal?: number;   // 0–1: stat tiles cascade in
}

const StatTile: React.FC<{
  label: string;
  value: string;
  opacity?: number;
}> = ({ label, value, opacity = 1 }) => (
  <div
    style={{
      flex: 1,
      padding: "10px 12px",
      background: T.surface,
      borderRadius: 8,
      border: `1px solid ${T.frame}`,
      opacity,
    }}
  >
    <div
      style={{
        fontFamily: F.mono,
        fontWeight: 500,
        fontSize: 8,
        letterSpacing: "2px",
        textTransform: "uppercase" as const,
        color: T.inkDim,
        marginBottom: 4,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: F.serif,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: 22,
        color: T.inkBright,
        lineHeight: 1,
      }}
    >
      {value}
    </div>
  </div>
);

export const ScreenInsights: React.FC<ScreenInsightsProps> = ({
  streak = 12,
  tilesReveal = 1,
}) => {
  const streakDisplay = Math.floor(streak).toString();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "0 18px 14px",
        gap: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily: F.serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 26,
          color: T.ink,
        }}
      >
        Insights
      </div>

      {/* Streak hero card */}
      <div
        style={{
          padding: "16px 18px",
          background: T.surface,
          borderRadius: 12,
          border: `1px solid ${T.frame}`,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 8,
            letterSpacing: "2.4px",
            textTransform: "uppercase" as const,
            color: T.inkDim,
          }}
        >
          Current Streak
        </div>
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 64,
            color: T.inkBright,
            lineHeight: 1,
          }}
        >
          {streakDisplay}
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
          Days in a row
        </div>
      </div>

      {/* Stat tiles — cascade opacity based on tilesReveal */}
      <div style={{ display: "flex", gap: 8 }}>
        <StatTile
          label="Longest"
          value="23"
          opacity={Math.min(1, tilesReveal * 3)}
        />
        <StatTile
          label="Entries"
          value="184"
          opacity={Math.min(1, Math.max(0, tilesReveal * 3 - 1))}
        />
        <StatTile
          label="Goal"
          value="363"
          opacity={Math.min(1, Math.max(0, tilesReveal * 3 - 2))}
        />
      </div>

      {/* Daily prompt card */}
      <div
        style={{
          padding: "10px 14px",
          borderLeft: `2px solid ${T.inkBright}`,
          background: T.surface,
          borderRadius: "0 8px 8px 0",
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 8,
            letterSpacing: "2px",
            textTransform: "uppercase" as const,
            color: T.inkDim,
            marginBottom: 4,
          }}
        >
          Today's Prompt
        </div>
        <div
          style={{
            fontFamily: F.serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 13,
            color: T.ink,
            lineHeight: 1.4,
          }}
        >
          What is one thing you would do again?
        </div>
      </div>
    </div>
  );
};
