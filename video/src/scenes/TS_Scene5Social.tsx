import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const BG = "#000000";
const SURFACE = "#121212";
const BORDER = "#2A2A2A";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#A0A0A0";
const TEXT_MUTED = "#666666";

const FRIENDS = [
    { name: "Alex K.", username: "@alexk", streak: 47, initial: "A" },
    { name: "Jordan M.", username: "@jordanm", streak: 31, initial: "J" },
    { name: "Sam T.", username: "@samt", streak: 23, initial: "S" },
];

export const TS_Scene5Social: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const sceneSpring = spring({ frame, fps, config: { damping: 14 } });
    const sceneOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
    const sceneScale = interpolate(sceneSpring, [0, 1], [0.95, 1]);
    const fadeOut = interpolate(frame, [130, 140], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Tab indicator
    const activeTab = frame >= 90 ? 1 : 0; // switches to "Requests" at frame 90
    const tabIndicatorX = interpolate(frame, [88, 100], [0, 50], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Search bar
    const searchOpacity = interpolate(frame, [10, 22], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{
            alignItems: "center", justifyContent: "center",
            opacity: sceneOpacity * fadeOut,
        }}>
            <div style={{
                width: 420, fontFamily: "Inter, sans-serif",
                transform: `scale(${sceneScale})`,
            }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>Connect</div>
                    <div style={{
                        width: 36, height: 36, borderRadius: 18, background: SURFACE,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                    </div>
                </div>

                {/* Search bar */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: SURFACE, border: `1px solid ${BORDER}`,
                    borderRadius: 12, padding: "10px 14px",
                    marginBottom: 16, opacity: searchOpacity,
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_MUTED} strokeWidth="2" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span style={{ fontSize: 13, color: TEXT_MUTED }}>Search people...</span>
                </div>

                {/* Tabs */}
                <div style={{
                    display: "flex", position: "relative", marginBottom: 16,
                    borderBottom: `1px solid ${BORDER}`,
                }}>
                    {["Friends", "Requests"].map((tab, i) => (
                        <div key={i} style={{
                            flex: 1, textAlign: "center", padding: "10px 0",
                            fontSize: 14, fontWeight: activeTab === i ? 600 : 400,
                            color: activeTab === i ? TEXT : TEXT_SEC,
                        }}>{tab}</div>
                    ))}
                    <div style={{
                        position: "absolute", bottom: -1,
                        left: `${tabIndicatorX}%`, width: "50%",
                        height: 2, background: TEXT, borderRadius: 1,
                        transition: "left 0.3s",
                    }} />
                </div>

                {/* Friend cards */}
                {FRIENDS.map((friend, i) => {
                    const delay = i * 8;
                    const itemSpring = spring({ frame: Math.max(0, frame - 20 - delay), fps, config: { damping: 12, stiffness: 150 } });
                    const itemOpacity = interpolate(itemSpring, [0, 1], [0, 1]);
                    const itemY = interpolate(itemSpring, [0, 1], [20, 0]);

                    return (
                        <div key={i} style={{
                            display: "flex", alignItems: "center",
                            background: SURFACE, border: `1px solid ${BORDER}`,
                            borderRadius: 14, padding: 14, marginBottom: 8,
                            opacity: itemOpacity,
                            transform: `translateY(${itemY}px)`,
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 20,
                                background: "#333333",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 15, fontWeight: 700, color: TEXT,
                                marginRight: 12, flexShrink: 0,
                            }}>
                                {friend.initial}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{friend.name}</div>
                                <div style={{ fontSize: 12, color: TEXT_SEC }}>{friend.username}</div>
                            </div>
                            <div style={{
                                fontSize: 14, fontWeight: 700, color: TEXT,
                                fontFamily: "monospace", letterSpacing: 0.5,
                            }}>
                                {friend.streak}d 🔥
                            </div>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};
