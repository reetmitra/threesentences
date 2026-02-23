import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { GlowOrb } from "../shared/GlowOrb";
import { useScale, TEXT, TEXT_SEC, TEXT_MUTED, BG } from "../shared/tokens";
import { fi, fo, getTyped, blurOut } from "../shared/helpers";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

// ─── TIMING (frames relative to this Sequence) ─────────────────
const T_PANEL_IN = 0;
const T_HEADER_IN = 20;
const T_S1_START = 45;
const T_S1_END = 110;
const T_S2_START = 120;
const T_S2_END = 185;
const T_S3_START = 195;
const T_S3_END = 255;
const T_BTN_IN = 260;
const T_BTN_CLK = 272;
const T_BTN_LOAD = 278;
const T_BTN_CHECK = 292;
const T_MSG_IN = 298;
const T_EXIT = 305;

const sentences = [
  "I shipped the auth module and held deep focus for three hours.",
  "Felt scattered after lunch \u2014 I need to protect my afternoon block.",
  "Tomorrow I tackle the hardest task before opening my inbox.",
];

// ─── SENTENCE ROW ───────────────────────────────────────────────
const SentenceRow: React.FC<{
  num: number;
  typed: string;
  active: boolean;
  done: boolean;
  s: number;
  frame: number;
  enterFrame: number;
  fps: number;
}> = ({ num, typed, active, done, s, frame, enterFrame, fps }) => {
  const rowSpring = spring({
    frame: Math.max(0, frame - enterFrame + 5),
    fps,
    config: { damping: 18, stiffness: 90, mass: 1 },
  });

  // Smooth cursor blink (sine wave)
  const cursorOpacity = active ? Math.sin(frame * 0.15) * 0.35 + 0.65 : 0;

  return (
    <div
      style={{
        display: "flex",
        gap: 14 * s,
        alignItems: "flex-start",
        padding: `${14 * s}px ${18 * s}px`,
        borderRadius: 14 * s,
        backgroundColor: active
          ? "rgba(255,255,255,0.04)"
          : done
            ? "rgba(255,255,255,0.015)"
            : "transparent",
        border: `${1 * s}px solid ${
          active
            ? "rgba(255,255,255,0.1)"
            : done
              ? "rgba(255,255,255,0.03)"
              : "transparent"
        }`,
        opacity: rowSpring,
        transform: `translateY(${(1 - rowSpring) * 15 * s}px)`,
      }}
    >
      <span
        style={{
          fontSize: 13 * s,
          color: done ? "rgba(255,255,255,0.45)" : TEXT_MUTED,
          fontWeight: 500,
          minWidth: 22 * s,
          paddingTop: 3 * s,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {num}.
      </span>
      <p
        style={{
          fontSize: 15 * s,
          color: done ? TEXT_SEC : "rgba(255,255,255,0.75)",
          fontWeight: 400,
          lineHeight: 1.6,
          margin: 0,
          flex: 1,
          letterSpacing: "0.01em",
        }}
      >
        {typed}
        {active && (
          <span
            style={{
              display: "inline-block",
              width: 1.5 * s,
              height: 16 * s,
              backgroundColor: "rgba(255,255,255,0.7)",
              marginLeft: 1 * s,
              verticalAlign: "text-bottom",
              opacity: cursorOpacity,
              borderRadius: 1 * s,
            }}
          />
        )}
      </p>
    </div>
  );
};

/**
 * Scene 3: "The App" (320 frames / ~10.7s)
 * Floating glass UI panel with typing demo, counter, submit interaction.
 * No phone frame -- clean, floating in space with ambient glow.
 */
export const S3_App: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();

  // ─── Panel entrance (float up with gentle perspective) ─────────
  const panelSpring = spring({
    frame: Math.max(0, frame - T_PANEL_IN),
    fps,
    config: { damping: 18, stiffness: 55, mass: 1.5 },
  });
  const panelY = (1 - panelSpring) * 200 * s;
  const panelRotateX = (1 - panelSpring) * 8;
  const panelScale = 0.92 + panelSpring * 0.08;
  const panelOpacity = interpolate(
    frame,
    [T_PANEL_IN, T_PANEL_IN + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ─── Header entrance ───────────────────────────────────────────
  const headerSpring = spring({
    frame: Math.max(0, frame - T_HEADER_IN),
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  // ─── Typing state ─────────────────────────────────────────────
  const typed1 = getTyped(frame, sentences[0], T_S1_START, 0.55);
  const typed2 = getTyped(frame, sentences[1], T_S2_START, 0.55);
  const typed3 = getTyped(frame, sentences[2], T_S3_START, 0.55);

  const count =
    (typed1.length >= sentences[0].length ? 1 : 0) +
    (typed2.length >= sentences[1].length ? 1 : 0) +
    (typed3.length >= sentences[2].length ? 1 : 0);

  const active1 = frame >= T_S1_START && frame < T_S1_END;
  const active2 = frame >= T_S2_START && frame < T_S2_END;
  const active3 = frame >= T_S3_START && frame < T_S3_END;

  // ─── Counter animation ─────────────────────────────────────────
  const counterTrigger =
    count === 1 ? T_S1_END : count === 2 ? T_S2_END : T_S3_END;
  const counterScale =
    count > 0
      ? 0.85 +
        spring({
          frame: Math.max(0, frame - counterTrigger),
          fps,
          config: { damping: 8, stiffness: 250, mass: 0.6 },
        }) *
          0.15
      : 1;

  // ─── Submit button states ─────────────────────────────────────
  const btnSpring = spring({
    frame: Math.max(0, frame - T_BTN_IN),
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const btnClicked = frame >= T_BTN_CLK;
  const btnLoading = frame >= T_BTN_LOAD && frame < T_BTN_CHECK;
  const btnDone = frame >= T_BTN_CHECK;

  const btnPressScale = btnClicked
    ? spring({
        frame: Math.max(0, frame - T_BTN_CLK),
        fps,
        config: { damping: 10, stiffness: 300, mass: 0.5 },
      })
    : 1;

  const btnWidth = btnDone
    ? interpolate(frame, [T_BTN_LOAD, T_BTN_CHECK], [200 * s, 50 * s], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 200 * s;

  const btnRadius = btnDone
    ? interpolate(frame, [T_BTN_LOAD, T_BTN_CHECK], [14 * s, 25 * s], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 14 * s;

  const checkSpring = btnDone
    ? spring({
        frame: Math.max(0, frame - T_BTN_CHECK),
        fps,
        config: { damping: 8, stiffness: 200 },
      })
    : 0;

  // ─── "See you tomorrow" message ───────────────────────────────
  const msgSpring = spring({
    frame: Math.max(0, frame - T_MSG_IN),
    fps,
    config: { damping: 16, stiffness: 80 },
  });

  // ─── Exit: blur + fade + scale ────────────────────────────────
  const exitOpacity = fo(frame, T_EXIT, 15);
  const exitBlur = blurOut(frame, T_EXIT, 15, 10);
  const exitScale = interpolate(frame, [T_EXIT, T_EXIT + 15], [1, 0.97], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── Shimmer highlight sweeping across the panel ───────────────
  const shimmerX = interpolate(frame, [0, 320], [-100, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const panelW = 560 * s;
  const panelH = 680 * s;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        opacity: exitOpacity,
        filter: exitBlur,
        transform: `scale(${exitScale})`,
      }}
    >
      {/* Background glow */}
      <GlowOrb x="50%" y="48%" size={1000 * s} />
      <GlowOrb x="45%" y="55%" size={600 * s} />

      {/* Floating glass panel */}
      <div style={{ perspective: 2400 * s, opacity: panelOpacity }}>
        <div
          style={{
            transform: `translateY(${panelY}px) rotateX(${panelRotateX}deg) scale(${panelScale})`,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              width: panelW,
              height: panelH,
              borderRadius: 28 * s,
              backgroundColor: "rgba(255,255,255,0.025)",
              border: `${1 * s}px solid rgba(255,255,255,0.08)`,
              boxShadow: [
                `0 ${50 * s}px ${100 * s}px -${20 * s}px rgba(0,0,0,0.5)`,
                `0 ${4 * s}px ${20 * s}px rgba(0,0,0,0.2)`,
                `inset 0 ${1 * s}px 0 rgba(255,255,255,0.05)`,
              ].join(", "),
              padding: `${36 * s}px ${28 * s}px ${28 * s}px`,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Shimmer */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 28 * s,
                background: `linear-gradient(105deg, transparent ${shimmerX - 20}%, rgba(255,255,255,0.03) ${shimmerX}%, transparent ${shimmerX + 20}%)`,
                pointerEvents: "none",
              }}
            />

            {/* Top edge highlight */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: 1 * s,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                borderRadius: 1 * s,
              }}
            />

            {/* Header */}
            <div
              style={{
                textAlign: "center",
                marginBottom: 24 * s,
                opacity: headerSpring,
                transform: `translateY(${(1 - headerSpring) * 10 * s}px)`,
              }}
            >
              <p
                style={{
                  fontSize: 10 * s,
                  color: TEXT_MUTED,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Saturday, February 22
              </p>
              <h2
                style={{
                  fontSize: 24 * s,
                  fontWeight: 600,
                  color: TEXT,
                  margin: `${10 * s}px 0 0`,
                  letterSpacing: "-0.02em",
                }}
              >
                Three Sentences
              </h2>
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1 * s,
                backgroundColor: "rgba(255,255,255,0.06)",
                marginBottom: 20 * s,
                opacity: headerSpring,
              }}
            />

            {/* Sentence rows */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10 * s,
                flex: 1,
              }}
            >
              <SentenceRow
                num={1}
                typed={typed1}
                active={active1}
                done={typed1.length >= sentences[0].length}
                s={s}
                frame={frame}
                enterFrame={T_S1_START}
                fps={fps}
              />
              <SentenceRow
                num={2}
                typed={typed2}
                active={active2}
                done={typed2.length >= sentences[1].length}
                s={s}
                frame={frame}
                enterFrame={T_S2_START}
                fps={fps}
              />
              <SentenceRow
                num={3}
                typed={typed3}
                active={active3}
                done={typed3.length >= sentences[2].length}
                s={s}
                frame={frame}
                enterFrame={T_S3_START}
                fps={fps}
              />
            </div>

            {/* Counter */}
            <div style={{ textAlign: "center", marginTop: 20 * s }}>
              <span
                style={{
                  fontSize: 16 * s,
                  fontWeight: 600,
                  color:
                    count === 3
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.25)",
                  fontVariantNumeric: "tabular-nums",
                  transform: `scale(${counterScale})`,
                  display: "inline-block",
                  letterSpacing: "0.05em",
                }}
              >
                {count}/3
              </span>
            </div>

            {/* Submit button */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 16 * s,
                opacity: btnSpring,
                transform: `translateY(${(1 - btnSpring) * 8 * s}px)`,
              }}
            >
              <div
                style={{
                  width: btnWidth,
                  height: 50 * s,
                  borderRadius: btnRadius,
                  backgroundColor: btnDone
                    ? "rgba(80,200,120,0.9)"
                    : "rgba(255,255,255,0.95)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${btnPressScale})`,
                  boxShadow: btnDone
                    ? `0 0 ${20 * s}px rgba(80,200,120,0.3)`
                    : "none",
                }}
              >
                {btnDone ? (
                  <span
                    style={{
                      fontSize: 22 * s,
                      color: "white",
                      transform: `scale(${checkSpring})`,
                      display: "inline-block",
                    }}
                  >
                    {"\u2713"}
                  </span>
                ) : btnLoading ? (
                  <div style={{ display: "flex", gap: 5 * s }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 6 * s,
                          height: 6 * s,
                          borderRadius: "50%",
                          backgroundColor: BG,
                          opacity:
                            0.3 +
                            Math.sin(
                              (frame - T_BTN_LOAD) * 0.25 + i * 1.2,
                            ) *
                              0.4 +
                            0.3,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: 15 * s,
                      fontWeight: 600,
                      color: BG,
                      letterSpacing: "0.02em",
                    }}
                  >
                    Done
                  </span>
                )}
              </div>
            </div>

            {/* "See you tomorrow" */}
            {frame >= T_MSG_IN && (
              <p
                style={{
                  fontSize: 12 * s,
                  color: TEXT_MUTED,
                  textAlign: "center",
                  marginTop: 14 * s,
                  opacity: msgSpring,
                  transform: `translateY(${(1 - msgSpring) * 8 * s}px)`,
                }}
              >
                You&apos;ve already journaled today. See you tomorrow.
              </p>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
