import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const BG = "#000000";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#A0A0A0";
const SURFACE = "#121212";
const BORDER = "#2A2A2A";

const FEATURES = [
    { icon: "✍️", label: "Three Sentences Daily" },
    { icon: "🤖", label: "AI-Powered Reflections" },
    { icon: "📅", label: "363-Day Streak Tracker" },
    { icon: "👥", label: "Private Accountability Circle" },
    { icon: "🧭", label: "Built-in Philosophy Guide" },
];

export const TS_Scene7Features: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const fadeOut = interpolate(frame, [140, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            opacity: fadeOut,
        }}>
            {/* Section label */}
            <div style={{
                fontSize: 12, fontWeight: 600, color: TEXT_SEC,
                letterSpacing: 3, textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
                marginBottom: 40,
                opacity: interpolate(frame, [5, 18], [0, 1], { extrapolateRight: "clamp" }),
            }}>
                EVERYTHING YOU NEED
            </div>

            {/* Feature pills */}
            <div style={{
                display: "flex", flexDirection: "column",
                gap: 14, alignItems: "center",
                fontFamily: "Inter, sans-serif",
            }}>
                {FEATURES.map((feat, i) => {
                    const delay = i * 6;
                    const s = spring({ frame: Math.max(0, frame - 15 - delay), fps, config: { damping: 12, stiffness: 160 } });
                    return (
                        <div key={i} style={{
                            opacity: interpolate(s, [0, 1], [0, 1]),
                            transform: `scale(${interpolate(s, [0, 1], [0.85, 1])}) translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
                            background: SURFACE,
                            border: `1px solid ${BORDER}`,
                            borderRadius: 50,
                            padding: "14px 32px",
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            minWidth: 320,
                        }}>
                            <span style={{ fontSize: 24 }}>{feat.icon}</span>
                            <span style={{ fontSize: 17, fontWeight: 500, color: TEXT }}>{feat.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Tagline */}
            <div style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 16, color: TEXT_SEC,
                textAlign: "center",
                marginTop: 48,
                maxWidth: 440,
                lineHeight: 1.6,
                opacity: interpolate(frame, [60, 75], [0, 1], { extrapolateRight: "clamp" }),
                transform: `translateY(${interpolate(frame, [60, 80], [15, 0], { extrapolateRight: "clamp" })}px)`,
            }}>
                A private community for high achievers who reflect daily.
            </div>
        </AbsoluteFill>
    );
};
