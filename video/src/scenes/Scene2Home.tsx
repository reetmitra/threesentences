import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AppWindow } from "../components/AppWindow";

export const Scene2Home: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // "Spring-animated fade-in with staggered delays (title -> tagline -> input -> controls)."

    // Scene entrance
    const sceneScale = spring({ frame, fps, config: { damping: 14 } });
    const sceneOpacity = interpolate(frame, [0, 10], [0, 1]);

    const popIn = (delay: number) => {
        const s = spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: { damping: 12, stiffness: 150 },
        });
        return {
            opacity: interpolate(s, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px) scale(${interpolate(
                s,
                [0, 1],
                [0.9, 1]
            )})`,
        };
    };

    return (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ opacity: sceneOpacity, transform: `scale(${interpolate(sceneScale, [0, 1], [0.95, 1])})` }}>
                <AppWindow width={960} height={600} title="OpenClawd">
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            padding: 40,
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        {/* Title */}
                        <h1
                            style={{
                                ...popIn(10),
                                fontFamily: 'Georgia, serif',
                                fontSize: 64,
                                color: "#fafaf9",
                                margin: 0,
                                fontWeight: "normal",
                            }}
                        >
                            OpenClawd
                        </h1>

                        {/* Tagline */}
                        <p
                            style={{
                                ...popIn(20),
                                fontSize: 20,
                                color: "#a8a29e",
                                marginTop: 12,
                                marginBottom: 48,
                            }}
                        >
                            Open Source Alternative to Claude Cowork
                        </p>

                        {/* Input Wrapper */}
                        <div
                            style={{
                                ...popIn(30),
                                width: "100%",
                                maxWidth: 680,
                                background: "#292524",
                                borderRadius: 24,
                                padding: "16px 24px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                                border: "1px solid #44403c",
                                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 18,
                                    color: "#78716c", // dim text
                                    padding: "8px 0",
                                }}
                            >
                                What are we working on?
                            </div>

                            {/* Controls */}
                            <div
                                style={{
                                    ...popIn(40),
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                {/* Left chips */}
                                <div style={{ display: "flex", gap: 8 }}>
                                    <div
                                        style={{
                                            padding: "6px 12px",
                                            background: "#1c1917",
                                            borderRadius: 16,
                                            fontSize: 13,
                                            color: "#fbbf24", // amber
                                            border: "1px solid #44403c",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                        }}
                                    >
                                        <span style={{ fontSize: 16 }}>⚡️</span> Claude Code
                                    </div>
                                    <div
                                        style={{
                                            padding: "6px 12px",
                                            background: "#1c1917",
                                            borderRadius: 16,
                                            fontSize: 13,
                                            color: "#fafaf9",
                                            border: "1px solid #44403c",
                                        }}
                                    >
                                        Opus 4.6
                                    </div>
                                    <div
                                        style={{
                                            padding: "6px 12px",
                                            background: "#1c1917",
                                            borderRadius: 16,
                                            fontSize: 13,
                                            color: "#a8a29e",
                                            border: "1px solid #44403c",
                                        }}
                                    >
                                        + Attach
                                    </div>
                                </div>

                                {/* Send Button */}
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        background: "#fbbf24",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c0a09" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="19" x2="12" y2="5"></line>
                                        <polyline points="5 12 12 5 19 12"></polyline>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </AppWindow>
            </div>
        </AbsoluteFill>
    );
};
