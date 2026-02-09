import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        border: "#2a2a2a",
        input: "#2a2a2a",
        ring: "#ffffff",
        primary: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#121212",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#121212",
          foreground: "#a0a0a0",
        },
        accent: {
          DEFAULT: "#1e1e1e",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 1s ease-out",
        "fade-up": "fade-up 0.8s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
