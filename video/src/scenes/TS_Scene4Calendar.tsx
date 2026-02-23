import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const BG = "#000000";
const SURFACE = "#121212";
const BORDER = "#2A2A2A";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#A0A0A0";
const TEXT_MUTED = "#666666";

const DAYS_IN_MONTH = 28; // February 2026
const ENTRY_DAYS = [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
// Feb 2026 starts on Sunday (index 0)
const FIRST_DAY_OFFSET = 0;

export const TS_Scene4Calendar: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const sceneSpring = spring({ frame, fps, config: { damping: 14 } });
    const sceneOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
    const sceneScale = interpolate(sceneSpring, [0, 1], [0.95, 1]);
    const fadeOut = interpolate(frame, [120, 130], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Calendar cells appear staggered
    const calendarIn = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });

    // Selected date tap
    const selectedDay = frame >= 55 ? 15 : null;
    const entryCardSpring = spring({ frame: Math.max(0, frame - 58), fps, config: { damping: 14, stiffness: 120 } });
    const entryCardOpacity = frame >= 58 ? interpolate(frame, [58, 68], [0, 1], { extrapolateRight: "clamp" }) : 0;
    const entryCardY = interpolate(entryCardSpring, [0, 1], [30, 0]);

    // Stats
    const statsOpacity = interpolate(frame, [75, 85], [0, 1], { extrapolateRight: "clamp" });

    // Build calendar grid
    const cells: Array<{ day: number | null; hasEntry: boolean }> = [];
    for (let i = 0; i < FIRST_DAY_OFFSET; i++) cells.push({ day: null, hasEntry: false });
    for (let d = 1; d <= DAYS_IN_MONTH; d++) cells.push({ day: d, hasEntry: ENTRY_DAYS.includes(d) });
    while (cells.length < 35) cells.push({ day: null, hasEntry: false });

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
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: 1 }}>
                        PROJECT 363
                    </div>
                    <div style={{
                        fontSize: 11, color: TEXT_SEC, letterSpacing: 2,
                        textTransform: "uppercase", marginTop: 4,
                    }}>
                        363 days to better
                    </div>
                </div>

                {/* Month nav */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 16,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 18, background: SURFACE,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: TEXT, fontSize: 18,
                    }}>‹</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>February 2026</div>
                    <div style={{
                        width: 36, height: 36, borderRadius: 18, background: SURFACE,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: TEXT_MUTED, fontSize: 18,
                    }}>›</div>
                </div>

                {/* Calendar grid */}
                <div style={{
                    background: SURFACE,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    opacity: calendarIn,
                }}>
                    {/* Weekday headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
                        {WEEKDAYS.map((d, i) => (
                            <div key={i} style={{
                                textAlign: "center", fontSize: 11, color: TEXT_MUTED,
                                fontWeight: 600, padding: "4px 0",
                            }}>{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                        {cells.map((cell, i) => {
                            if (!cell.day) return <div key={i} />;
                            const isSelected = cell.day === selectedDay;
                            return (
                                <div key={i} style={{
                                    display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center",
                                    padding: "6px 0", borderRadius: 8,
                                    background: isSelected ? TEXT : "transparent",
                                }}>
                                    <span style={{
                                        fontSize: 13, fontWeight: isSelected ? 700 : 400,
                                        color: isSelected ? BG : TEXT,
                                    }}>{cell.day}</span>
                                    {cell.hasEntry && (
                                        <div style={{
                                            width: 4, height: 4, borderRadius: 2, marginTop: 3,
                                            background: isSelected ? BG : TEXT,
                                            opacity: isSelected ? 1 : 0.4,
                                        }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected entry card */}
                {selectedDay && (
                    <div style={{
                        background: SURFACE, border: `1px solid ${BORDER}`,
                        borderRadius: 12, padding: 16,
                        opacity: entryCardOpacity,
                        transform: `translateY(${entryCardY}px)`,
                        marginBottom: 12,
                    }}>
                        <div style={{ fontSize: 11, color: TEXT_MUTED, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
                            February 15, 2026
                        </div>
                        <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7, margin: 0 }}>
                            Ran 5k this morning without stopping. Felt the runner's high for the first time in months.
                            Need to stick to this schedule — momentum is everything.
                        </p>
                    </div>
                )}

                {/* Stats */}
                <div style={{
                    textAlign: "center", fontSize: 12, color: TEXT_MUTED, opacity: statsOpacity,
                    borderTop: `1px solid ${BORDER}`, paddingTop: 12,
                }}>
                    {ENTRY_DAYS.length} entries this month
                </div>
            </div>
        </AbsoluteFill>
    );
};
