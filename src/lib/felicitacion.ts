import type { AreaConfig, KaizenState } from "@/types";
import { sumarDias } from "@/lib/dates";
import { metaDiariaEfectiva } from "@/lib/formulas";

const DIAS_PROMEDIO = 6;
const MEJORA_MINIMA = 0.2; // 20% sobre el promedio reciente para contar como mejora notable
const RACHA_MINIMA = 3;

function rachaAreaHasta(state: KaizenState, areaId: string, fecha: string): number {
  let racha = 0;
  let f = fecha;
  for (let i = 0; i < 400; i++) {
    const r = state.registrosDiarios.find((x) => x.fecha === f);
    if (!r || (r.valores[areaId] ?? 0) <= 0) break;
    racha += 1;
    f = sumarDias(f, -1);
  }
  return racha;
}

function promedioPrevio(state: KaizenState, areaId: string, fecha: string, dias: number): number {
  let suma = 0;
  let n = 0;
  for (let i = 1; i <= dias; i++) {
    const r = state.registrosDiarios.find((x) => x.fecha === sumarDias(fecha, -i));
    const v = r?.valores[areaId] ?? 0;
    if (v > 0) {
      suma += v;
      n += 1;
    }
  }
  return n > 0 ? suma / n : 0;
}

export interface Felicitacion {
  tipo: "racha" | "mejora" | "cumplimiento";
  titulo: string;
  mensaje: string;
}

/**
 * Busca, entre los hábitos registrados en `fecha`, cuál fue el mejor
 * desempeño del día y arma una felicitación específica sobre eso — nunca un
 * mensaje genérico si hay algo puntual que destacar. Orden de prioridad:
 *
 * 1. Racha de área: algún hábito lleva 3+ días seguidos registrándose con
 *    valor positivo — la constancia sostenida es lo más significativo.
 * 2. Mejora vs. días recientes: algún hábito superó por 20%+ su propio
 *    promedio de los últimos 6 días — progreso notable aunque no haya racha.
 * 3. Mejor cumplimiento del día: si nada de lo anterior aplica, el hábito
 *    con mayor % de su meta diaria cumplida hoy (o, sin meta diaria, el de
 *    mayor peso entre los que se marcaron cumplidos).
 *
 * Devuelve null solo si no se registró ningún hábito con valor > 0 ese día
 * (nada que felicitar todavía).
 */
export function felicitacionDelDia(state: KaizenState, fecha: string): Felicitacion | null {
  const registro = state.registrosDiarios.find((r) => r.fecha === fecha);
  if (!registro) return null;
  const activos = state.areas.filter((a) => (registro.valores[a.id] ?? 0) > 0);
  if (activos.length === 0) return null;

  let mejorRacha: { area: AreaConfig; racha: number } | null = null;
  for (const a of activos) {
    const racha = rachaAreaHasta(state, a.id, fecha);
    if (racha >= RACHA_MINIMA && (!mejorRacha || racha > mejorRacha.racha)) mejorRacha = { area: a, racha };
  }
  if (mejorRacha) {
    const nombre = mejorRacha.area.nombre;
    return {
      tipo: "racha",
      titulo: `¡${mejorRacha.racha} días seguidos con ${nombre}!`,
      mensaje: `Llevas ${mejorRacha.racha} días seguidos registrando ${nombre.toLowerCase()} sin cortar. Esa es la constancia que suma.`,
    };
  }

  let mejorMejora: { area: AreaConfig; delta: number } | null = null;
  for (const a of activos) {
    const promedio = promedioPrevio(state, a.id, fecha, DIAS_PROMEDIO);
    const hoy = registro.valores[a.id] ?? 0;
    if (promedio > 0) {
      const delta = (hoy - promedio) / promedio;
      if (delta >= MEJORA_MINIMA && (!mejorMejora || delta > mejorMejora.delta)) mejorMejora = { area: a, delta };
    }
  }
  if (mejorMejora) {
    const nombre = mejorMejora.area.nombre;
    const pct = Math.round(mejorMejora.delta * 100);
    return {
      tipo: "mejora",
      titulo: `Tu mejor ${nombre.toLowerCase()} en varios días`,
      mensaje: `Hoy superaste tu propio promedio reciente en ${nombre.toLowerCase()} por ${pct}%. Se nota el esfuerzo.`,
    };
  }

  let mejorCumpl: { area: AreaConfig; cumpl: number } | null = null;
  for (const a of activos) {
    const meta = metaDiariaEfectiva(a, state.config);
    const valor = registro.valores[a.id] ?? 0;
    const cumpl = meta === null || meta <= 0 ? 1 : Math.min(1, valor / meta);
    if (
      !mejorCumpl ||
      cumpl > mejorCumpl.cumpl ||
      (cumpl === mejorCumpl.cumpl && a.peso > mejorCumpl.area.peso)
    ) {
      mejorCumpl = { area: a, cumpl };
    }
  }
  if (mejorCumpl) {
    const nombre = mejorCumpl.area.nombre;
    return {
      tipo: "cumplimiento",
      titulo: `Hoy destacó ${nombre}`,
      mensaje:
        mejorCumpl.cumpl >= 1
          ? `De todo lo que registraste hoy, ${nombre.toLowerCase()} fue lo mejor: meta del día cumplida.`
          : `De todo lo que registraste hoy, ${nombre.toLowerCase()} fue lo que más avanzó. Sigue así.`,
    };
  }

  return null;
}
