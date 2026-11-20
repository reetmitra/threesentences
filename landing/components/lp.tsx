/* Colour and type tokens for the drawings of the app's own screens (data-ui fragments).
   The page itself uses the CSS tokens in app/globals.css. */

import React from "react";

export const LP_INK        = '#e8e6e0';
export const LP_INK_BRIGHT = '#ffffff';
export const LP_INK_DIM    = '#8a877e';
export const LP_INK_FADE   = '#3a3a3e';
export const LP_PAPER      = '#060608';
export const LP_PAPER_2    = '#0e0e10';
export const LP_SURFACE    = '#15151a';
export const LP_FRAME      = '#1e1e22';
// The app's one accent: "kept" (habit checked, night written). Never chrome, never mood.
export const LP_MOON       = '#a9c1d9';
export const LP_SURFACE_HI = '#1c1c22';

// The app's UI sans, plus its reading face drawn in the page's text serif.
export const LP_SANS  = "var(--font-sans), 'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif";
export const LP_SERIF = "var(--font-text), 'Source Serif 4', Georgia, serif";
export const LP_MONO  = LP_SANS;

/* ── Counter dots ────────────────────────────────────────────── */
export function MiniDots({ filled = 3, total = 3, size = 10 }: { filled?: number; total?: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: size, height: size, borderRadius: '50%',
          background: i < filled ? LP_INK_BRIGHT : 'transparent',
          border: i < filled ? 'none' : `1.5px solid ${LP_INK_FADE}`,
        }} />
      ))}
    </div>
  );
}
