import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { useScale } from "../shared/tokens";
import { fi, fo, getTyped, blurOut } from "../shared/helpers";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "400", "500"],
  subsets: ["latin"],
});

const reflectionText =
  "You\u2019ve been writing about momentum a lot this month. There\u2019s a shift happening \u2014 you\u2019re moving from planning to executing. The entries where you mention shipping feel different. More alive. Trust that.";

/**
 * Scene 4: "The Mirror" (190 frames / ~6.3s)
 * Left-right split: text left, AI reflection card right.
 * Card has glass morphism, animated gradient border, smooth 3D entrance.
 * Typewriter text with smooth cursor. Scan line effect on card.
 */
export const S4_Mirror: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useScale();

  // ─── Left side text stagger (spring-based for organic feel) ────
  const labelSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 18, stiffness: 80, mass: 1 },
  });

  const headingSpring = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 16, stiffness: 70, mass: 1.2 },
  });

  const descSpring = spring({
    frame: Math.max(0, frame - 32),
    fps,
    config: { damping: 18, stiffness: 80, mass: 1 },
  });

  // ─── Right side card (3D tilt entrance) ───────────────────────
  const cardSpring = spring({
    frame: Math.max(0, frame - 22),
    fps,
    config: { damping: 16, stiffness: 60, mass: 1.3 },
  });
  const cardRotateX = (1 - cardSpring) * 10;
  const cardRotateY = (1 - cardSpring) * -4;
  const cardY = (1 - cardSpring) * 80 * s;

  // ─── Typewriter text in card ──────────────────────────────────
  const typedReflection = getTyped(frame, reflectionText, 45, 0.6);

  // ─── Pulsing dot (smooth sine) ────────────────────────────────
  const dotPulse = Math.sin(frame * 0.08) * 0.3 + 0.7;
  const dotGlow = Math.sin(frame * 0.08) * 0.15 + 0.15;

  // ─── Smooth cursor blink ──────────────────────────────────────
  const cursorOpacity =
    typedReflection.length < reflectionText.length
      ? Math.sin(frame * 0.15) * 0.35 + 0.65
      : 0;

  // ─── Scan line effect on card ─────────────────────────────────
  const scanLineY = interpolate(
    frame % 90,
    [0, 90],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scanLineOpacity = frame > 40
    ? interpolate(frame, [40, 55], [0, 0.04], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // ─── Animated gradient border position ────────────────────────
  const borderAngle = (frame * 1.5) % 360;

  // ─── Exit ─────────────────────────────────────────────────────
  const exitOpacity = fo(frame, 170, 20);
  const exitScale = interpolate(frame, [170, 190], [1, 0.96], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitBlur = blurOut(frame, 170, 20, 8);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
        filter: exitBlur,
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 1400 * s,
          height: 800 * s,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 60% 50%, rgba(255,255,255,0.04) 0%, transparent 65%)",
          right: "5%",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 100 * s,
          maxWidth: 2800 * s,
          width: "100%",
          padding: `0 ${200 * s}px`,
        }}
      >
        {/* Left: Text content */}
        <div style={{ flex: 1 }}>
          {/* Decorative line */}
          <div
            style={{
              width: interpolate(frame, [5, 25], [0, 60 * s], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              height: 1 * s,
              backgroundColor: "rgba(255,255,255,0.15)",
              marginBottom: 20 * s,
              opacity: labelSpring,
            }}
          />

          <p
            style={{
              fontSize: 14 * s,
              fontWeight: 400,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 18 * s,
              opacity: labelSpring,
              transform: `translateY(${(1 - labelSpring) * 20 * s}px)`,
            }}
          >
            Your AI Mirror
          </p>
          <h2
            style={{
              fontSize: 68 * s,
              fontWeight: 300,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.15,
              margin: 0,
              opacity: headingSpring,
              transform: `translateY(${(1 - headingSpring) * 30 * s}px)`,
              letterSpacing: "-0.025em",
            }}
          >
            Patterns you can&apos;t
            <br />
            see yourself.
          </h2>
          <p
            style={{
              fontSize: 20 * s,
              fontWeight: 300,
              color: "rgba(255,255,255,0.22)",
              lineHeight: 1.6,
              marginTop: 28 * s,
              maxWidth: 500 * s,
              opacity: descSpring,
              transform: `translateY(${(1 - descSpring) * 18 * s}px)`,
            }}
          >
            Not advice. Not therapy. Just a mirror.
          </p>
        </div>

        {/* Right: AI Reflection card */}
        <div
          style={{
            flex: 1,
            maxWidth: 540 * s,
            perspective: 1400 * s,
          }}
        >
          <div
            style={{
              transform: `translateY(${cardY}px) rotateX(${cardRotateX}deg) rotateY(${cardRotateY}deg)`,
              transformOrigin: "center bottom",
              opacity: cardSpring,
            }}
          >
            {/* Card with animated border */}
            <div
              style={{
                position: "relative",
                borderRadius: 24 * s,
                padding: 1 * s,
                background: `linear-gradient(${borderAngle}deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03), rgba(255,255,255,0.08))`,
              }}
            >
              <div
                style={{
                  borderRadius: 23 * s,
                  padding: `${30 * s}px ${30 * s}px`,
                  backgroundColor: "rgba(12,12,12,0.95)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Scan line effect */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${scanLineY}%`,
                    height: 40 * s,
                    background:
                      "linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)",
                    opacity: scanLineOpacity,
                    pointerEvents: "none",
                  }}
                />

                {/* Card header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10 * s,
                    marginBottom: 6 * s,
                  }}
                >
                  {/* Pulsing dot with glow */}
                  <div
                    style={{
                      width: 8 * s,
                      height: 8 * s,
                      borderRadius: "50%",
                      backgroundColor: `rgba(255,255,255,${dotPulse * 0.35})`,
                      boxShadow: `0 0 ${6 * s}px rgba(255,255,255,${dotGlow})`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11 * s,
                      color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    AI Reflection
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 10 * s,
                    color: "rgba(255,255,255,0.15)",
                    marginBottom: 18 * s,
                  }}
                >
                  30-day analysis
                </p>

                <div
                  style={{
                    height: 1 * s,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    marginBottom: 18 * s,
                  }}
                />

                {/* Typewriter content */}
                <div style={{ minHeight: 130 * s }}>
                  <p
                    style={{
                      fontSize: 14 * s,
                      color: "rgba(255,255,255,0.38)",
                      lineHeight: 1.75,
                      margin: 0,
                    }}
                  >
                    {typedReflection}
                    {typedReflection.length < reflectionText.length && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 1.5 * s,
                          height: 14 * s,
                          backgroundColor: "rgba(255,255,255,0.4)",
                          marginLeft: 1 * s,
                          verticalAlign: "text-bottom",
                          opacity: cursorOpacity,
                          borderRadius: 1 * s,
                        }}
                      />
                    )}
                  </p>
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 18 * s,
                  }}
                >
                  <p
                    style={{
                      fontSize: 10 * s,
                      color: "rgba(255,255,255,0.1)",
                      margin: 0,
                    }}
                  >
                    Based on 28 entries
                  </p>
                  <div
                    style={{
                      width: 30 * s,
                      height: 2 * s,
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
