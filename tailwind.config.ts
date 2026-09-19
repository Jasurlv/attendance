import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        concrete: "#E6E8E9", // page background
        surface: "#F7F8F8", // panels
        ink: "#15242C", // text, sidebar
        steel: "#4B6472", // secondary text
        line: "#C9CED1", // borders
        hivis: "#FFC800", // primary action (hi-vis yellow)
        "hivis-dark": "#E0AF00",
        danger: "#B3261E",
        ok: "#2E7D4F",
      },
      fontFamily: {
        sans: ["Barlow", "system-ui", "sans-serif"],
        display: ['"Barlow Condensed"', "Barlow", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
