import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const BG = "#000000";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#A0A0A0";
const TEXT_MUTED = "#666666";

export const TS_Scene1Brand: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // "THREE" kinetic text reveal
    const threeSpring = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
    const threeScale = interpolate(threeSpring, [0, 1], [0.7, 1]);
    const threeOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

    // "Three Sentences. Every day."
    const tagOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });
    const tagY = interpolate(frame, [25, 45], [20, 0], { extrapolateRight: "clamp" });

    // "Be better, do better."
    const subOpacity = interpolate(frame, [45, 60], [0, 1], { extrapolateRight: "clamp" });

    // "by 363™"
    const brandOpacity = interpolate(frame, [65, 78], [0, 1], { extrapolateRight: "clamp" });

    // Vertical gradient line + pulsing dot (matching landing page)
    const lineOpacity = interpolate(frame, [70, 85], [0, 1], { extrapolateRight: "clamp" });
    const dotPulse = Math.sin(frame * 0.12) * 0.3 + 0.7;

    // Scene fade out
    const fadeOut = interpolate(frame, [100, 120], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
        <AbsoluteFill
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: BG,
                opacity: fadeOut,
            }}
        >
            {/* Main Title */}
            <div
                style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 120,
                    fontWeight: 300,
                    color: TEXT,
                    letterSpacing: "-0.03em",
                    opacity: threeOpacity,
                    transform: `scale(${threeScale})`,
                    fontStyle: "italic",
                }}
            >
                THREE
            </div>

            {/* Tagline */}
            <div
                style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 22,
                    fontWeight: 300,
                    color: TEXT_SEC,
                    letterSpacing: "0.08em",
                    marginTop: 32,
                    opacity: tagOpacity,
                    transform: `translateY(${tagY}px)`,
                }}
            >
                Three Sentences. Every day.
            </div>

            {/* Subtitle */}
            <div
                style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 18,
                    fontWeight: 300,
                    color: TEXT_MUTED,
                    fontStyle: "italic",
                    marginTop: 16,
                    opacity: subOpacity,
                }}
            >
                Be better, do better.
            </div>

            {/* by 363™ */}
            <div
                style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: TEXT_MUTED,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginTop: 20,
                    opacity: brandOpacity,
                }}
            >
                by 363™
            </div>

            {/* Vertical line + pulsing dot */}
            <div
                style={{
                    position: "absolute",
                    bottom: 60,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    opacity: lineOpacity,
                }}
            >
                <div
                    style={{
                        width: 1,
                        height: 64,
                        background: `linear-gradient(to bottom, transparent, rgba(255,255,255,0.2))`,
                    }}
                />
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        background: `rgba(255,255,255,${dotPulse})`,
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};
