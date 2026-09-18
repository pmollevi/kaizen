// Punto 9: al cerrar el mes, comparar lo logrado contra la meta de cada
// hábito con meta numérica y sugerir subirla o bajarla — nunca se aplica sola,
// el usuario siempre acepta, edita o ignora.
import type { AreaConfig, AreaId, KaizenState } from "@/types";
import { mesDe } from "@/lib/dates";

const UMBRAL_CUMPLIDA = 1; // cumplimientoSemanalArea va topado en 1: llegar a 1 toda la semana = cumplió o superó
const UMBRAL_CORTA = 0.5; // se quedó claramente por debajo
const MIN_SEMANAS_PARA_SUGERIR = 2;
const AJUSTE = 0.15; // +/-15%

export type DireccionSugerenciaMeta = "subir" | "bajar";

export interface SugerenciaMeta {
  areaId: AreaId;
  mes: string; // YYYY-MM evaluado
  metaActual: number;
  metaSugerida: number;
  direccion: DireccionSugerenciaMeta;
}

/** Recalcula metaDiaria y topeMetaSemanal proporcional a una nueva metaSemanalBase, igual que hace el asistente de planeación. */
export function cambiosParaNuevaMeta(area: AreaConfig, metaSemanalBase: number): Partial<AreaConfig> {
  const factor = area.metaSemanalBase > 0 ? metaSemanalBase / area.metaSemanalBase : 1;
  const metaDiaria = area.metaDiaria === null ? null : Math.round(area.metaDiaria * factor * 100) / 100;
  const topeMetaSemanal = Math.max(area.topeMetaSemanal, Math.round(metaSemanalBase * 1.2 * 100) / 100);
  return { metaSemanalBase: Math.round(metaSemanalBase * 100) / 100, metaDiaria, topeMetaSemanal };
}

/** Sugerencias de ajuste de meta para `mes`, a partir de los cierres semanales ya calculados de ese mes. */
export function calcularSugerenciasMeta(state: KaizenState, mes: string): SugerenciaMeta[] {
  const semanas = state.cierresSemanales.filter((c) => mesDe(c.semanaFin) === mes && !c.protegida);
  if (semanas.length < MIN_SEMANAS_PARA_SUGERIR) return [];

  const sugerencias: SugerenciaMeta[] = [];
  for (const area of state.areas) {
    if (area.pausada || area.metaSemanalBase <= 0) continue;
    const valores = semanas.map((c) => c.cumplimientoPorArea[area.id] ?? 0);
    const cumplioSiempre = valores.every((v) => v >= UMBRAL_CUMPLIDA);
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;

    if (cumplioSiempre) {
      sugerencias.push({
        areaId: area.id,
        mes,
        metaActual: area.metaSemanalBase,
        metaSugerida: Math.round(area.metaSemanalBase * (1 + AJUSTE) * 100) / 100,
        direccion: "subir",
      });
    } else if (promedio < UMBRAL_CORTA) {
      const bajada = Math.max(area.metaSemanalBase * (1 - AJUSTE), area.metaSemanalBase * 0.5);
      sugerencias.push({
        areaId: area.id,
        mes,
        metaActual: area.metaSemanalBase,
        metaSugerida: Math.round(bajada * 100) / 100,
        direccion: "bajar",
      });
    }
  }
  return sugerencias;
}

function clave(perfilId: string): string {
  return `kaizen:sugerencias-meta-resueltas:${perfilId}`;
}

function idSugerencia(s: Pick<SugerenciaMeta, "mes" | "areaId">): string {
  return `${s.mes}:${s.areaId}`;
}

function obtenerResueltas(perfilId: string): string[] {
  try {
    const raw = localStorage.getItem(clave(perfilId));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function sugerenciaMetaResuelta(perfilId: string, s: Pick<SugerenciaMeta, "mes" | "areaId">): boolean {
  return obtenerResueltas(perfilId).includes(idSugerencia(s));
}

export function marcarSugerenciaMetaResuelta(perfilId: string, s: Pick<SugerenciaMeta, "mes" | "areaId">): void {
  try {
    const resueltas = obtenerResueltas(perfilId);
    const id = idSugerencia(s);
    if (!resueltas.includes(id)) {
      localStorage.setItem(clave(perfilId), JSON.stringify([...resueltas, id].slice(-300)));
    }
  } catch {
    // almacenamiento no disponible: la sugerencia solo vuelve a aparecer, no rompe nada
  }
}
