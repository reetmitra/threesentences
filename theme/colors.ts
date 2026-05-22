export const colors = {
  dark: {
    // Backgrounds
    background: '#060608',       // --paper-bg outer canvas
    paper: '#0e0e10',            // --paper interior
    surface: '#15151a',          // --surface cards
    surfaceHi: '#1c1c22',        // --surface-hi
    frame: '#1e1e22',            // --frame hairlines/borders

    // Ink (text)
    textPrimary: '#ebe7dc',      // --ink bone-ivory, never pure white
    textBright: '#ffffff',       // --ink-bright CTAs, active states
    textSecondary: '#75726a',    // --ink-dim secondary/metadata
    textTertiary: '#36363a',     // --ink-fade placeholders/empty dots

    // Cream
    cream:   '#efece5',
    creamHi: '#f6f4ee',
    creamLo: '#e4dfd2',

    // Semantic
    accent: '#ffffff',           // --ink-bright for interactive elements
    warn: '#f6c177',             // --warn amber

    // Legacy aliases kept for backward-compat during migration
    border: '#1e1e22',
    surfaceHover: '#1c1c22',
    error: '#f6c177',            // remapped to warn (no red in spec)
    warning: '#f6c177',
    accentSubtle: '#1c1c22',
  },
  light: {
    // App is dark-only; light mirrors dark exactly
    background: '#060608',
    paper: '#0e0e10',
    surface: '#15151a',
    surfaceHi: '#1c1c22',
    frame: '#1e1e22',
    textPrimary: '#ebe7dc',
    textBright: '#ffffff',
    textSecondary: '#75726a',
    textTertiary: '#36363a',
    cream:   '#efece5',
    creamHi: '#f6f4ee',
    creamLo: '#e4dfd2',
    accent: '#ffffff',
    warn: '#f6c177',
    border: '#1e1e22',
    surfaceHover: '#1c1c22',
    error: '#f6c177',
    warning: '#f6c177',
    accentSubtle: '#1c1c22',
  },
};

export type ThemeColors = typeof colors.dark;
