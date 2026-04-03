import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The core "Obsidian" background
        background: "#0a0a0a", 
        // Our Emerald Seed Color for the "Hero" persona
        primary: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        // Neon Red for the "Launderer" / Fraud alerts
        destructive: {
          DEFAULT: "#ff0000",
          foreground: "#ffffff",
        },
        border: "rgba(255, 255, 255, 0.1)",
      },
      backdropBlur: {
        md: "12px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;