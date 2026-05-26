/** Brand colour tokens — only place hex values live */
export const T = {
  paper: "#060608",
  paper2: "#0e0e10",
  surface: "#15151a",
  frame: "#1e1e22",
  inkFade: "#3a3a3e",
  inkDim: "#8a877e",
  ink: "#ebe7dc",
  inkBright: "#ffffff",
} as const;

/** Font-stack tokens — always use these, never raw strings */
export const F = {
  /** Newsreader — always italic, weight 400 */
  serif: "'Newsreader', Georgia, serif",
  /** Schibsted Grotesk — weights 400/500/600 */
  sans: "'Schibsted Grotesk', system-ui, sans-serif",
  /** IBM Plex Mono — weight 500, UPPERCASE, wide tracking */
  mono: "'IBM Plex Mono', 'Courier New', monospace",
} as const;
