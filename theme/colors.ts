/**
 * ThreeSixtyThree™ Three Sentences - Color Palette
 * 
 * Monochromatic dark blue palette with white accents.
 * Dark-only mode for a premium blackout aesthetic.
 */

export const colors = {
  dark: {
    // Core palette (3 colors)
    background: '#000000',      // True Black - primary app background
    surface: '#121212',         // Dark Gray - cards, inputs
    surfaceHover: '#1E1E1E',    // Slightly lighter - hover states, pressed
    border: '#2A2A2A',          // Subtle borders

    // Text hierarchy
    textPrimary: '#FFFFFF',     // Pure white for max contrast
    textSecondary: '#A0A0A0',   // Light gray for secondary text
    textTertiary: '#666666',    // Darker gray for disabled/placeholder

    // Accent (white-based for clean look)
    accent: '#FFFFFF',          // Buttons, active states
    accentHover: '#E0E0E0',     // Pressed accent
    accentSubtle: '#333333',    // Accent backgrounds, highlights

    // Semantic colors
    warning: '#F0B429',         // Confirmations (warm amber)
    error: '#EF4444',           // Errors (kept for safety/visibility)
  },

  // Light mode mirrors dark mode (app is dark-only)
  light: {
    background: '#000000',
    surface: '#121212',
    surfaceHover: '#1E1E1E',
    border: '#2A2A2A',

    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textTertiary: '#666666',

    accent: '#FFFFFF',
    accentHover: '#E0E0E0',
    accentSubtle: '#333333',

    warning: '#F0B429',
    error: '#EF4444',
  }
};

export type ThemeColors = typeof colors.dark;
