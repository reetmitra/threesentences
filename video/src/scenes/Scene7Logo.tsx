import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene7Logo: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Three sub-scenes: 
    // (a) Intro with converging amber lines
    // (b) "✦ Introducing ✦" with word-by-word reveal
    // (c) 8 provider icons

    const phaseB = Math.max(0, frame - 50);
    const phaseC = Math.max(0, frame - 110);

    // Background Grid
    const opacityGrid = interpolate(frame, [0, 10], [0, 0.3]);

    // Phase A: Converging Lines
    const centerScale = spring({ frame, fps, config: { damping: 14 } });
    const lineYTop = interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [-500, -100]);
    const lineYBot = interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [500, 100]);
    const ringOpacity = interpolate(frame, [40, 55], [1, 0], { extrapolateRight: "clamp" });

    const providers = ["Claude", "OpenAI", "Gemini", "DeepSeek", "Llama", "Ollama", "MiniMax", "Grok"];

    return (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "#0c0a09", overflow: "hidden" }}>

            {/* Background Grid */}
            <div style={{
                position: "absolute", width: "200%", height: "200%",
                opacity: opacityGrid,
                backgroundImage: "linear-gradient(#292524 1px, transparent 1px), linear-gradient(90deg, #292524 1px, transparent 1px)",
                backgroundSize: "60px 60px",
                transform: `rotateX(45deg) translateY(${interpolate(frame, [0, 180], [0, 200])}px)`
            }} />

            {/* Phase A Burst */}
            {frame < 60 && (
                <div style={{ position: "absolute", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: ringOpacity }}>
                    <div style={{ position: "absolute", width: 4, height: 400, background: `linear-gradient(to bottom, transparent, #fbbf24)`, transform: `translateY(${lineYTop}px)` }} />
                    <div style={{ position: "absolute", width: 4, height: 400, background: `linear-gradient(to top, transparent, #fbbf24)`, transform: `translateY(${lineYBot}px)` }} />
                    <div style={{ position: "absolute", width: 200, height: 200, borderRadius: 100, border: "2px solid #fbbf24", transform: `scale(${interpolate(centerScale, [0, 1], [0, 2.5])})`, opacity: interpolate(frame, [30, 50], [1, 0], { extrapolateRight: "clamp" }) }} />
                </div>
            )}

            {/* Phase B IntroText */}
            <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10 }}>
                {frame >= 50 && (
                    <div style={{ opacity: interpolate(phaseC, [0, 15], [1, 0], { extrapolateRight: "clamp" }), transform: `translateY(${interpolate(phaseC, [0, 15], [0, -40], { extrapolateRight: "clamp" })}px)`, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Georgia, serif" }}>
                        <div style={{ fontSize: 24, color: "#fbbf24", letterSpacing: 4, textTransform: "uppercase", marginBottom: 24, opacity: interpolate(phaseB, [0, 10], [0, 1]) }}>
                            ✦ Introducing ✦
                        </div>
                        <div style={{ fontSize: 72, color: "#fafaf9", fontWeight: "normal", textAlign: "center" }}>
                            <span style={{ opacity: interpolate(phaseB, [10, 20], [0, 1]), display: "inline-block", transform: `translateY(${interpolate(phaseB, [10, 20], [20, 0], { extrapolateRight: "clamp" })}px)` }}>Open</span>{" "}
                            <span style={{ opacity: interpolate(phaseB, [20, 30], [0, 1]), display: "inline-block", transform: `translateY(${interpolate(phaseB, [20, 30], [20, 0], { extrapolateRight: "clamp" })}px)` }}>Source</span>{" "}
                            <span style={{ opacity: interpolate(phaseB, [30, 40], [0, 1]), display: "inline-block", transform: `translateY(${interpolate(phaseB, [30, 40], [20, 0], { extrapolateRight: "clamp" })}px)` }}>AI</span>{" "}
                            <span style={{ opacity: interpolate(phaseB, [40, 50], [0, 1]), display: "inline-block", transform: `translateY(${interpolate(phaseB, [40, 50], [20, 0], { extrapolateRight: "clamp" })}px)` }}>Desktop</span>
                        </div>
                    </div>
                )}

                {/* Phase C Logos */}
                {frame >= 110 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80, fontFamily: "Inter, sans-serif" }}>

                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, maxWidth: 800, marginBottom: 48 }}>
                            {providers.map((p, i) => {
                                const pS = Math.max(0, phaseC - 10 - i * 3);
                                const s = spring({ frame: pS, fps, config: { damping: 14, stiffness: 180 } });
                                return (
                                    <div key={i} style={{
                                        transform: `scale(${interpolate(s, [0, 1], [0, 1])})`,
                                        background: "#1c1917",
                                        border: "1px solid #292524",
                                        padding: "16px 24px",
                                        borderRadius: 100,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12
                                    }}>
                                        <div style={{ width: 10, height: 10, borderRadius: 5, background: "#fbbf24" }} />
                                        <span style={{ fontSize: 18, color: "#fafaf9", fontWeight: 600 }}>{p}</span>
                                    </div>
                                )
                            })}
                        </div>

                        <div style={{ fontSize: 22, color: "#fbbf24", opacity: interpolate(phaseC, [40, 50], [0, 1]) }}>
                            Claude Code + OpenCode SDK <span style={{ color: "#78716c", margin: "0 12px" }}>·</span> 80+ models
                        </div>
                        <div style={{ fontSize: 20, color: "#a8a29e", marginTop: 16, opacity: interpolate(phaseC, [50, 60], [0, 1]) }}>
                            Desktop <span style={{ margin: "0 16px" }}>|</span> Messaging <span style={{ margin: "0 16px" }}>|</span> API
                        </div>

                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};
