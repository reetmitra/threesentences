import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { useScale, TEXT_MUTED } from "../shared/tokens";
import { fi, fo } from "../shared/helpers";
import { seededRandom } from "../shared/helpers";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

// Calendar data: 1 = entry, 0 = no entry
const calendarDays = [
  1,1,1,0,1,1,1,
  1,1,0,1,1,1,1,
  1,1,1,1,0,1,1,
  1,1,1,1,1,0,0,
];

const friends = [
  { name: "Alex M.", streak: 47, color: "#4A9EFF" },
  { name: "Sarah K.", streak: 31, color: "#FF6B8A" },
  { name: "Jay P.", streak: 23, color: "#50C878" },
];

/**
 * Scene 5: "The Streak" (110 frames / ~3.7s)
 * Calendar grid with wave stagger + friend streaks.
 */
export const S5_Streak: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();

  // ─── Header ───────────────────────────────────────────────────
  const headerOpacity = fi(frame, 0, 15);
  const headerY = interpolate(frame, [0, 15], [20 * s, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── Exit ─────────────────────────────────────────────────────
  const exitOpacity = fo(frame, 95, 15);
  const exitScale = interpolate(frame, [95, 110], [1, 1.03], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 1200 * s }}>
        {/* Header */}
        <div
          style={{
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
            marginBottom: 40 * s,
          }}
        >
          <p
            style={{
              fontSize: 12 * s,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 8 * s,
            }}
          >
            Project 363
          </p>
          <h2
            style={{
              fontSize: 48 * s,
              fontWeight: 700,
              color: "white",
              margin: 0,
            }}
          >
            363 days to better.
          </h2>
          <p
            style={{
              fontSize: 20 * s,
              fontWeight: 300,
              color: "rgba(255,255,255,0.3)",
              marginTop: 8 * s,
            }}
          >
            Two days of grace.
          </p>
        </div>

        {/* Calendar grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 8 * s,
            maxWidth: 420 * s,
            margin: "0 auto",
          }}
        >
          {calendarDays.map((hasEntry, i) => {
            const row = Math.floor(i / 7);
            const col = i % 7;
            const cellDelay = 12 + row * 3 + col * 1;

            const cellSpring = spring({
              frame: Math.max(0, frame - cellDelay),
              fps,
              config: { damping: 12, stiffness: 200 },
            });

            // Highlight day 15 after frame 50
            const isSelected = i === 14 && frame > 50;

            return (
              <div
                key={i}
                style={{
                  width: 44 * s,
                  height: 44 * s,
                  borderRadius: 10 * s,
                  backgroundColor: isSelected
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.02)",
                  border: `${1 * s}px solid ${isSelected ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${cellSpring})`,
                  opacity: cellSpring,
                }}
              >
                <div
                  style={{
                    width: 8 * s,
                    height: 8 * s,
                    borderRadius: "50%",
                    backgroundColor: hasEntry
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(255,255,255,0.08)",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Friend streaks */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24 * s,
            marginTop: 36 * s,
          }}
        >
          {friends.map((friend, i) => {
            const friendSpring = spring({
              frame: Math.max(0, frame - 60 - i * 6),
              fps,
              config: { damping: 12, stiffness: 150 },
            });

            return (
              <div
                key={friend.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10 * s,
                  opacity: friendSpring,
                  transform: `translateX(${(1 - friendSpring) * 30 * s}px)`,
                }}
              >
                <div
                  style={{
                    width: 32 * s,
                    height: 32 * s,
                    borderRadius: "50%",
                    backgroundColor: friend.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12 * s,
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  {friend.name[0]}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 12 * s,
                      color: "rgba(255,255,255,0.6)",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {friend.name}
                  </p>
                  <p
                    style={{
                      fontSize: 11 * s,
                      color: "rgba(255,255,255,0.3)",
                      margin: 0,
                    }}
                  >
                    {friend.streak}d streak
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
