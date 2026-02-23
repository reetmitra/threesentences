import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene8CTA: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // "100% OPEN SOURCE" label, spinning GitHub logo
    const sceneScale = spring({ frame, fps, config: { damping: 14 } });
    const bgOpacity = interpolate(frame, [0, 10], [0, 1]);

    const rotation = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 18, stiffness: 120 } });

    // Orbiting stars
    const starAngle = interpolate(frame, [0, 120], [0, Math.PI * 2]);
    const starRadius = 120;

    return (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "#0c0a09" }}>
            <div style={{ opacity: bgOpacity, transform: `scale(${interpolate(sceneScale, [0, 1], [0.95, 1])})`, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Inter, sans-serif" }}>

                {/* Badge */}
                <div style={{
                    background: "rgba(251, 191, 36, 0.1)",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                    color: "#fbbf24",
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 64,
                    opacity: interpolate(frame, [15, 25], [0, 1]),
                    transform: `translateY(${interpolate(frame, [15, 25], [20, 0], { extrapolateRight: "clamp" })}px)`
                }}>
                    100% Open Source
                </div>

                {/* Central Graphic */}
                <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 48 }}>

                    {/* GitHub Logo */}
                    <div style={{
                        width: 120, height: 120, background: "#fafaf9", borderRadius: 60, display: "flex", alignItems: "center", justifyContent: "center",
                        transform: `rotate(${interpolate(rotation, [0, 1], [-180, 0])}deg) scale(${interpolate(spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 10, mass: 1.5 } }), [0, 1], [0, 1])})`
                    }}>
                        <svg height="80" viewBox="0 0 16 16" version="1.1" width="80" aria-hidden="true">
                            <path fill="#0c0a09" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                    </div>

                    {/* Orbiting Stars */}
                    {[0, 1, 2].map(i => {
                        const angleOffset = (Math.PI * 2) / 3 * i;
                        const x = Math.cos(starAngle + angleOffset) * starRadius;
                        const y = Math.sin(starAngle + angleOffset) * (starRadius * 0.4);
                        return (
                            <div key={i} style={{
                                position: "absolute",
                                fontSize: 24,
                                color: "#fbbf24",
                                transform: `translate(${x}px, ${y}px) scale(${interpolate(Math.sin((frame - i * 10) * 0.1), [-1, 1], [0.8, 1.2])})`,
                                opacity: interpolate(frame, [30, 40], [0, 1]),
                                zIndex: Math.sin(starAngle + angleOffset) > 0 ? 10 : 0
                            }}>
                                ✦
                            </div>
                        );
                    })}
                </div>

                {/* CTA Text */}
                <h2 style={{
                    fontSize: 36, color: "#fafaf9", fontWeight: 700, margin: "0 0 24px 0",
                    opacity: interpolate(frame, [40, 50], [0, 1]),
                    transform: `translateY(${interpolate(frame, [40, 50], [20, 0], { extrapolateRight: "clamp" })}px)`
                }}>
                    Star us on GitHub
                </h2>

                {/* URL Box */}
                <div style={{
                    background: "#1c1917",
                    border: "1px solid #292524",
                    padding: "16px 32px",
                    borderRadius: 12,
                    fontFamily: '"Space Mono", monospace',
                    fontSize: 20,
                    color: "#fbbf24",
                    opacity: interpolate(frame, [50, 60], [0, 1]),
                    transform: `scale(${interpolate(spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 10 } }), [0, 1], [0.9, 1])})`
                }}>
                    github.com/rohitg00/openclawd
                </div>
            </div>
        </AbsoluteFill>
    );
};
