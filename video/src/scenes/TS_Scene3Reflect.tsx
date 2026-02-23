import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const BG = "#000000";
const SURFACE = "#121212";
const BORDER = "#2A2A2A";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#A0A0A0";
const TEXT_MUTED = "#666666";

const REFLECT_TEXT =
    "Over the past 30 days, you've shown up consistently. " +
    "22 of 30 entries mention intentional mornings — your biggest growth area. " +
    "You're building real momentum. Keep protecting that first hour.";

const TIME_RANGES = ["7 days", "30 days", "90 days"];

export const TS_Scene3Reflect: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Scene entrance
    const sceneSpring = spring({ frame, fps, config: { damping: 14 } });
    const sceneOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
    const sceneScale = interpolate(sceneSpring, [0, 1], [0.95, 1]);

    // Scene fade out
    const fadeOut = interpolate(frame, [140, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Panels
    const panelIn = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" });
    const selectedRange = frame >= 35 ? 1 : -1; // "30 days" selected

    // Generate button click
    const genBtnClick = frame >= 55;
    const genBtnScale = genBtnClick
        ? interpolate(frame, [55, 60, 66], [1, 0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : 1;
    const showGenerating = frame >= 58 && frame < 80;

    // Reflection card
    const cardSpring = spring({ frame: Math.max(0, frame - 78), fps, config: { damping: 18, stiffness: 90 } });
    const cardY = interpolate(cardSpring, [0, 1], [40, 0]);
    const cardOpacity = frame >= 78 ? interpolate(frame, [78, 90], [0, 1], { extrapolateRight: "clamp" }) : 0;

    // Typewriter in card
    const textChars = frame >= 88
        ? Math.floor(interpolate(frame, [88, 135], [0, REFLECT_TEXT.length], { extrapolateRight: "clamp" }))
        : 0;
    const showCursor = textChars < REFLECT_TEXT.length && frame >= 88;
    const blink = Math.floor(frame / 12) % 2 === 0;

    return (
        <AbsoluteFill style={{
            alignItems: "center", justifyContent: "center",
            opacity: sceneOpacity * fadeOut,
        }}>
            <div style={{
                width: 420,
                fontFamily: "Inter, sans-serif",
                transform: `scale(${sceneScale})`,
            }}>
                {/* Header */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 22, fontWeight: 600, color: TEXT, letterSpacing: "-0.02em", marginBottom: 4 }}>
                        Reflect
                    </div>
                    <div style={{ fontSize: 13, color: TEXT_SEC }}>
                        AI-powered insights from your entries
                    </div>
                </div>

                {/* Generate card */}
                <div style={{
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: 18,
                    marginBottom: 12,
                    opacity: panelIn,
                }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, marginBottom: 3 }}>Generate Reflection</div>
                    <div style={{ fontSize: 12, color: TEXT_SEC, marginBottom: 14 }}>Select a time range to analyze</div>

                    {/* Time range pills */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        {TIME_RANGES.map((label, i) => {
                            const sel = selectedRange === i;
                            return (
                                <div key={i} style={{
                                    flex: 1, height: 36, borderRadius: 10,
                                    background: sel ? TEXT : "transparent",
                                    border: `1.5px solid ${sel ? TEXT : BORDER}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 12, fontWeight: sel ? 600 : 400,
                                    color: sel ? BG : TEXT_SEC,
                                }}>
                                    {label}
                                </div>
                            );
                        })}
                    </div>

                    {/* Generate button */}
                    <div style={{
                        height: 44, borderRadius: 10, background: TEXT,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 600, color: BG,
                        transform: `scale(${genBtnScale})`,
                    }}>
                        {showGenerating ? "Generating..." : "Generate Reflection"}
                    </div>
                </div>

                {/* Reflection result card */}
                {frame >= 78 && (
                    <div style={{
                        background: SURFACE,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 12,
                        padding: 18,
                        opacity: cardOpacity,
                        transform: `translateY(${cardY}px)`,
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                            <span style={{ fontSize: 12, color: TEXT_SEC }}>Jan 23 – Feb 22, 2026</span>
                            <span style={{
                                fontSize: 10, color: TEXT_SEC, background: "#1E1E1E",
                                padding: "2px 6px", borderRadius: 6, fontWeight: 500,
                            }}>30 days</span>
                        </div>
                        <p style={{
                            fontSize: 13, color: TEXT, lineHeight: 1.7, margin: 0,
                            letterSpacing: "-0.01em",
                        }}>
                            {REFLECT_TEXT.slice(0, textChars)}
                            {showCursor && (
                                <span style={{
                                    display: "inline-block", width: 1.5, height: "1em",
                                    background: TEXT, marginLeft: 2,
                                    opacity: blink ? 0.85 : 0,
                                    verticalAlign: "text-bottom",
                                }} />
                            )}
                        </p>
                        {textChars >= REFLECT_TEXT.length && (
                            <div style={{
                                marginTop: 12, paddingTop: 12,
                                borderTop: `1px solid ${BORDER}`,
                                fontSize: 11, color: TEXT_MUTED,
                            }}>
                                Based on 28 entries · Generated by AI
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};
