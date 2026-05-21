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
        background: "#0e0e10",
        foreground: "#ebe7dc",
        border: "#1e1e22",
        input: "#1e1e22",
        ring: "#ebe7dc",
        primary: {
          DEFAULT: "#ffffff",
          foreground: "#0e0e10",
        },
        secondary: {
          DEFAULT: "#15151a",
          foreground: "#ebe7dc",
        },
        muted: {
          DEFAULT: "#15151a",
          foreground: "#75726a",
        },
        accent: {
          DEFAULT: "#1e1e22",
          foreground: "#ebe7dc",
        },
        warn: "#f6c177",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
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
