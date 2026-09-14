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
        // Paleta viva estilo Duolingo: colores saturados sobre fondo oscuro, no
        // pasteles ni acentos apagados — ver DESIGN.md "Colors".
        kaizen: {
          200: "#BFF0C8",
          300: "#8FE6A0",
          400: "#5BDA72",
          500: "#2FA347", // relleno de botón: verde vivo pero con suficiente cuerpo para el texto claro encima
          600: "#22832F",
        },
        gold: {
          300: "#FFE685",
          400: "#FFD84D",
          500: "#FFC800",
          600: "#D9A800",
        },
        // Identidad de sección (Panel = kaizen (token sin renombrar), Recompensas = gold ya existentes):
        // Hábitos y Finanzas ganan su propio acento para que el color diga en
        // qué parte de la app estás, sin tocar el fondo/tipografía de base.
        habitos: {
          300: "#FFC773",
          400: "#FFA733",
          500: "#FF9600",
          600: "#D97D00",
        },
        finanzas: {
          300: "#8FDBFB",
          400: "#4FC3F7",
          500: "#0D8FCC", // relleno del FAB: azul vivo pero con cuerpo suficiente para el texto claro encima
          600: "#0A6FA0",
        },
        area: {
          intelecto: "#4D8DFF",
          imperio: "#FFA229",
          fuerza: "#FF5C5C",
          vitalidad: "#3DDC5A",
          energia: "#9D6BFF",
          sabiduria: "#2BD4C4",
          serenidad: "#3DC7EF",
          vinculos: "#FF6FB8",
          creatividad: "#C77DFF",
          gratitud: "#FFCF33",
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
          "50%": { transform: "scale(1.015)" },
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
        tap: "tap 0.12s ease-out",
        flicker: "flicker 1.8s ease-in-out infinite",
        "radar-in": "radar-in 0.45s cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};
