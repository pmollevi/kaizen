// "Temperatura" de color: los acentos de categoría ya nacen vivos y ganan un
// poco más de intensidad conforme el hábito sube de nivel — nunca cambia
// fondo/tipografía, solo este acento puntual (ver DESIGN.md "Datos").

function hexARgb(hex: string): [number, number, number] {
  const limpio = hex.replace("#", "");
  const n = parseInt(limpio, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbAHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

const GRIS_FRIO = "#585C54"; // base-500: el punto de partida "apagado"
const TOPE_NIVEL = 20; // en este nivel el color llega a su intensidad documentada en DESIGN.md

/** 0 en nivel 1 → 1 en TOPE_NIVEL (o más). */
export function factorMaestria(nivel: number, tope = TOPE_NIVEL): number {
  return Math.max(0, Math.min(1, (nivel - 1) / (tope - 1)));
}

/**
 * Mezcla el color base con un gris apagado según el nivel: nivel 1 se ve casi
 * monocromo, el nivel tope llega exactamente al hex documentado en DESIGN.md.
 */
export function colorPorNivel(colorBase: string, nivel: number, tope = TOPE_NIVEL): string {
  const factor = factorMaestria(nivel, tope);
  const intensidad = 0.78 + 0.22 * factor; // vivo desde el nivel 1 (estilo Duolingo); el nivel tope solo lo remata
  const [r1, g1, b1] = hexARgb(GRIS_FRIO);
  const [r2, g2, b2] = hexARgb(colorBase);
  return rgbAHex(r1 + (r2 - r1) * intensidad, g1 + (g2 - g1) * intensidad, b1 + (b2 - b1) * intensidad);
}

/**
 * Identidad de sección: cada una de las 4 secciones principales de navegación
 * tiene su propio acento (ver DESIGN.md "Identidad de sección"). El fondo,
 * la tipografía y el acento de acción (verde Origo) no cambian por esto.
 */
export const COLOR_SECCION = {
  panel: "#5BDA72",
  habitos: "#FF9600",
  finanzas: "#4FC3F7",
  recompensas: "#FFC800",
  resumenMes: "#2DD4BF",
} as const;
