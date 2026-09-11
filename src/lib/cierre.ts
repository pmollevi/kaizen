import type {
  AreaConfig,
  AreaId,
  CierreSemanal,
  KaizenState,
  ResumenMensual,
  Usuario,
} from "@/types";
import {
  calcularAsignaciones,
  cumplimientoGlobalSemanal,
  cumplimientoSemanalArea,
  creditosSemana,
  gastadoEnCategoria,
  nivelDesdePP,
  pctDesbloqueo,
  ppSemana,
} from "@/lib/formulas";
import { diasDelMes, inicioSemana, mesAnterior, mesDe, sumarDias } from "@/lib/dates";

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
  const presupuestoDelMes = state.finanzas.presupuestos.find((p) => p.mes === mesDe(fin));

  const cumplimientoPorArea = {} as Record<AreaId, number>;
  for (const area of state.areas) {
    cumplimientoPorArea[area.id] = cumplimientoSemanalArea(
      area,
      config,
      state.registrosDiarios,
      inicio,
      fin,
      state.finanzas.gastos,
      presupuestoDelMes
    );
  }
  const cumplimientoGlobal = cumplimientoGlobalSemanal(cumplimientoPorArea, state.areas);

  const bonosAplicados = protegerSemana
    ? []
    : config.bonos.filter((b) => bonosIds.includes(b.id)).map((b) => ({ id: b.id, nombre: b.nombre, valorPP: b.valorPP }));
  const bonosPPTotal = bonosAplicados.reduce((acc, b) => acc + b.valorPP, 0);
  const ppBase = Math.round(config.economia.ppBase * cumplimientoGlobal);
  const ppGanados = protegerSemana ? 0 : ppBase + bonosPPTotal;
  const creditosGanados = protegerSemana ? 0 : creditosSemana(ppGanados, config);

  const nivelesAreaSubidos: AreaId[] = [];
  const areas = state.areas.map((area) => {
    if (protegerSemana) return { ...area };
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
    creditos: state.usuario.creditos + creditosGanados,
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
    creditosGanados,
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
  saldoBanco: number;
  proteccionGanada: boolean;
  bumpDineroUtilMesSiguiente: number;
}

export function calcularCierreMensual(state: KaizenState, mes: string): ResultadoCierreMensual {
  const { config } = state;
  const presupuesto = state.finanzas.presupuestos.find((p) => p.mes === mes);
  const gastosDelMes = state.finanzas.gastos.filter((g) => mesDe(g.fecha) === mes);
  const asignaciones = presupuesto ? calcularAsignaciones(presupuesto) : new Map<string, number>();

  const categorias = (presupuesto?.categorias ?? []).map((cat) => {
    const asignado = asignaciones.get(cat.id) ?? 0;
    const gastado = gastadoEnCategoria(state.finanzas.gastos, cat.id, mes);
    const diferencia = asignado - gastado;
    const porcentajeUso = asignado > 0 ? gastado / asignado : 0;
    return {
      categoriaId: cat.id,
      nombre: cat.nombre,
      asignado,
      gastado,
      diferencia,
      porcentajeUso,
      sobregiro: cat.tipo === "gasto" && gastado > asignado,
    };
  });

  const catGasto = (presupuesto?.categorias ?? []).filter((c) => c.tipo === "gasto");
  const catAhorro = (presupuesto?.categorias ?? []).filter((c) => c.tipo === "ahorro");
  const catRecompensas = presupuesto?.categorias.find((c) => c.tipo === "recompensas");

  const totalGastado = catGasto.reduce((acc, c) => acc + gastadoEnCategoria(state.finanzas.gastos, c.id, mes), 0);
  let totalAhorrado = catAhorro.reduce((acc, c) => acc + (asignaciones.get(c.id) ?? 0), 0);

  const dias = diasDelMes(mes);
  const gastoPromedioDiario = totalGastado / dias;

  const porFecha = new Map<string, number>();
  for (const g of gastosDelMes) porFecha.set(g.fecha, (porFecha.get(g.fecha) ?? 0) + g.monto);
  let diaMasCaro: { fecha: string; monto: number } | null = null;
  for (const [fecha, monto] of porFecha) {
    if (!diaMasCaro || monto > diaMasCaro.monto) diaMasCaro = { fecha, monto };
  }

  const porPalabra = new Map<string, { monto: number; frecuencia: number }>();
  for (const g of gastosDelMes) {
    const clave = g.palabraClave.trim().toLowerCase() || "(sin palabra clave)";
    const actual = porPalabra.get(clave) ?? { monto: 0, frecuencia: 0 };
    porPalabra.set(clave, { monto: actual.monto + g.monto, frecuencia: actual.frecuencia + 1 });
  }
  const topPalabrasClavePorMonto = [...porPalabra.entries()]
    .sort((a, b) => b[1].monto - a[1].monto)
    .slice(0, 10)
    .map(([palabra, v]) => ({ palabra, monto: v.monto }));
  const topPalabrasClavePorFrecuencia = [...porPalabra.entries()]
    .sort((a, b) => b[1].frecuencia - a[1].frecuencia)
    .slice(0, 10)
    .map(([palabra, v]) => ({ palabra, frecuencia: v.frecuencia }));

  const resumenesPrevios = state.finanzas.resumenesMensuales.filter((r) => r.mes < mes);
  const comparativaMesesAnteriores = resumenesPrevios.slice(-3).map((r) => ({ mes: r.mes, totalGastado: r.totalGastado }));
  const promedioHistorico =
    resumenesPrevios.length > 0
      ? resumenesPrevios.reduce((acc, r) => acc + r.totalGastado, 0) / resumenesPrevios.length
      : 0;

  const semanasDelMes = state.cierresSemanales.filter((c) => mesDe(c.semanaFin) === mes);
  const cumplimientoPromedioMes =
    semanasDelMes.length > 0
      ? semanasDelMes.reduce((acc, c) => acc + c.cumplimientoGlobal, 0) / semanasDelMes.length
      : 0;
  const retoFinalSuperadoEsteMes =
    state.temporadaActual.retoFinal.completado &&
    !!state.temporadaActual.retoFinal.fechaCompletado &&
    mesDe(state.temporadaActual.retoFinal.fechaCompletado) === mes;
  const pctFondoLiberado = pctDesbloqueo(cumplimientoPromedioMes, config, retoFinalSuperadoEsteMes);

  // Desbloqueo del fondo de recompensas de ESTE mes, según el desempeño del mes ANTERIOR.
  const resumenMesAnterior = state.finanzas.resumenesMensuales.find((r) => r.mes === mesAnterior(mes));
  const pctAplicable = resumenMesAnterior ? resumenMesAnterior.pctFondoLiberado : 1; // primer mes: beneficio de la duda
  const asignadoRecompensas = catRecompensas ? asignaciones.get(catRecompensas.id) ?? 0 : 0;
  const liberado = asignadoRecompensas * Math.min(1, pctAplicable);
  const noLiberado = asignadoRecompensas - liberado;
  totalAhorrado += noLiberado;

  let saldoBanco = state.finanzas.bancoRecompensas.saldo + liberado;
  const tope = state.finanzas.bancoRecompensas.tope;
  if (saldoBanco > tope) {
    totalAhorrado += saldoBanco - tope;
    saldoBanco = tope;
  }

  // Sobrante de las categorías de gasto, según el destino configurado.
  const sobranteGasto = categorias
    .filter((c) => presupuesto?.categorias.find((cc) => cc.id === c.categoriaId)?.tipo === "gasto")
    .reduce((acc, c) => acc + Math.max(0, c.diferencia), 0);
  let bumpDineroUtilMesSiguiente = 0;
  if (sobranteGasto > 0) {
    if (config.economia.destinoSobranteDefault === "ahorro") {
      totalAhorrado += sobranteGasto;
    } else if (config.economia.destinoSobranteDefault === "banco") {
      saldoBanco = Math.min(tope, saldoBanco + sobranteGasto);
    } else {
      bumpDineroUtilMesSiguiente = sobranteGasto;
    }
  }

  const proteccionGanada =
    semanasDelMes.length > 0 &&
    semanasDelMes.reduce((acc, c) => acc + c.cumplimientoGlobal, 0) / semanasDelMes.length >=
      config.economia.umbralProteccionMensual;

  const resumen: ResumenMensual = {
    mes,
    totalGastado,
    totalAhorrado,
    dineroUtil: presupuesto?.dineroUtil ?? 0,
    categorias,
    topPalabrasClavePorMonto,
    topPalabrasClavePorFrecuencia,
    gastoPromedioDiario,
    diaMasCaro,
    comparativaMesesAnteriores,
    promedioHistorico,
    destinoSobrante: config.economia.destinoSobranteDefault,
    cumplimientoPromedioMes,
    pctFondoLiberado,
  };

  return { resumen, saldoBanco, proteccionGanada, bumpDineroUtilMesSiguiente };
}

/** Lista de meses (YYYY-MM) ya terminados que aún no tienen resumen generado. */
export function mesesPendientesDeCierre(state: KaizenState, mesActual: string): string[] {
  const yaCerrados = new Set(state.finanzas.resumenesMensuales.map((r) => r.mes));
  const fechas = [
    ...state.finanzas.presupuestos.map((p) => p.mes + "-01"),
    ...state.registrosDiarios.map((r) => r.fecha),
    ...state.finanzas.gastos.map((g) => g.fecha),
  ];
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
