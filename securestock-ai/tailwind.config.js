/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        obsidian: {
          950: "#040507", // Pure black void
          900: "#090a0f", // Deep slate black
          800: "#11131a", // Charcoal card surface
          700: "#181b24", // Elevated border surface
          600: "#222634", // Muted interactive surface
        },
        emerald: {
          neon: "#00FF88",
          electric: "#00E676",
          bright: "#10B981",
          glow: "rgba(0, 255, 136, 0.2)",
          deep: "#044E36",
        },
        green: {
          neon: "#00FF88",
          electric: "#00E676",
          mint: "#6EE7B7",
        },
        pureWhite: "#FFFFFF",
        cardDark: "rgba(12, 14, 20, 0.75)",
        success: "#00FF88",
        danger: "#FF3355",
        warning: "#FFB020",
      },
      backgroundImage: {
        "mesh-emerald":
          "radial-gradient(at 50% 0%, rgba(0, 230, 118, 0.12) 0px, transparent 65%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.08) 0px, transparent 55%), radial-gradient(at 0% 50%, rgba(5, 5, 8, 0.95) 0px, transparent 60%)",
        "glass-emerald":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        emerald: "0 0 25px rgba(0, 230, 118, 0.35), 0 0 50px rgba(0, 230, 118, 0.15)",
        "emerald-sm": "0 0 12px rgba(0, 230, 118, 0.25)",
        "white-sm": "0 0 15px rgba(255, 255, 255, 0.15)",
        card: "0 12px 40px rgba(0, 0, 0, 0.6)",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0, 255, 136, 0.3)" },
          "50%": { boxShadow: "0 0 24px rgba(0, 255, 136, 0.7), 0 0 45px rgba(0, 255, 136, 0.25)" },
        },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
