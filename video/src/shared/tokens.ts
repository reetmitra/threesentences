import { useVideoConfig } from "remotion";

// ─── DESIGN TOKENS (matched to app) ──────────────────────────────
export const BG = "#000000";
export const SURFACE = "#121212";
export const BORDER = "#2A2A2A";
export const TEXT = "#FFFFFF";
export const TEXT_SEC = "#A0A0A0";
export const TEXT_MUTED = "#666666";

// ─── RESOLUTION SCALING ──────────────────────────────────────────
// All pixel values are authored for 4K (3840x2160).
// useScale() returns 1.0 at 4K, 0.5 at 1080p, etc.
export const useScale = () => {
  const { width } = useVideoConfig();
  return width / 3840;
};
