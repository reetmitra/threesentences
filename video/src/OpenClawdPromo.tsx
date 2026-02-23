import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { Scene1Terminal } from "./scenes/Scene1Terminal";
import { Scene2Home } from "./scenes/Scene2Home";
import { Scene3Chat } from "./scenes/Scene3Chat";
import { Scene4Providers } from "./scenes/Scene4Providers";
import { Scene5Catalog } from "./scenes/Scene5Catalog";
import { Scene6Bots } from "./scenes/Scene6Bots";
import { Scene7Logo } from "./scenes/Scene7Logo";
import { Scene8CTA } from "./scenes/Scene8CTA";

import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora"; // Using Lora as Georgia fallback since Georgia isn't on Google Fonts directly usually. But we can just use system Georgia anyway.

loadInter("normal", { subsets: ["latin"], weights: ["400", "500", "600", "700"] });
loadSpaceMono("normal", { subsets: ["latin"], weights: ["400", "700"] });
loadLora("normal", { subsets: ["latin"], weights: ["400", "500", "600"] });

export const OpenClawdPromo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "#0c0a09" }}>
            {/*
            <Audio
                src={staticFile("walen-headphonk.mp3")}
                volume={(f) => {
                    // 1s fade-in (30 frames), 2s fade-out (60 frames) at the end of 1110 total frames
                    if (f < 30) return (f / 30) * 0.4;
                    if (f > 1050) return ((1110 - f) / 60) * 0.4;
                    return 0.4;
                }}
            />
            */}
            <Series>
                <Series.Sequence durationInFrames={120} name="Scene 1 - Terminal">
                    <Scene1Terminal />
                </Series.Sequence>
                <Series.Sequence durationInFrames={150} name="Scene 2 - Home Screen">
                    <Scene2Home />
                </Series.Sequence>
                <Series.Sequence durationInFrames={160} name="Scene 3 - Chat">
                    <Scene3Chat />
                </Series.Sequence>
                <Series.Sequence durationInFrames={130} name="Scene 4 - Providers">
                    <Scene4Providers />
                </Series.Sequence>
                <Series.Sequence durationInFrames={140} name="Scene 5 - MCP Catalog">
                    <Scene5Catalog />
                </Series.Sequence>
                <Series.Sequence durationInFrames={120} name="Scene 6 - Messaging Bots">
                    <Scene6Bots />
                </Series.Sequence>
                <Series.Sequence durationInFrames={180} name="Scene 7 - Logo Combo">
                    <Scene7Logo />
                </Series.Sequence>
                <Series.Sequence durationInFrames={120} name="Scene 8 - GitHub CTA">
                    <Scene8CTA />
                </Series.Sequence>
            </Series>
        </AbsoluteFill>
    );
};
