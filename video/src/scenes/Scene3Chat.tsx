import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AppWindow } from "../components/AppWindow";

export const Scene3Chat: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Three-column layout: left sidebar, center chat, right progress panel.
    // Streaming assistant response.

    const sceneScale = spring({ frame, fps, config: { damping: 14 } });
    const sceneOpacity = interpolate(frame, [0, 10], [0, 1]);

    // Center column streaming
    const assistantResponse = `I've reviewed your API code. Here are the critical security findings:

1. Rate Limiting: No protection against brute force attacks on the /login endpoint.
2. SQL Injection: Parameterized queries are missing in the user search function.
3. Input Validation: Unsanitized input is being passed directly to the DB layer.

I can apply these fixes for you now using the filesystem tools.`;

    const charsToType = Math.max(0, Math.floor((frame - 30) * 1.5));
    const typedResponse = assistantResponse.slice(0, charsToType);

    // Right column progress steps
    const steps = [
        { name: "Reading files...", type: "system", f: 10 },
        { name: "Security analysis", type: "system", f: 40 },
        { name: "filesystem.read", type: "tool", args: "src/api/auth.ts", f: 50 },
        { name: "Applying fixes", type: "system", f: 90 },
        { name: "bash.exec", type: "tool", args: "npm run lint", f: 100 },
        { name: "Creating PR", type: "system", f: 120 },
        { name: "github.create_pr", type: "tool", args: "fix/security-patches", f: 130 },
    ];

    return (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ opacity: sceneOpacity, transform: `scale(${interpolate(sceneScale, [0, 1], [0.95, 1])})`, width: "100%", display: "flex", justifyContent: "center" }}>
                <AppWindow width={1000} height={600} title="OpenClawd">
                    <div style={{ display: "flex", height: "100%", fontFamily: "Inter, sans-serif", color: "#fafaf9", background: "#1c1917" }}>

                        {/* Left Sidebar */}
                        <div style={{ width: 220, borderRight: "1px solid #292524", padding: 16, background: "#18181b" }}>
                            <div style={{ fontSize: 13, color: "#78716c", fontWeight: 600, marginBottom: 12 }}>All Chats</div>
                            <div style={{ fontSize: 14, color: "#fafaf9", padding: "8px 12px", background: "#292524", borderRadius: 8, marginBottom: 4 }}>
                                Review API Code
                            </div>
                            <div style={{ fontSize: 14, color: "#a8a29e", padding: "8px 12px" }}>MCP Integration</div>
                            <div style={{ fontSize: 14, color: "#a8a29e", padding: "8px 12px" }}>Docker Debug</div>
                        </div>

                        {/* Center Chat */}
                        <div style={{ flex: 1, padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24, overflow: "hidden" }}>
                            {/* User Message */}
                            <div style={{ alignSelf: "flex-end", background: "#292524", padding: "12px 16px", borderRadius: 16, borderBottomRightRadius: 4, maxWidth: "80%" }}>
                                <div style={{ fontSize: 15, lineHeight: 1.5 }}>Review my API code</div>
                            </div>

                            {/* Assistant Message */}
                            <div style={{ alignSelf: "flex-start", maxWidth: "90%", display: "flex", gap: 16 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 16, background: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0c0a09" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                                        <path d="m12 12 7.1-7.1"></path>
                                    </svg>
                                </div>
                                {frame > 25 && (
                                    <div style={{ fontSize: 15, lineHeight: 1.6, color: "#fafaf9", whiteSpace: "pre-wrap" }}>
                                        {typedResponse}
                                        {frame % 20 < 10 && charsToType < assistantResponse.length ? "▋" : ""}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Progress */}
                        <div style={{ width: 260, borderLeft: "1px solid #292524", padding: 16, background: "#18181b" }}>
                            <div style={{ fontSize: 12, color: "#78716c", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
                                Activity
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {steps.map((step, i) => {
                                    if (frame < step.f) return null;
                                    const isDone = frame > step.f + 15;

                                    return (
                                        <div key={i} style={{ display: "flex", gap: 12, opacity: interpolate(frame - step.f, [0, 5], [0, 1]) }}>
                                            <div style={{ width: 16, height: 16, borderRadius: 8, background: step.type === "tool" ? "#3b82f6" : (isDone ? "#22c55e" : "#fbbf24"), display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                                                {isDone ? (
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0c0a09" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                ) : (
                                                    <div style={{ width: 6, height: 6, borderRadius: 3, background: "#0c0a09" }} />
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 13, color: isDone ? "#fafaf9" : "#fbbf24", fontWeight: 500 }}>
                                                    {step.name}
                                                </div>
                                                {step.args && (
                                                    <div style={{ fontSize: 11, color: "#a8a29e", fontFamily: '"Space Mono", monospace', marginTop: 4, background: "#0c0a09", padding: "2px 6px", borderRadius: 4, display: "inline-block" }}>
                                                        {step.args}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </AppWindow>
            </div>
        </AbsoluteFill>
    );
};
