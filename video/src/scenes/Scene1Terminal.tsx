import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AppWindow } from "../components/AppWindow";

const ASCII = `
   ____                   ________               __
  / __ \\____  ___  ____  / ____/ /___ __      __/ /
 / / / / __ \\/ _ \\/ __ \\/ /   / / __ \`/ | /| / / / 
/ /_/ / /_/ /  __/ / / / /___/ / /_/ /| |/ |/ / /  
\\____/ .___/\\___/_/ /_/\\____/_/\\__,_/ |__/|__/_/   
    /_/                                            
`;

export const Scene1Terminal: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Terminal slides in from bottom with 3D perspective
    // (rotateX 20deg, slight rotateY oscillation).
    const slideIn = spring({
        frame,
        fps,
        config: { damping: 14, stiffness: 100 },
    });

    const translateY = interpolate(slideIn, [0, 1], [500, 0]);
    const rotateX = interpolate(slideIn, [0, 1], [40, 0]);
    // oscillate slightly
    const rotateY = Math.sin(frame / 10) * 2 * slideIn;
    const opacity = interpolate(frame, [0, 10], [0, 1]);

    // Typing effect: npx openclawd-cli (1 frame/char)
    const COMMAND = "npx openclawd-cli";
    const numCharsToType = Math.min(COMMAND.length, Math.max(0, frame - 20));
    const typedCommand = COMMAND.slice(0, numCharsToType);
    const showAscii = frame > 20 + COMMAND.length + 10; // Wait 10 frames after typing

    // Server outputs appearing progressively
    const outputs = [
        { text: "v1.0.0 - Starting SDK backends...", f: 60 },
        { text: "Loaded 20+ providers, 80+ models.", f: 75 },
        { text: "Models: Opus 4.6, GPT-5.3, Gemini 3, Sonnet 4.5...", f: 85 },
        { text: "Connected 5 MCP Servers (Filesystem, Git, GitHub...)", f: 95 },
        { text: "Opening desktop app on http://localhost:3001", f: 105 },
    ];

    return (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div
                style={{
                    perspective: 1000,
                    opacity,
                    transform: `translateY(${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                }}
            >
                <AppWindow width={800} height={500} title="bash — 80x24">
                    <div
                        style={{
                            padding: 24,
                            fontFamily: '"Space Mono", monospace',
                            color: "#a8a29e",
                            fontSize: 14,
                            lineHeight: 1.5,
                            height: "100%",
                        }}
                    >
                        <div>
                            <span style={{ color: "#22c55e" }}>user@mac</span>:
                            <span style={{ color: "#3b82f6" }}>~</span>$ {typedCommand}
                            {frame % 15 < 7 ? "█" : ""}
                        </div>

                        {showAscii && (
                            <pre
                                style={{
                                    margin: "16px 0",
                                    color: "#fbbf24", // amber accent
                                    fontFamily: "inherit",
                                    fontSize: 12,
                                    lineHeight: 1.2,
                                }}
                            >
                                {ASCII}
                            </pre>
                        )}

                        {showAscii && (
                            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                                {outputs.map((out, i) => {
                                    if (frame < out.f) return null;
                                    return (
                                        <div key={i} style={{ color: i === outputs.length - 1 ? "#22c55e" : "#fafaf9" }}>
                                            [info] {out.text}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </AppWindow>
            </div>
        </AbsoluteFill>
    );
};
