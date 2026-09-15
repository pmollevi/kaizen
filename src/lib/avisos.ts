import type { KaizenState } from "@/types";
import { diasEntre, hoyISO } from "@/lib/dates";
import { cicloTarjeta } from "@/lib/formulas";
import { rachaDiariaVigente } from "@/lib/achievements";
import { DIAS_AVISO_CORTE_ORI } from "@/lib/ori";

export interface Aviso {
  id: string;
  tono: "urgente" | "info" | "logro";
  texto: string;
  accion?: { label: string; ir: string };
}

const HORA_RECORDATORIO_RACHA = 20; // 8pm: suficientemente tarde para que valga la pena avisar
// Misma ventana que usa el chip "hay que pagar" de Ori (ver lib/ori.ts) — una sola fuente de verdad.
const DIAS_AVISO_CORTE = DIAS_AVISO_CORTE_ORI;

/**
 * Avisos calculados en el momento (sin backend, sin push): todo se deriva del
 * estado actual, así que no hay nada que "caduque" ni limpiar aparte del
 * registro de qué se descartó (ver lib/avisos "descartar*").
 */
export function calcularAvisos(state: KaizenState): Aviso[] {
  const avisos: Aviso[] = [];
  const hoy = hoyISO();
  const horaLocal = new Date().getHours();

  if (state.areas.length > 0) {
    const yaRegistroHoy = state.registrosDiarios.some((r) => r.fecha === hoy);
    if (!yaRegistroHoy && horaLocal >= HORA_RECORDATORIO_RACHA) {
      const racha = rachaDiariaVigente(state);
      avisos.push({
        id: `racha-tarde-${hoy}`,
        tono: "urgente",
        texto:
          racha > 0
            ? `Ya es tarde y todavía no registras hoy — tu racha de ${racha} ${racha === 1 ? "día" : "días"} sigue en juego.`
            : "Ya es tarde y todavía no registras hoy. Un minuto y arrancas tu racha.",
        accion: { label: "Registrar ahora", ir: "registro" },
      });
    }
  }

  for (const t of state.finanzas.tarjetas) {
    const { fin } = cicloTarjeta(t, hoy);
    const diasFaltantes = diasEntre(hoy, fin);
    if (diasFaltantes >= 0 && diasFaltantes <= DIAS_AVISO_CORTE) {
      avisos.push({
        id: `corte-${t.id}-${fin}`,
        tono: "info",
        texto:
          diasFaltantes === 0
            ? `Tu tarjeta ${t.nombre} corta hoy — buen momento para revisar tus gastos antes de pagar.`
            : `Tu tarjeta ${t.nombre} corta en ${diasFaltantes} ${diasFaltantes === 1 ? "día" : "días"}.`,
        accion: { label: "Ver Finanzas", ir: "finanzas" },
      });
    }
  }

  return avisos;
}

const MAX_DESCARTADOS_GUARDADOS = 150;

function clave(perfilId: string): string {
  return `kaizen:avisos-descartados:${perfilId}`;
}

export function obtenerDescartados(perfilId: string): string[] {
  try {
    const raw = localStorage.getItem(clave(perfilId));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function marcarDescartado(perfilId: string, avisoId: string): void {
  try {
    const actuales = obtenerDescartados(perfilId);
    const nuevos = [...actuales.filter((id) => id !== avisoId), avisoId].slice(-MAX_DESCARTADOS_GUARDADOS);
    localStorage.setItem(clave(perfilId), JSON.stringify(nuevos));
  } catch {
    // almacenamiento no disponible: el aviso solo se pierde al recargar, no rompe nada
  }
}
