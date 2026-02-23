import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AppWindow } from "../components/AppWindow";

export const Scene4Providers: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // "Two dropdown panels side by side... Staggered item reveals"

    const sceneScale = spring({ frame, fps, config: { damping: 14 } });
    const sceneOpacity = interpolate(frame, [0, 10], [0, 1]);

    const providers = [
        { name: "Claude Code", color: "#f59e0b" },
        { name: "OpenCode", color: "#fbbf24" },
        { name: "OpenAI", color: "#10b981" },
        { name: "Gemini", color: "#3b82f6" },
        { name: "DeepSeek", color: "#6366f1" },
        { name: "Llama 4", color: "#ec4899" },
        { name: "MiniMax", color: "#8b5cf6" },
        { name: "Ollama", color: "#a8a29e" },
    ];

    const models = [
        { name: "Opus 4.6", desc: "Best for complex coding tasks" },
        { name: "Sonnet 4.5", desc: "Fast and balanced performance" },
        { name: "GPT-5.3 Codex", desc: "Optimized for code generation" },
        { name: "o3-mini", desc: "Fast reasoning on small tasks" },
        { name: "Gemini 3 Pro", desc: "1M token context window" },
        { name: "DeepSeek Coder V2", desc: "Open source code model" },
        { name: "Llama-4-70b", desc: "Local execution via Ollama" },
    ];

    const renderItem = (i: number, children: React.ReactNode) => {
        const s = Math.max(0, frame - 15 - i * 3);
        const scale = spring({ frame: s, fps, config: { damping: 12, stiffness: 200 } });
        const op = interpolate(scale, [0, 1], [0, 1]);

        return (
            <div style={{ opacity: op, transform: `scale(${interpolate(scale, [0, 1], [0.9, 1])})` }}>
                {children}
            </div>
        );
    };

    return (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ opacity: sceneOpacity, transform: `scale(${interpolate(sceneScale, [0, 1], [0.95, 1])})`, width: "100%", display: "flex", justifyContent: "center" }}>
                <AppWindow width={860} height={560} title="Configuration">
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Inter, sans-serif", background: "#1c1917" }}>

                        <div style={{ display: "flex", flex: 1, padding: 32, gap: 32 }}>

                            {/* Left: Providers */}
                            <div style={{ flex: 1, background: "#18181b", borderRadius: 16, border: "1px solid #292524", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                                <div style={{ padding: "16px 20px", borderBottom: "1px solid #292524", background: "#1c1917" }}>
                                    <div style={{ fontSize: 13, color: "#78716c", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Provider</div>
                                </div>
                                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4, overflow: "hidden" }}>
                                    {providers.map((p, i) => renderItem(i, (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 8, background: i === 0 ? "#292524" : "transparent" }}>
                                            <div style={{ width: 12, height: 12, borderRadius: 6, background: p.color }} />
                                            <div style={{ fontSize: 15, color: i === 0 ? "#fafaf9" : "#a8a29e", fontWeight: i === 0 ? 600 : 400 }}>{p.name}</div>
                                            {i === 0 && (
                                                <div style={{ marginLeft: "auto" }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </div>
                                            )}
                                        </div>
                                    )))}
                                </div>
                            </div>

                            {/* Right: Models */}
                            <div style={{ flex: 1.5, background: "#18181b", borderRadius: 16, border: "1px solid #292524", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                                <div style={{ padding: "16px 20px", borderBottom: "1px solid #292524", background: "#1c1917" }}>
                                    <div style={{ fontSize: 13, color: "#78716c", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Model</div>
                                </div>
                                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4, overflow: "hidden" }}>
                                    {models.map((m, i) => renderItem(i + 2, (
                                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: 8, background: i === 0 ? "#292524" : "transparent" }}>
                                            <div>
                                                <div style={{ fontSize: 15, color: i === 0 ? "#fafaf9" : "#a8a29e", fontWeight: i === 0 ? 600 : 400 }}>{m.name}</div>
                                                <div style={{ fontSize: 12, color: "#78716c", marginTop: 2 }}>{m.desc}</div>
                                            </div>
                                            {i === 0 && (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            )}
                                        </div>
                                    )))}
                                </div>
                            </div>

                        </div>

                        {/* Bottom Tagline */}
                        <div style={{ padding: "20px 32px", borderTop: "1px solid #292524", background: "#18181b", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <div style={{ fontSize: 15, color: "#fbbf24", fontWeight: 500, opacity: interpolate(frame, [40, 50], [0, 1]) }}>
                                Claude Code + OpenCode SDK <span style={{ color: "#78716c", margin: "0 8px" }}>—</span> <span style={{ color: "#a8a29e" }}>20+ providers · Open Source models</span>
                            </div>
                        </div>

                    </div>
                </AppWindow>
            </div>
        </AbsoluteFill>
    );
};
