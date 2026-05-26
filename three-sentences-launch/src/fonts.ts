/**
 * Load all Google Fonts at module scope.
 * Import this file early (in Root.tsx) — module caching ensures loadFont runs only once.
 * delayRender/continueRender block rendering until fonts are ready.
 */
import { loadFont as loadNewsreader } from "@remotion/google-fonts/Newsreader";
import { loadFont as loadSchibsted } from "@remotion/google-fonts/SchibstedGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";
import { continueRender, delayRender } from "remotion";

const { waitUntilDone: waitNewsreader } = loadNewsreader("italic", {
  weights: ["400"],
  subsets: ["latin"],
});

const { waitUntilDone: waitSchibsted } = loadSchibsted("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

const { waitUntilDone: waitMono } = loadMono("normal", {
  weights: ["500"],
  subsets: ["latin"],
});

const handle = delayRender("Loading Google Fonts");
Promise.all([waitNewsreader(), waitSchibsted(), waitMono()]).then(() => {
  continueRender(handle);
});
