export const colors = {
  dark: {
    background: '#0D0D0D',      // Primary surface
    surface: '#1A1A1A',         // Cards, inputs
    surfaceHover: '#242424',    // Pressed states
    border: '#2A2A2A',          // Subtle borders
    
    textPrimary: '#E5E5E5',     // Main text
    textSecondary: '#808080',   // Labels, hints
    textTertiary: '#4D4D4D',    // Disabled
    
    accent: '#4A9B7F',          // Brand, buttons
    accentHover: '#3D8268',     // Pressed accent
    accentSubtle: '#1A2F28',    // Accent at 10%
    
    warning: '#B8860B',         // Confirmations
    error: '#C75050',           // Errors (rare)
  },
  
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceHover: '#F0F0F0',
    border: '#E5E5E5',
    
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    
    accent: '#3D8268',
    accentHover: '#2F6B54',
    accentSubtle: '#E8F4F0',
    
    warning: '#8B6914',
    error: '#B54040',
  }
};

export type ThemeColors = typeof colors.dark;
