/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0a0b0d",
          900: "#121317",
          850: "#171920",
          800: "#1d1f28",
          700: "#2a2d38",
          600: "#3a3e4d",
          500: "#565b6e",
          400: "#7a8094",
          300: "#a3a8b8",
          200: "#c8ccd6",
          100: "#e8e9ee",
        },
        area: {
          intelecto: "#5b8def",
          imperio: "#e0a63a",
          fuerza: "#e0544f",
          vitalidad: "#4cb782",
          energia: "#9b6fe0",
          sabiduria: "#3ab5c6",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
        glow: "0 8px 30px -8px var(--tw-shadow-color, rgba(91,141,239,0.45))",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        "fade-up": {
          "0%": { transform: "translateY(6px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(120px) rotate(360deg)", opacity: "0" },
        },
      },
      animation: {
        pop: "pop 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        "fade-up": "fade-up 0.25s ease-out",
        wiggle: "wiggle 0.4s ease-in-out",
        confetti: "confetti-fall 0.9s ease-in forwards",
      },
    },
  },
  plugins: [],
};
