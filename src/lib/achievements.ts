import type { KaizenState } from "@/types";
import { diasEntre, hoyISO, mesDe } from "@/lib/dates";

/**
 * Hitos de racha diaria: cada uno es a la vez un reconocimiento (ver
 * defaultConfig.ts) y un título narrativo. Al desbloquearse, el store asigna
 * el título automáticamente y la UI celebra el momento (ver RegistroDiario).
 */
export const HITOS_RACHA: { id: string; dias: number; titulo: string }[] = [
  { id: "ach_racha_7d", dias: 7, titulo: "Constante" },
  { id: "ach_racha_30d", dias: 30, titulo: "Disciplinado" },
  { id: "ach_racha_90d", dias: 90, titulo: "Inquebrantable" },
  { id: "ach_racha_365d", dias: 365, titulo: "Maestro Kaizen" },
];

/** Evalúa el catálogo de reconocimientos y devuelve los ids recién desbloqueados. */
export function evaluarReconocimientos(state: KaizenState): string[] {
  const yaDesbloqueados = new Set(state.historial.reconocimientos.map((r) => r.id));
  const nuevos: string[] = [];
  const marcar = (id: string, condicion: boolean) => {
    if (condicion && !yaDesbloqueados.has(id)) nuevos.push(id);
  };

  marcar("ach_racha_4", rachaGlobalActual(state) >= 4);
  marcar("ach_nivel_10", state.usuario.nivelGlobal >= 10);
  marcar("ach_gastos_90", rachaDeRegistroGastos(state) >= 90);
  marcar("ach_temporada_1", state.historial.temporadas.length >= 1);
  marcar("ach_secreto_1", rachaDiariaVigente(state) >= 7);
  const rachaHoy = rachaDiariaVigente(state);
  for (const h of HITOS_RACHA) marcar(h.id, rachaHoy >= h.dias);

  return nuevos;
}

/** Días seguidos (contando hoy/ayer) con todos los hábitos activos cumplidos (valor > 0). */
export function rachaDiariaVigente(state: KaizenState): number {
  if (state.areas.length === 0) return 0;
  const registros = [...state.registrosDiarios].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  if (registros.length === 0) return 0;
  if (diasEntre(registros[0].fecha, hoyISO()) > 1) return 0;
  let racha = 0;
  for (const r of registros) {
    const completo = state.areas.every((a) => (r.valores[a.id] ?? 0) > 0);
    if (completo) racha += 1;
    else break;
  }
  return racha;
}

function rachaGlobalActual(state: KaizenState): number {
  let racha = 0;
  const cierres = [...state.cierresSemanales].sort((a, b) => (a.semanaInicio < b.semanaInicio ? 1 : -1));
  for (const c of cierres) {
    if (c.protegida) continue;
    if (c.cumplimientoGlobal >= state.config.economia.umbralNivelArea) {
      racha += 1;
    } else {
      break;
    }
  }
  return racha;
}

/** La racha diaria más larga (todos los hábitos activos cumplidos) dentro de un mes dado. */
export function mejorRachaEnMes(state: KaizenState, mes: string): number {
  if (state.areas.length === 0) return 0;
  const registros = [...state.registrosDiarios]
    .filter((r) => mesDe(r.fecha) === mes)
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  let mejor = 0;
  let actual = 0;
  let fechaAnterior: string | null = null;
  for (const r of registros) {
    const completo = state.areas.every((a) => (r.valores[a.id] ?? 0) > 0);
    const consecutivo = fechaAnterior === null || diasEntre(fechaAnterior, r.fecha) === 1;
    actual = completo && consecutivo ? actual + 1 : completo ? 1 : 0;
    mejor = Math.max(mejor, actual);
    fechaAnterior = r.fecha;
  }
  return mejor;
}

function rachaDeRegistroGastos(state: KaizenState): number {
  const fechas = [...new Set(state.finanzas.gastos.map((g) => g.fecha))].sort();
  if (fechas.length === 0) return 0;
  let mejor = 1;
  let actual = 1;
  for (let i = 1; i < fechas.length; i++) {
    actual = diasEntre(fechas[i - 1], fechas[i]) === 1 ? actual + 1 : 1;
    mejor = Math.max(mejor, actual);
  }
  const ultimaFecha = fechas[fechas.length - 1];
  const vigente = diasEntre(ultimaFecha, hoyISO()) <= 1;
  return vigente ? mejor : 0;
}
