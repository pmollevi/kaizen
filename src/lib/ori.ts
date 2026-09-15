import type { KaizenState, Tarjeta } from "@/types";
import { diasDelMes, diasEntre, hoyISO, mesDe, sumarDias } from "@/lib/dates";
import { cicloTarjeta } from "@/lib/formulas";
import { rachaDiariaVigente } from "@/lib/achievements";
import type { OriState } from "@/components/ui/OriIcon";

// Mismo umbral que ya usa el aviso de corte de tarjeta (ver lib/avisos.ts):
// se reutiliza aquí para que "hay que pagar" y el aviso del Centro de Avisos
// nunca queden desincronizados.
export const DIAS_AVISO_CORTE_ORI = 3;
// No existía un umbral de "gasto alto" antes de Ori: 85% del ingreso del mes
// es el corte razonable pedido — mismo espíritu que el umbral de cumplimiento
// semanal (85%) que ya usa la economía de hábitos.
const UMBRAL_GASTO_ALTO = 0.85;

/**
 * Estado de Ori en modo hábito (compañero junto a la racha, en Panel y
 * Hábitos). "protegido" tiene prioridad: si ayer se cubrió automáticamente
 * con una protección, eso es lo más reciente y relevante que contar, aunque
 * la racha ya siga viva gracias a eso.
 */
export function estadoOriHabito(state: KaizenState): OriState {
  const hoy = hoyISO();
  const ayer = sumarDias(hoy, -1);
  const protegioAyer = state.usuario.diasProtegidos.includes(ayer);
  if (protegioAyer) return "protegido";

  const racha = rachaDiariaVigente(state);
  if (racha === 0 && state.registrosDiarios.length > 0) return "enojado";
  return "reposo";
}

/**
 * Estado de Ori en modo finanzas para el % gastado del mes (Finanzas >
 * Resumen). Devuelve null cuando no hay ingreso mensual registrado: sin esa
 * referencia no hay "gasto alto" que evaluar, así que ahí no debe aparecer.
 */
export function estadoOriFinanzasResumen(state: KaizenState): OriState | null {
  const hoy = hoyISO();
  const mesActual = mesDe(hoy);
  const desde = `${mesActual}-01`;
  const hasta = `${mesActual}-${String(diasDelMes(mesActual)).padStart(2, "0")}`;
  const totalMes = state.finanzas.gastos
    .filter((g) => g.fecha >= desde && g.fecha <= hasta)
    .reduce((acc, g) => acc + g.monto, 0);
  const ingreso = state.finanzas.ingresosMensuales.find((i) => i.mes === mesActual)?.monto ?? 0;
  if (ingreso <= 0) return null;
  const pct = totalMes / ingreso;
  return pct >= UMBRAL_GASTO_ALTO ? "enojado" : "reposo";
}

/** ¿El corte de esta tarjeta está a `DIAS_AVISO_CORTE_ORI` días o menos? Para el chip "hay que pagar" en Finanzas > Tarjetas. */
export function tarjetaProximaACortar(tarjeta: Tarjeta, hoy: string = hoyISO()): boolean {
  const { fin } = cicloTarjeta(tarjeta, hoy);
  const diasFaltantes = diasEntre(hoy, fin);
  return diasFaltantes >= 0 && diasFaltantes <= DIAS_AVISO_CORTE_ORI;
}
