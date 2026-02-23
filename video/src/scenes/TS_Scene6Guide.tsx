import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const BG = "#000000";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#A0A0A0";
const ACCENT_SUBTLE = "#333333";

const SLIDES = [
    { num: "1", title: "Three Sentences", subtitle: "The Constraint.", body: "That is all. No more, no less.\nConstraint breeds creativity.\nFocus on the essence." },
    { num: "2", title: "Build Iron Habits", subtitle: "The Grind.", body: "Momentum is everything.\nDo not break the chain.\n363 days to a new you." },
    { num: "5", title: "Execute", subtitle: "The Action.", body: "No excuses anymore.\nYou either want it or you don't.\nStart today." },
];

export const TS_Scene6Guide: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const fadeOut = interpolate(frame, [110, 120], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Which slide is active (cycle every 35 frames)
    const slideIndex = Math.min(2, Math.floor(frame / 38));

    return (
        <AbsoluteFill style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            opacity: fadeOut,
        }}>
            {/* Header */}
            <div style={{
                fontSize: 14, fontWeight: 700, color: TEXT,
                letterSpacing: 2, textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
                marginBottom: 48,
                opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
            }}>
                THE GUIDE
            </div>

            {/* Active Slide */}
            {SLIDES.map((slide, i) => {
                if (i !== slideIndex) return null;
                const slideStart = i * 38;
                const slideFrame = frame - slideStart;
                const sSpring = spring({ frame: slideFrame, fps, config: { damping: 14 } });
                const slideOpacity = interpolate(slideFrame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
                const slideScale = interpolate(sSpring, [0, 1], [0.95, 1]);

                return (
                    <div key={i} style={{
                        opacity: slideOpacity,
                        transform: `scale(${slideScale})`,
                        textAlign: "center",
                        maxWidth: 500,
                        fontFamily: "Inter, sans-serif",
                    }}>
                        <div style={{
                            fontSize: 36, fontWeight: 700, color: TEXT,
                            letterSpacing: "-0.5px", marginBottom: 8,
                        }}>
                            {slide.num}. {slide.title}
                        </div>
                        <div style={{
                            fontSize: 18, fontWeight: 500, color: TEXT_SEC,
                            letterSpacing: 1, textTransform: "uppercase",
                            marginBottom: 24,
                        }}>
                            {slide.subtitle}
                        </div>
                        <div style={{
                            width: 50, height: 1, background: ACCENT_SUBTLE,
                            margin: "0 auto 24px auto",
                        }} />
                        <div style={{
                            fontSize: 16, color: TEXT_SEC, lineHeight: 1.8,
                            whiteSpace: "pre-line",
                        }}>
                            {slide.body}
                        </div>
                    </div>
                );
            })}

            {/* Pagination dots */}
            <div style={{
                display: "flex", gap: 6, marginTop: 48,
                opacity: interpolate(frame, [5, 15], [0, 1], { extrapolateRight: "clamp" }),
            }}>
                {SLIDES.map((_, i) => (
                    <div key={i} style={{
                        width: i === slideIndex ? 24 : 6,
                        height: 6, borderRadius: 3,
                        background: i === slideIndex ? TEXT : ACCENT_SUBTLE,
                        transition: "width 0.3s",
                    }} />
                ))}
            </div>
        </AbsoluteFill>
    );
};
