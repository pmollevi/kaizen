import type {
  AreaConfig,
  AreaId,
  CierreSemanal,
  KaizenState,
  ResumenMensual,
  ResumenTarjeta,
  Tarjeta,
  Usuario,
} from "@/types";
import {
  cicloTarjeta,
  cumplimientoGlobalSemanal,
  cumplimientoSemanalArea,
  diaMasCaro,
  distribucionCategorias,
  gastoPromedioDiario,
  nivelDesdePP,
} from "@/lib/formulas";
import { diasDelMes, inicioSemana, mesDe, sumarDias } from "@/lib/dates";

export interface ResultadoCierreSemanal {
  cierre: CierreSemanal;
  areas: AreaConfig[];
  usuario: Usuario;
}

export function calcularCierreSemanal(
  state: KaizenState,
  inicio: string,
  fin: string,
  bonosIds: string[],
  protegerSemana: boolean
): ResultadoCierreSemanal {
  const { config } = state;

  const cumplimientoPorArea = {} as Record<AreaId, number>;
  for (const area of state.areas) {
    cumplimientoPorArea[area.id] = cumplimientoSemanalArea(area, config, state.registrosDiarios, inicio, fin);
  }
  const cumplimientoGlobal = cumplimientoGlobalSemanal(cumplimientoPorArea, state.areas);

  const bonosAplicados = protegerSemana
    ? []
    : config.bonos.filter((b) => bonosIds.includes(b.id)).map((b) => ({ id: b.id, nombre: b.nombre, valorPP: b.valorPP }));
  const bonosPPTotal = bonosAplicados.reduce((acc, b) => acc + b.valorPP, 0);
  const ppBase = Math.round(config.economia.ppBase * cumplimientoGlobal);
  const ppGanados = protegerSemana ? 0 : ppBase + bonosPPTotal;

  const nivelesAreaSubidos: AreaId[] = [];
  const areas = state.areas.map((area) => {
    // Un hábito pausado se queda exactamente como estaba: su racha semanal
    // (semanasConsecutivas) y nivel no avanzan ni se resetean mientras dure la pausa.
    if (protegerSemana || area.pausada) return { ...area };
    const cumplió = cumplimientoPorArea[area.id] >= config.economia.umbralNivelArea;
    let semanasConsecutivas = cumplió ? area.semanasConsecutivas + 1 : 0;
    let nivel = area.nivel;
    if (semanasConsecutivas >= config.economia.semanasParaNivelArea) {
      nivel += 1;
      semanasConsecutivas = 0;
      nivelesAreaSubidos.push(area.id);
    }
    return { ...area, nivel, semanasConsecutivas };
  });

  const ppTotales = state.usuario.ppTotales + ppGanados;
  const usuario: Usuario = {
    ...state.usuario,
    ppTotales,
    nivelGlobal: nivelDesdePP(ppTotales, config).nivel,
    protecciones: state.usuario.protecciones - (protegerSemana ? 1 : 0),
  };

  const cierre: CierreSemanal = {
    id: `c_${inicio}`,
    semanaInicio: inicio,
    semanaFin: fin,
    cumplimientoPorArea,
    cumplimientoGlobal,
    ppBase,
    bonosAplicados,
    ppGanados,
    protegida: protegerSemana,
    nivelesAreaSubidos,
  };

  return { cierre, areas, usuario };
}

/** Semanas ya terminadas (anteriores a la semana en curso) que todavía no tienen cierre registrado. */
export function semanasPendientes(state: KaizenState, inicioSemanaActual: string): string[] {
  const cerradas = new Set(state.cierresSemanales.map((c) => c.semanaInicio));
  const primeraFecha =
    state.registrosDiarios.length > 0
      ? [...state.registrosDiarios].sort((a, b) => (a.fecha < b.fecha ? -1 : 1))[0].fecha
      : state.temporadaActual.inicio;
  const inicioSemanaMasVieja = inicioSemana(primeraFecha);
  const pendientes: string[] = [];
  let cursor = inicioSemanaMasVieja;
  let guard = 0;
  while (cursor < inicioSemanaActual && guard < 104) {
    if (!cerradas.has(cursor)) pendientes.push(cursor);
    cursor = sumarDias(cursor, 7);
    guard += 1;
  }
  return pendientes;
}

export interface ResultadoCierreMensual {
  resumen: ResumenMensual;
  proteccionGanada: boolean;
}

export function calcularCierreMensual(state: KaizenState, mes: string): ResultadoCierreMensual {
  const { config, finanzas } = state;
  const desde = `${mes}-01`;
  const hasta = `${mes}-${String(diasDelMes(mes)).padStart(2, "0")}`;
  const gastosDelMes = finanzas.gastos.filter((g) => mesDe(g.fecha) === mes);

  const totalGastado = gastosDelMes.reduce((acc, g) => acc + g.monto, 0);
  const totalEfectivo = gastosDelMes.filter((g) => g.metodo === "efectivo").reduce((acc, g) => acc + g.monto, 0);
  const totalTarjeta = gastosDelMes.filter((g) => g.metodo === "tarjeta").reduce((acc, g) => acc + g.monto, 0);

  const categorias = distribucionCategorias(finanzas.gastos, finanzas.categorias, desde, hasta);
  const topCategorias = categorias.slice(0, 3);

  const resumenesPrevios = finanzas.resumenesMensuales.filter((r) => r.mes < mes);
  const comparativaMesesAnteriores = resumenesPrevios.slice(-3).map((r) => ({ mes: r.mes, totalGastado: r.totalGastado }));
  const promedioHistorico =
    resumenesPrevios.length > 0
      ? resumenesPrevios.reduce((acc, r) => acc + r.totalGastado, 0) / resumenesPrevios.length
      : 0;

  const semanasDelMes = state.cierresSemanales.filter((c) => mesDe(c.semanaFin) === mes);
  const proteccionGanada =
    semanasDelMes.length > 0 &&
    semanasDelMes.reduce((acc, c) => acc + c.cumplimientoGlobal, 0) / semanasDelMes.length >=
      config.economia.umbralProteccionMensual;

  const resumen: ResumenMensual = {
    mes,
    totalGastado,
    totalEfectivo,
    totalTarjeta,
    categorias,
    topCategorias,
    gastoPromedioDiario: gastoPromedioDiario(finanzas.gastos, desde, hasta),
    diaMasCaro: diaMasCaro(finanzas.gastos, desde, hasta),
    comparativaMesesAnteriores,
    promedioHistorico,
  };

  return { resumen, proteccionGanada };
}

/** Lista de meses (YYYY-MM) ya terminados que aún no tienen resumen generado. */
export function mesesPendientesDeCierre(state: KaizenState, mesActual: string): string[] {
  const yaCerrados = new Set(state.finanzas.resumenesMensuales.map((r) => r.mes));
  const fechas = [...state.registrosDiarios.map((r) => r.fecha), ...state.finanzas.gastos.map((g) => g.fecha)];
  if (fechas.length === 0) return [];
  const primerMes = fechas.sort()[0].slice(0, 7);
  const pendientes: string[] = [];
  let cursor = primerMes;
  while (cursor < mesActual) {
    if (!yaCerrados.has(cursor)) pendientes.push(cursor);
    const [y, m] = cursor.split("-").map(Number);
    const d = new Date(y, m, 1);
    cursor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  return pendientes;
}

export function calcularResumenTarjeta(
  tarjeta: Tarjeta,
  gastos: KaizenState["finanzas"]["gastos"],
  categorias: KaizenState["finanzas"]["categorias"],
  periodoInicio: string,
  periodoFin: string
): ResumenTarjeta {
  const gastosDelCiclo = gastos.filter(
    (g) => g.tarjetaId === tarjeta.id && g.fecha >= periodoInicio && g.fecha <= periodoFin
  );
  return {
    id: `rt_${tarjeta.id}_${periodoFin}`,
    tarjetaId: tarjeta.id,
    periodoInicio,
    periodoFin,
    totalGastado: gastosDelCiclo.reduce((acc, g) => acc + g.monto, 0),
    numeroGastos: gastosDelCiclo.length,
    categorias: distribucionCategorias(gastosDelCiclo, categorias, periodoInicio, periodoFin),
  };
}

/** Genera los resúmenes de corte de cualquier ciclo ya cerrado (fin < hoy) que aún no exista. */
export function resumenesTarjetaPendientes(state: KaizenState, hoy: string): ResumenTarjeta[] {
  const { finanzas } = state;
  const existentes = new Set(finanzas.resumenesTarjeta.map((r) => r.id));
  const nuevos: ResumenTarjeta[] = [];

  for (const tarjeta of finanzas.tarjetas) {
    const gastosTarjeta = finanzas.gastos.filter((g) => g.tarjetaId === tarjeta.id);
    if (gastosTarjeta.length === 0) continue;
    const primeraFecha = [...gastosTarjeta].sort((a, b) => (a.fecha < b.fecha ? -1 : 1))[0].fecha;

    let cursorFin = cicloTarjeta(tarjeta, primeraFecha).fin;
    let guard = 0;
    while (cursorFin < hoy && guard < 60) {
      const { inicio, fin } = cicloTarjeta(tarjeta, cursorFin);
      const resumen = calcularResumenTarjeta(tarjeta, finanzas.gastos, finanzas.categorias, inicio, fin);
      if (!existentes.has(resumen.id) && resumen.numeroGastos > 0) nuevos.push(resumen);
      cursorFin = sumarDias(fin, 1);
      guard += 1;
    }
  }
  return nuevos;
}
