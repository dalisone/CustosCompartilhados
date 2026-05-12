import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#111113",
        panel: "#1a1a1f",
        panelAlt: "#21212a",
        border: "#2f2f3a",
        text: "#f4f4f5",
        muted: "#b4b4c0",
        brand: "#73e2a7",
        expense: "#ff6b6b",
        income: "#5cc8ff",
        accent: "#ffd166",
      },
      boxShadow: {
        soft: "0 12px 32px rgba(0, 0, 0, 0.28)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
