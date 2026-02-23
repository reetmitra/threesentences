import React from "react";
import { AbsoluteFill } from "remotion";

export const AppWindow: React.FC<{
    children: React.ReactNode;
    width?: number | string;
    height?: number | string;
    style?: React.CSSProperties;
    title?: string;
}> = ({ children, width = "80%", height = "75%", style, title }) => {
    return (
        <div
            style={{
                width,
                height,
                background: "#1c1917", // Surface
                borderRadius: 16,
                border: "1px solid #292524",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                ...style,
            }}
        >
            {/* Mac Chrome Header */}
            <div
                style={{
                    height: 38,
                    background: "#18181b",
                    borderBottom: "1px solid #292524",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    position: "relative",
                }}
            >
                <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }} />
                </div>
                {title && (
                    <div
                        style={{
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                            color: "#a8a29e",
                            fontSize: 13,
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 500,
                        }}
                    >
                        {title}
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, position: "relative" }}>{children}</div>
        </div>
    );
};
