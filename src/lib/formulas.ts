import type {
  AreaConfig,
  AreaId,
  CategoriaPresupuesto,
  Config,
  Gasto,
  PresupuestoMensual,
  RegistroDiario,
} from "@/types";
import { diasDelMes, diaDelMes, mesDe } from "@/lib/dates";

// ---------------------------------------------------------------------------
// 6.5 — Progresión por etapas: la exigencia sube cada N niveles, no cada nivel.
// ---------------------------------------------------------------------------

export function etapaArea(nivelArea: number, config: Config): number {
  return Math.ceil(nivelArea / config.economia.nivelesPorEtapa);
}

export function multiplicadorEtapa(area: AreaConfig, config: Config, metaBase: number): number {
  const etapa = etapaArea(area.nivel, config);
  const meta = metaBase * Math.pow(1 + config.economia.incrementoPorEtapa, etapa - 1);
  const metaTope = Math.min(meta, area.topeMetaSemanal);
  return metaBase > 0 ? metaTope / metaBase : 1;
}

export function metaSemanalBase(area: AreaConfig, config: Config): number {
  return area.vinculoFinanciero ? config.imperio.metaSemanalHorasNegocio : area.metaSemanalBase;
}

export function metaSemanalEfectiva(area: AreaConfig, config: Config): number {
  const base = metaSemanalBase(area, config);
  return base * multiplicadorEtapa(area, config, base);
}

export function metaDiariaEfectiva(area: AreaConfig, config: Config): number | null {
  if (area.metaDiaria === null) return null;
  const base = metaSemanalBase(area, config);
  return area.metaDiaria * multiplicadorEtapa(area, config, base);
}

// ---------------------------------------------------------------------------
// 6.1 — Cumplimiento
// ---------------------------------------------------------------------------

export function cumplimientoDiario(area: AreaConfig, config: Config, valor: number): number | null {
  const meta = metaDiariaEfectiva(area, config);
  if (meta === null || meta <= 0) return null;
  return Math.min(1, valor / meta);
}

export function registrosDeSemana(
  registros: RegistroDiario[],
  inicio: string,
  fin: string
): RegistroDiario[] {
  return registros.filter((r) => r.fecha >= inicio && r.fecha <= fin);
}

export function sumaAreaEnSemana(registros: RegistroDiario[], areaId: AreaId): number {
  return registros.reduce((acc, r) => acc + (r.valores[areaId] ?? 0), 0);
}

/** Categorías de tipo "gasto" que están dentro de su ritmo a la fecha dada. */
export function categoriasDentroDePresupuesto(
  presupuesto: PresupuestoMensual | undefined,
  gastos: Gasto[],
  fechaCorte: string
): { dentro: number; total: number } {
  if (!presupuesto) return { dentro: 0, total: 0 };
  const asignaciones = calcularAsignaciones(presupuesto);
  const categoriasGasto = presupuesto.categorias.filter((c) => c.tipo === "gasto");
  const dias = diasDelMes(presupuesto.mes);
  const diaActual = Math.min(diaDelMes(fechaCorte), dias);
  let dentro = 0;
  for (const cat of categoriasGasto) {
    const asignado = asignaciones.get(cat.id) ?? 0;
    const gastado = gastos
      .filter((g) => g.categoriaId === cat.id && mesDe(g.fecha) === presupuesto.mes && g.fecha <= fechaCorte)
      .reduce((acc, g) => acc + g.monto, 0);
    const ritmoEsperado = asignado * (diaActual / dias);
    if (gastado <= ritmoEsperado || asignado === 0) dentro += 1;
  }
  return { dentro, total: categoriasGasto.length };
}

export function cumplimientoFinancieroSemanal(
  registros: RegistroDiario[],
  gastos: Gasto[],
  presupuesto: PresupuestoMensual | undefined,
  inicio: string,
  fin: string
): number {
  if (!presupuesto) return 0; // sin presupuesto del mes no hay nada contra qué cumplir
  const gastosEnSemana = gastos.filter((g) => g.fecha >= inicio && g.fecha <= fin);
  const diasConGasto = new Set(gastosEnSemana.map((g) => g.fecha)).size;
  const { dentro, total } = categoriasDentroDePresupuesto(presupuesto, gastos, fin);
  const parteRegistro = diasConGasto / 7;
  const parteCategorias = total > 0 ? dentro / total : 1;
  return 0.5 * parteRegistro + 0.5 * parteCategorias;
}

export function cumplimientoSemanalArea(
  area: AreaConfig,
  config: Config,
  registros: RegistroDiario[],
  inicio: string,
  fin: string,
  gastos: Gasto[],
  presupuestoDelMes: PresupuestoMensual | undefined
): number {
  const registrosSemana = registrosDeSemana(registros, inicio, fin);
  if (area.vinculoFinanciero) {
    const horasNegocio = sumaAreaEnSemana(registrosSemana, area.id);
    const metaNegocio = metaSemanalEfectiva(area, config);
    const cumplNegocio = metaNegocio > 0 ? Math.min(1, horasNegocio / metaNegocio) : 0;
    const cumplFinanzas = cumplimientoFinancieroSemanal(registros, gastos, presupuestoDelMes, inicio, fin);
    return config.imperio.pesoNegocio * cumplNegocio + config.imperio.pesoFinanzas * cumplFinanzas;
  }
  const total = sumaAreaEnSemana(registrosSemana, area.id);
  const meta = metaSemanalEfectiva(area, config);
  return meta > 0 ? Math.min(1, total / meta) : 0;
}

export function cumplimientoGlobalSemanal(
  cumplimientoPorArea: Record<AreaId, number>,
  areas: AreaConfig[]
): number {
  return areas.reduce((acc, a) => acc + a.peso * (cumplimientoPorArea[a.id] ?? 0), 0);
}

// ---------------------------------------------------------------------------
// 6.2 / 6.3 — PP semanales, créditos y nivel global
// ---------------------------------------------------------------------------

export function ppSemana(
  cumplimientoGlobal: number,
  config: Config,
  bonosPP: number
): number {
  return Math.round(config.economia.ppBase * cumplimientoGlobal) + bonosPP;
}

export function creditosSemana(pp: number, config: Config): number {
  return Math.round(pp / config.economia.creditosPorPP);
}

export function ppParaNivel(nivel: number, config: Config): number {
  if (nivel <= 1) return 0;
  return Math.round(config.economia.curvaBase * Math.pow(nivel - 1, config.economia.curvaExponente));
}

export function nivelDesdePP(ppTotales: number, config: Config) {
  let nivel = 1;
  // Tope de iteraciones: una curvaBase mal configurada (ej. 0) no debe congelar la app.
  while (ppParaNivel(nivel + 1, config) <= ppTotales && nivel < 9999) {
    nivel += 1;
  }
  const ppNivelActual = ppParaNivel(nivel, config);
  const ppSiguienteNivel = ppParaNivel(nivel + 1, config);
  const faltante = Math.max(0, ppSiguienteNivel - ppTotales);
  const rango = ppSiguienteNivel - ppNivelActual;
  const progresoPct = rango > 0 ? Math.min(1, (ppTotales - ppNivelActual) / rango) : 1;
  return { nivel, ppNivelActual, ppSiguienteNivel, faltante, progresoPct };
}

// ---------------------------------------------------------------------------
// 8.3 — Panel financiero
// ---------------------------------------------------------------------------

export function calcularAsignaciones(presupuesto: PresupuestoMensual): Map<string, number> {
  const resultado = new Map<string, number>();
  let usado = 0;
  let categoriaResto: CategoriaPresupuesto | null = null;
  for (const cat of presupuesto.categorias) {
    if (cat.modo === "fijo") {
      resultado.set(cat.id, cat.valor);
      usado += cat.valor;
    } else if (cat.modo === "porcentaje") {
      const monto = presupuesto.dineroUtil * (cat.valor / 100);
      resultado.set(cat.id, monto);
      usado += monto;
    } else {
      categoriaResto = cat;
    }
  }
  if (categoriaResto) {
    resultado.set(categoriaResto.id, Math.max(0, presupuesto.dineroUtil - usado));
  }
  return resultado;
}

export function sinAsignar(presupuesto: PresupuestoMensual): number {
  const tieneResto = presupuesto.categorias.some((c) => c.modo === "resto");
  if (tieneResto) return 0;
  const asignaciones = calcularAsignaciones(presupuesto);
  const usado = [...asignaciones.values()].reduce((a, b) => a + b, 0);
  return Math.max(0, presupuesto.dineroUtil - usado);
}

export function gastadoEnCategoria(gastos: Gasto[], categoriaId: string, mes: string): number {
  return gastos
    .filter((g) => g.categoriaId === categoriaId && mesDe(g.fecha) === mes)
    .reduce((acc, g) => acc + g.monto, 0);
}

export function ritmoDiarioPermitido(asignado: number, gastado: number, diasRestantes: number): number {
  if (diasRestantes <= 0) return 0;
  return (asignado - gastado) / diasRestantes;
}

export function proyeccionCierre(gastoPromedioDiario: number, mes: string): number {
  return gastoPromedioDiario * diasDelMes(mes);
}

export function semaforo(pctUso: number): "verde" | "amarillo" | "rojo" {
  if (pctUso >= 1) return "rojo";
  if (pctUso >= 0.9) return "amarillo";
  return "verde";
}

// ---------------------------------------------------------------------------
// 9.1 — Desbloqueo económico
// ---------------------------------------------------------------------------

export function pctDesbloqueo(cumplimientoPromedioMes: number, config: Config, retoFinalSuperado: boolean): number {
  const tabla = [...config.economia.tablaDesbloqueo].sort((a, b) => b.umbral - a.umbral);
  let pct = 0;
  for (const fila of tabla) {
    if (cumplimientoPromedioMes >= fila.umbral) {
      pct = fila.porcentaje;
      break;
    }
  }
  if (retoFinalSuperado) pct += config.economia.bonoRetoFinalPct;
  return Math.min(1.1, pct);
}

// ---------------------------------------------------------------------------
// 10 — Protecciones
// ---------------------------------------------------------------------------

export function dentroDeVentanaProteccion(finSemanaISO: string, ahora: Date, horasVentana: number): boolean {
  const cierre = new Date(finSemanaISO + "T23:59:59");
  const limite = new Date(cierre.getTime() + horasVentana * 3600 * 1000);
  return ahora <= limite;
}
