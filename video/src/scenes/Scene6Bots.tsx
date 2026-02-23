import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene6Bots: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Full screen, no AppWindow here
    const sceneScale = spring({ frame, fps, config: { damping: 14 } });
    const sceneOpacity = interpolate(frame, [0, 10], [0, 1]);

    const bots = [
        { name: "WhatsApp", icon: "📱", color: "#25D366" },
        { name: "Telegram", icon: "✈️", color: "#0088cc" },
        { name: "Signal", icon: "🔒", color: "#3A76F0" },
        { name: "iMessage", icon: "💬", color: "#34C759" },
    ];

    return (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "#0c0a09" }}>
            <div style={{ opacity: sceneOpacity, transform: `scale(${interpolate(sceneScale, [0, 1], [0.95, 1])})`, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

                {/* Title & Subtitle */}
                <div style={{ textAlign: "center", marginBottom: 64, fontFamily: "Georgia, serif" }}>
                    <h1 style={{
                        fontSize: 64,
                        color: "#fafaf9",
                        margin: 0,
                        opacity: interpolate(frame, [10, 25], [0, 1]),
                        transform: `translateY(${interpolate(frame, [10, 30], [20, 0], { extrapolateRight: "clamp" })}px)`
                    }}>
                        Your AI, everywhere you chat
                    </h1>
                    <p style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 24,
                        color: "#fbbf24",
                        marginTop: 16,
                        opacity: interpolate(frame, [20, 35], [0, 1]),
                        transform: `translateY(${interpolate(frame, [20, 40], [20, 0], { extrapolateRight: "clamp" })}px)`
                    }}>
                        Full tool access · Memory · Scheduling
                    </p>
                </div>

                {/* 4 Cards */}
                <div style={{ display: "flex", gap: 32, fontFamily: "Inter, sans-serif" }}>
                    {bots.map((bot, i) => {
                        const s = Math.max(0, frame - 30 - i * 6);
                        const baseScale = spring({ frame: s, fps, config: { damping: 12, stiffness: 180 } });

                        return (
                            <div key={i} style={{
                                opacity: interpolate(baseScale, [0, 1], [0, 1]),
                                transform: `scale(${interpolate(baseScale, [0, 1], [0.8, 1])}) translateY(${interpolate(baseScale, [0, 1], [40, 0])}px)`,
                                background: "#1c1917",
                                border: "1px solid #292524",
                                borderRadius: 24,
                                width: 200,
                                padding: "32px 24px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center"
                            }}>
                                {/* Status Dot */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 4, background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
                                    <span style={{ fontSize: 13, color: "#a8a29e", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Connected</span>
                                </div>

                                {/* Icon */}
                                <div style={{ fontSize: 48, marginBottom: 20, width: 80, height: 80, borderRadius: 40, background: "#18181b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {bot.icon}
                                </div>

                                {/* Name */}
                                <div style={{ fontSize: 20, color: "#fafaf9", fontWeight: 600, marginBottom: 24 }}>
                                    {bot.name}
                                </div>

                                {/* Tags */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                                    {["Memory", "Scheduling", "Tools"].map((t, ti) => {
                                        const tagScale = spring({ frame: Math.max(0, s - 10 - ti * 4), fps, config: { damping: 14 } });
                                        return (
                                            <div key={ti} style={{
                                                opacity: interpolate(tagScale, [0, 1], [0, 1]),
                                                transform: `scale(${interpolate(tagScale, [0, 1], [0.8, 1])})`,
                                                background: "#292524",
                                                color: "#fbbf24",
                                                fontSize: 12,
                                                fontWeight: 600,
                                                padding: "6px 0",
                                                borderRadius: 8,
                                                textAlign: "center"
                                            }}>
                                                {t}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </AbsoluteFill>
    );
};
