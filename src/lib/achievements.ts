import type { KaizenState } from "@/types";
import { diasEntre, hoyISO } from "@/lib/dates";

/** Evalúa el catálogo de reconocimientos y devuelve los ids recién desbloqueados. */
export function evaluarReconocimientos(state: KaizenState): string[] {
  const yaDesbloqueados = new Set(state.historial.reconocimientos.map((r) => r.id));
  const nuevos: string[] = [];
  const marcar = (id: string, condicion: boolean) => {
    if (condicion && !yaDesbloqueados.has(id)) nuevos.push(id);
  };

  marcar("ach_racha_4", rachaGlobalActual(state) >= 4);
  marcar("ach_nivel_10", state.usuario.nivelGlobal >= 10);

  const ultimosResumenes = state.finanzas.resumenesMensuales.slice(-3);
  marcar(
    "ach_presupuesto_3",
    ultimosResumenes.length === 3 && ultimosResumenes.every((r) => r.categorias.every((c) => !c.sobregiro))
  );

  marcar(
    "ach_ahorro_total",
    state.finanzas.resumenesMensuales.some(
      (r) => r.destinoSobrante === "ahorro" && r.categorias.some((c) => c.diferencia > 0)
    )
  );

  marcar("ach_gastos_90", rachaDeRegistroGastos(state) >= 90);
  marcar("ach_temporada_1", state.historial.temporadas.length >= 1);
  marcar("ach_secreto_1", rachaSeisAreasMismoDia(state) >= 7);

  return nuevos;
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

function rachaSeisAreasMismoDia(state: KaizenState): number {
  const registros = [...state.registrosDiarios].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  let racha = 0;
  for (const r of registros) {
    const completo = Object.values(r.valores).every((v) => (v ?? 0) > 0);
    if (completo) racha += 1;
    else break;
  }
  return racha;
}
