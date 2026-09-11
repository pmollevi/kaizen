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
      },
    },
  },
  plugins: [],
};
