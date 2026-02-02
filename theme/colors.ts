/**
 * ThreeSixtyThree™ Three Sentences - Color Palette
 * 
 * Monochromatic dark blue palette with white accents.
 * Dark-only mode for a premium blackout aesthetic.
 */

export const colors = {
  dark: {
    // Core palette (3 colors)
    background: '#06141B',      // Darkest - primary app background
    surface: '#11212D',         // Medium - cards, inputs, modals
    surfaceHover: '#253745',    // Lightest - hover states, pressed
    border: '#253745',          // Subtle borders and dividers
    
    // Text hierarchy
    textPrimary: '#E0E0E0',     // Main text (soft white)
    textSecondary: '#8899A6',   // Labels, hints (muted blue-gray)
    textTertiary: '#4A5568',    // Disabled, placeholders
    
    // Accent (white-based for clean look)
    accent: '#FFFFFF',          // Buttons, active states
    accentHover: '#E0E0E0',     // Pressed accent
    accentSubtle: '#253745',    // Accent backgrounds, highlights
    
    // Semantic colors
    warning: '#F0B429',         // Confirmations (warm amber)
    error: '#EF4444',           // Errors (kept for safety/visibility)
  },
  
  // Light mode mirrors dark mode (app is dark-only)
  light: {
    background: '#06141B',
    surface: '#11212D',
    surfaceHover: '#253745',
    border: '#253745',
    
    textPrimary: '#E0E0E0',
    textSecondary: '#8899A6',
    textTertiary: '#4A5568',
    
    accent: '#FFFFFF',
    accentHover: '#E0E0E0',
    accentSubtle: '#253745',
    
    warning: '#F0B429',
    error: '#EF4444',
  }
};

export type ThemeColors = typeof colors.dark;
