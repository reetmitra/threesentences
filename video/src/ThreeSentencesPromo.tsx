import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { TS_Scene1Brand } from "./scenes/TS_Scene1Brand";
import { TS_Scene2Entry } from "./scenes/TS_Scene2Entry";
import { TS_Scene3Reflect } from "./scenes/TS_Scene3Reflect";
import { TS_Scene4Calendar } from "./scenes/TS_Scene4Calendar";
import { TS_Scene5Social } from "./scenes/TS_Scene5Social";
import { TS_Scene6Guide } from "./scenes/TS_Scene6Guide";
import { TS_Scene7Features } from "./scenes/TS_Scene7Features";
import { TS_Scene8CTA } from "./scenes/TS_Scene8CTA";

import { loadFont } from "@remotion/google-fonts/Inter";
loadFont("normal", { subsets: ["latin"], weights: ["300", "400", "500", "600", "700"] });

// ─── DESIGN TOKENS (matched to app) ──────────────────────────────
export const BG = "#000000";
export const SURFACE = "#121212";
export const BORDER = "#2A2A2A";
export const TEXT = "#FFFFFF";
export const TEXT_SEC = "#A0A0A0";
export const TEXT_MUTED = "#666666";
export const ACCENT = "#FFFFFF";
export const ACCENT_SUBTLE = "#333333";
export const WARNING = "#F0B429";

export const ThreeSentencesPromo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: BG }}>
            <Series>
                <Series.Sequence durationInFrames={120} name="Scene 1 - Brand Intro">
                    <TS_Scene1Brand />
                </Series.Sequence>
                <Series.Sequence durationInFrames={180} name="Scene 2 - Daily Entry">
                    <TS_Scene2Entry />
                </Series.Sequence>
                <Series.Sequence durationInFrames={150} name="Scene 3 - AI Reflection">
                    <TS_Scene3Reflect />
                </Series.Sequence>
                <Series.Sequence durationInFrames={130} name="Scene 4 - Calendar">
                    <TS_Scene4Calendar />
                </Series.Sequence>
                <Series.Sequence durationInFrames={140} name="Scene 5 - Social">
                    <TS_Scene5Social />
                </Series.Sequence>
                <Series.Sequence durationInFrames={120} name="Scene 6 - Guide">
                    <TS_Scene6Guide />
                </Series.Sequence>
                <Series.Sequence durationInFrames={150} name="Scene 7 - Features">
                    <TS_Scene7Features />
                </Series.Sequence>
                <Series.Sequence durationInFrames={120} name="Scene 8 - CTA">
                    <TS_Scene8CTA />
                </Series.Sequence>
            </Series>
        </AbsoluteFill>
    );
};
