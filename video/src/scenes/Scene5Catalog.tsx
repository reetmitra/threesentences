import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AppWindow } from "../components/AppWindow";

export const Scene5Catalog: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const sceneScale = spring({ frame, fps, config: { damping: 14 } });
    const sceneOpacity = interpolate(frame, [0, 10], [0, 1]);

    const pills = ["All", "Core", "Database", "Developer", "Communication"];
    const servers = [
        { name: "Filesystem", icon: "📁", auth: "No Auth", isAuth: false, inst: true },
        { name: "Git", icon: "🌱", auth: "No Auth", isAuth: false, inst: false },
        { name: "GitHub", icon: "🐙", auth: "Requires Auth", isAuth: true, inst: true },
        { name: "PostgreSQL", icon: "🐘", auth: "Requires Auth", isAuth: true, inst: false },
        { name: "Slack", icon: "💬", auth: "Requires Auth", isAuth: true, inst: false },
        { name: "Puppeteer", icon: "🌐", auth: "No Auth", isAuth: false, inst: true },
    ];

    return (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ opacity: sceneOpacity, transform: `scale(${interpolate(sceneScale, [0, 1], [0.95, 1])})`, width: "100%", display: "flex", justifyContent: "center" }}>
                <AppWindow width={960} height={640} title="MCP Integration">
                    <div style={{ padding: 40, height: "100%", fontFamily: "Inter, sans-serif", background: "#1c1917", overflow: "hidden" }}>

                        {/* Header */}
                        <div style={{ textAlign: "center", marginBottom: 32 }}>
                            <h2 style={{ fontSize: 28, color: "#fafaf9", fontWeight: 600, margin: "0 0 8px 0" }}>MCP Server Catalog</h2>
                            <div style={{ fontSize: 16, color: "#a8a29e" }}>20+ servers available out of the box</div>
                        </div>

                        {/* Pills */}
                        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32 }}>
                            {pills.map((pill, i) => {
                                const s = Math.max(0, frame - 10 - i * 2);
                                const pScale = spring({ frame: s, fps, config: { damping: 14, stiffness: 150 } });
                                return (
                                    <div key={i} style={{
                                        transform: `scale(${interpolate(pScale, [0, 1], [0.8, 1])})`,
                                        opacity: interpolate(pScale, [0, 1], [0, 1]),
                                        padding: "8px 16px",
                                        borderRadius: 20,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        background: i === 0 ? "#fafaf9" : "#292524",
                                        color: i === 0 ? "#0c0a09" : "#a8a29e",
                                        border: `1px solid ${i === 0 ? "#fafaf9" : "#44403c"}`
                                    }}>
                                        {pill}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                            {servers.map((srv, i) => {
                                const s = Math.max(0, frame - 20 - i * 4);
                                const cScale = spring({ frame: s, fps, config: { damping: 14, stiffness: 150 } });
                                return (
                                    <div key={i} style={{
                                        transform: `scale(${interpolate(cScale, [0, 1], [0.9, 1])}) translateY(${interpolate(cScale, [0, 1], [20, 0])}px)`,
                                        opacity: interpolate(cScale, [0, 1], [0, 1]),
                                        background: "#18181b",
                                        border: "1px solid #292524",
                                        borderRadius: 16,
                                        padding: 24,
                                        display: "flex",
                                        flexDirection: "column",
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                            <div style={{ fontSize: 32 }}>{srv.icon}</div>
                                            <div style={{
                                                fontSize: 11,
                                                padding: "4px 8px",
                                                borderRadius: 12,
                                                background: srv.isAuth ? "rgba(251, 191, 36, 0.1)" : "rgba(34, 197, 94, 0.1)",
                                                color: srv.isAuth ? "#fbbf24" : "#22c55e",
                                                fontWeight: 600,
                                                textTransform: "uppercase",
                                                letterSpacing: 0.5
                                            }}>{srv.auth}</div>
                                        </div>

                                        <div style={{ fontSize: 18, fontWeight: 600, color: "#fafaf9", marginBottom: 24 }}>{srv.name}</div>

                                        <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", alignItems: "center", width: "100%", padding: "10px 0", borderRadius: 8, background: srv.inst ? "#292524" : "#fafaf9", color: srv.inst ? "#fafaf9" : "#0c0a09", fontSize: 14, fontWeight: 600, gap: 8 }}>
                                            {srv.inst ? (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    Installed
                                                </>
                                            ) : (
                                                "Install"
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </AppWindow>
            </div>
        </AbsoluteFill>
    );
};
