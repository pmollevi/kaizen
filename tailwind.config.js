/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0D0E0E", // fondo
          900: "#151716", // superficie
          850: "#1C1E1D", // superficie secundaria
          800: "#212320",
          700: "#292C2A", // borde
          600: "#3A3D38",
          500: "#585C54",
          400: "#858982", // texto secundario
          300: "#A6A99E",
          200: "#C7C9BE",
          100: "#F2F1EC", // texto principal
        },
        kaizen: {
          200: "#D8DAC7",
          300: "#B7BC9C",
          400: "#9BA37C",
          500: "#7B835C",
          600: "#636B47",
        },
        gold: {
          400: "#D4BC7C",
          500: "#C5A85B",
          600: "#A98B44",
        },
        // Identidad de sección (Panel = kaizen, Recompensas = gold ya existentes):
        // Hábitos y Finanzas ganan su propio acento para que el color diga en
        // qué parte de la app estás, sin tocar el fondo/tipografía de base.
        habitos: {
          300: "#E0BFA4",
          400: "#CE9B72",
          500: "#BD7A52",
          600: "#96603F",
        },
        finanzas: {
          300: "#A9C9C3",
          400: "#78A69D",
          500: "#4B8078",
          600: "#3A6660",
        },
        area: {
          intelecto: "#6B7A8F",
          imperio: "#A97C50",
          fuerza: "#B5624A",
          vitalidad: "#5E8C5A",
          energia: "#7E6C9E",
          sabiduria: "#4F7C7A",
          serenidad: "#8FA084",
          vinculos: "#A9667A",
          creatividad: "#A79BC0",
          gratitud: "#C9AA5C",
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
        card: "0 1px 2px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.2)",
        soft: "0 8px 24px -16px rgba(0,0,0,0.5)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
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
        "toast-fill": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        tap: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.12)" },
          "100%": { transform: "scale(1)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(0.94)" },
        },
        "radar-in": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        pop: "pop 0.22s cubic-bezier(0.16,1,0.3,1)",
        "fade-up": "fade-up 0.25s ease-out",
        wiggle: "wiggle 0.4s ease-in-out",
        confetti: "confetti-fall 0.9s ease-in forwards",
        "toast-fill": "toast-fill 2.4s cubic-bezier(0.16,1,0.3,1) forwards",
        tap: "tap 0.18s ease-out",
        flicker: "flicker 1.8s ease-in-out infinite",
        "radar-in": "radar-in 0.45s cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};
