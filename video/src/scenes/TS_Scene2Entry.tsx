import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const BG = "#000000";
const SURFACE = "#121212";
const BORDER = "#2A2A2A";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#A0A0A0";
const TEXT_MUTED = "#666666";

const SENTENCES = [
    "I shipped the auth module and held deep focus for three hours.",
    "Felt scattered after lunch — I need to protect my afternoon block.",
    "Tomorrow I tackle the hardest task before opening my inbox.",
];

const T_APP_IN = 10;
const T_S1_START = 25;
const T_S1_END = 55;
const T_S2_START = 60;
const T_S2_END = 90;
const T_S3_START = 95;
const T_S3_END = 125;
const T_BTN_IN = 130;
const T_BTN_CLK = 138;
const T_LOADING = 145;
const T_CIRCLE = 152;
const T_CHECK = 158;
const T_DONE_MSG = 165;

const getTyped = (frame: number, text: string, start: number, end: number): string => {
    if (frame < start) return "";
    const dur = end - start;
    const elapsed = frame - start;
    const charsPerFrame = text.length / dur;
    return text.slice(0, Math.min(text.length, Math.floor(elapsed * charsPerFrame)));
};

// Phone frame component
const PhoneFrame: React.FC<{ children: React.ReactNode; opacity: number; scale: number }> = ({ children, opacity, scale }) => (
    <div style={{
        width: 380,
        height: 780,
        borderRadius: 44,
        border: "3px solid #333333",
        background: BG,
        overflow: "hidden",
        opacity,
        transform: `scale(${scale})`,
        boxShadow: "0 30px 60px -15px rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
    }}>
        {/* Notch */}
        <div style={{
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}>
            <div style={{
                width: 120,
                height: 24,
                borderRadius: 12,
                background: "#111",
            }} />
        </div>
        {/* Content */}
        <div style={{ flex: 1, padding: "0 20px 20px 20px", display: "flex", flexDirection: "column" }}>
            {children}
        </div>
    </div>
);

export const TS_Scene2Entry: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const appSpring = spring({ frame: Math.max(0, frame - T_APP_IN), fps, config: { damping: 14 } });
    const appScale = interpolate(appSpring, [0, 1], [0.9, 1]);
    const appOpacity = interpolate(frame, [T_APP_IN, T_APP_IN + 12], [0, 1], { extrapolateRight: "clamp" });

    // Scene fade out
    const fadeOut = interpolate(frame, [170, 180], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const isActive = (i: number) => frame >= [T_S1_START, T_S2_START, T_S3_START][i] && frame < [T_S1_END, T_S2_END, T_S3_END][i];
    const isFuture = (i: number) => frame < [T_S1_START, T_S2_START, T_S3_START][i];
    const typedTexts = [
        getTyped(frame, SENTENCES[0], T_S1_START, T_S1_END),
        getTyped(frame, SENTENCES[1], T_S2_START, T_S2_END),
        getTyped(frame, SENTENCES[2], T_S3_START, T_S3_END),
    ];

    const counterValue = frame >= T_S3_END ? 3 : frame >= T_S2_END ? 2 : frame >= T_S1_END ? 1 : frame >= T_S1_START ? 1 : 0;
    const blink = Math.floor(frame / 14) % 2 === 0;

    // Button states
    const btnOpacity = interpolate(frame, [T_BTN_IN, T_BTN_IN + 10], [0, 1], { extrapolateRight: "clamp" });
    const showDoneText = frame < T_LOADING;
    const showLoading = frame >= T_LOADING && frame < T_CIRCLE;
    const showCheck = frame >= T_CHECK;

    const shrinkSpring = spring({ frame: Math.max(0, frame - T_CIRCLE), fps, config: { damping: 25, stiffness: 120 } });
    const btnWidth = frame >= T_CIRCLE ? interpolate(shrinkSpring, [0, 1], [340, 48]) : 340;
    const btnRadius = frame >= T_CIRCLE ? interpolate(shrinkSpring, [0, 1], [12, 24]) : 12;

    const showDoneMsg = frame >= T_DONE_MSG;
    const doneMsgOpacity = interpolate(frame, [T_DONE_MSG, T_DONE_MSG + 12], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
            <PhoneFrame opacity={appOpacity} scale={appScale}>
                {/* Header */}
                <div style={{ marginBottom: 20, marginTop: 8 }}>
                    <div style={{
                        fontSize: 11,
                        color: TEXT_MUTED,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        marginBottom: 6,
                        fontWeight: 500,
                        fontFamily: "Inter, sans-serif",
                    }}>
                        SATURDAY, FEBRUARY 22
                    </div>
                    <div style={{
                        fontSize: 22,
                        fontWeight: 600,
                        color: TEXT,
                        letterSpacing: "-0.02em",
                        fontFamily: "Inter, sans-serif",
                    }}>
                        Three Sentences
                    </div>
                </div>

                {/* Sentence rows */}
                {SENTENCES.map((text, i) => {
                    const active = isActive(i);
                    const future = isFuture(i);
                    return (
                        <div key={i} style={{
                            background: SURFACE,
                            border: `1px solid ${active ? "rgba(255,255,255,0.20)" : BORDER}`,
                            borderRadius: 12,
                            padding: "12px 14px 12px 40px",
                            marginBottom: 8,
                            position: "relative",
                            minHeight: 48,
                            display: "flex",
                            alignItems: "center",
                        }}>
                            <span style={{
                                position: "absolute",
                                left: 14,
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontSize: 11,
                                fontWeight: 500,
                                color: active ? TEXT_SEC : TEXT_MUTED,
                                fontFamily: "monospace",
                            }}>{i + 1}</span>
                            <span style={{
                                fontSize: 13,
                                color: future ? TEXT_MUTED : TEXT,
                                lineHeight: 1.65,
                                fontWeight: 400,
                                fontFamily: "Inter, sans-serif",
                            }}>
                                {future ? "—" : typedTexts[i]}
                                {active && (
                                    <span style={{
                                        display: "inline-block",
                                        width: 1.5,
                                        height: "1em",
                                        background: TEXT,
                                        marginLeft: 2,
                                        opacity: blink ? 0.85 : 0,
                                        verticalAlign: "text-bottom",
                                    }} />
                                )}
                            </span>
                        </div>
                    );
                })}

                {/* Footer area */}
                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 16 }}>
                    {/* Counter */}
                    <div style={{
                        fontFamily: "monospace",
                        fontSize: 18,
                        fontWeight: 700,
                        letterSpacing: 3,
                        color: counterValue === 3 ? TEXT : TEXT_SEC,
                        alignSelf: "flex-start",
                    }}>
                        {counterValue}/3
                    </div>

                    {/* Submit button */}
                    {!showDoneMsg && (
                        <div style={{ opacity: btnOpacity, width: "100%", display: "flex", justifyContent: "center" }}>
                            <div style={{
                                width: btnWidth,
                                height: 48,
                                borderRadius: btnRadius,
                                background: TEXT,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                            }}>
                                {showDoneText && (
                                    <span style={{ fontSize: 14, fontWeight: 600, color: BG, fontFamily: "Inter, sans-serif" }}>Done</span>
                                )}
                                {showLoading && (
                                    <div style={{ display: "flex", gap: 5, position: "absolute" }}>
                                        {[0, 1, 2].map((dot) => {
                                            const elapsed = frame - T_LOADING;
                                            const bounce = Math.sin(elapsed * 0.25 - dot * 1.2);
                                            return (
                                                <div key={dot} style={{
                                                    width: 5, height: 5, borderRadius: 3, background: BG,
                                                    transform: `translateY(${bounce * 3}px)`,
                                                    opacity: elapsed > dot * 4 ? 0.8 : 0,
                                                }} />
                                            );
                                        })}
                                    </div>
                                )}
                                {showCheck && (
                                    <svg width={20} height={20} viewBox="0 0 24 24" style={{ position: "absolute" }}>
                                        <polyline points="4,13 9,18 20,6" fill="none" stroke={BG} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Done message */}
                    {showDoneMsg && (
                        <div style={{
                            textAlign: "center",
                            opacity: doneMsgOpacity,
                            fontFamily: "Inter, sans-serif",
                        }}>
                            <div style={{ fontSize: 13, color: TEXT_SEC, lineHeight: 1.6 }}>
                                You've already journaled today.
                            </div>
                            <div style={{ fontSize: 13, color: TEXT_SEC }}>
                                See you tomorrow.
                            </div>
                        </div>
                    )}
                </div>
            </PhoneFrame>
        </AbsoluteFill>
    );
};
