import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const BG = "#000000";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#A0A0A0";
const TEXT_MUTED = "#666666";

export const TS_Scene8CTA: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Logo "THREE" reveal
    const logoSpring = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
    const logoScale = interpolate(logoSpring, [0, 1], [0.6, 1]);
    const logoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

    // Tagline
    const tagOpacity = interpolate(frame, [18, 30], [0, 1], { extrapolateRight: "clamp" });
    const tagY = interpolate(frame, [18, 32], [15, 0], { extrapolateRight: "clamp" });

    // CTA button
    const btnSpring = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 12 } });
    const btnScale = interpolate(btnSpring, [0, 1], [0.8, 1]);
    const btnOpacity = interpolate(frame, [35, 45], [0, 1], { extrapolateRight: "clamp" });
    // Pulsing scale
    const btnPulse = 1 + Math.sin(frame * 0.08) * 0.02;

    // Release date (scrambled monospace)
    const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const TARGET = "Q4 2026";
    const releaseOpacity = interpolate(frame, [50, 62], [0, 1], { extrapolateRight: "clamp" });
    const scrambleProgress = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const releaseText = TARGET.split("").map((char, i) => {
        if (char === " ") return " ";
        const charProgress = interpolate(scrambleProgress, [i / TARGET.length, (i + 1) / TARGET.length], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (charProgress >= 1) return char;
        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
    }).join("");

    // Footer
    const footerOpacity = interpolate(frame, [65, 75], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
        }}>
            {/* Subtle gradient background */}
            <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 70%)",
            }} />

            {/* Logo */}
            <div style={{
                fontSize: 96,
                fontWeight: 300,
                fontStyle: "italic",
                color: TEXT,
                letterSpacing: "-0.03em",
                fontFamily: "Inter, sans-serif",
                opacity: logoOpacity,
                transform: `scale(${logoScale})`,
            }}>
                THREE
            </div>

            {/* Tagline */}
            <div style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 18,
                fontWeight: 300,
                color: TEXT_SEC,
                letterSpacing: "0.08em",
                marginTop: 16,
                opacity: tagOpacity,
                transform: `translateY(${tagY}px)`,
            }}>
                be better, do better
            </div>

            {/* CTA Button */}
            <div style={{
                marginTop: 48,
                opacity: btnOpacity,
                transform: `scale(${btnScale * btnPulse})`,
            }}>
                <div style={{
                    background: TEXT,
                    color: BG,
                    padding: "16px 40px",
                    borderRadius: 30,
                    fontSize: 17,
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif",
                    letterSpacing: 0.3,
                }}>
                    Get early access
                </div>
            </div>

            {/* Release Date */}
            <div style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: TEXT_MUTED,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginTop: 24,
                opacity: releaseOpacity,
            }}>
                {releaseText}
            </div>

            {/* Footer */}
            <div style={{
                position: "absolute",
                bottom: 40,
                fontSize: 11,
                color: TEXT_MUTED,
                opacity: footerOpacity,
                fontFamily: "Inter, sans-serif",
            }}>
                © 2026 363™. All rights reserved.
            </div>
        </AbsoluteFill>
    );
};
