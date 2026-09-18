import type { AreaConfig, AreaId, CategoriaGasto, Config, DistribucionCategoria, Gasto, RegistroDiario, Tarjeta } from "@/types";
import { diasDelMes, diaDelMes, mesDe, parseISO, sumarDias, toISO } from "@/lib/dates";

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

export function metaSemanalBase(area: AreaConfig): number {
  return area.metaSemanalBase;
}

export function metaSemanalEfectiva(area: AreaConfig, config: Config): number {
  const base = metaSemanalBase(area);
  return base * multiplicadorEtapa(area, config, base);
}

export function metaDiariaEfectiva(area: AreaConfig, config: Config): number | null {
  if (area.metaDiaria === null) return null;
  const base = metaSemanalBase(area);
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

export function cumplimientoSemanalArea(
  area: AreaConfig,
  config: Config,
  registros: RegistroDiario[],
  inicio: string,
  fin: string
): number {
  const registrosSemana = registrosDeSemana(registros, inicio, fin);
  const total = sumaAreaEnSemana(registrosSemana, area.id);
  const meta = metaSemanalEfectiva(area, config);
  return meta > 0 ? Math.min(1, total / meta) : 0;
}

export function cumplimientoGlobalSemanal(
  cumplimientoPorArea: Record<AreaId, number>,
  areas: AreaConfig[]
): number {
  // Un hábito pausado no debe arrastrar el cumplimiento global hacia abajo:
  // se excluye del promedio y se reparte el peso restante entre las áreas activas.
  const activas = areas.filter((a) => !a.pausada);
  const pesoTotal = activas.reduce((acc, a) => acc + a.peso, 0);
  if (pesoTotal <= 0) return 0;
  return activas.reduce((acc, a) => acc + a.peso * (cumplimientoPorArea[a.id] ?? 0), 0) / pesoTotal;
}

// ---------------------------------------------------------------------------
// 6.2 / 6.3 — PP semanales y nivel global
// ---------------------------------------------------------------------------

export function ppSemana(
  cumplimientoGlobal: number,
  config: Config,
  bonosPP: number
): number {
  return Math.round(config.economia.ppBase * cumplimientoGlobal) + bonosPP;
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
// 8 — Finanzas: control de gastos puro (sin presupuesto ni recompensas).
// ---------------------------------------------------------------------------

export function gastadoEnCategoria(gastos: Gasto[], categoriaId: string, desde: string, hasta: string): number {
  return gastos
    .filter((g) => g.categoriaId === categoriaId && g.fecha >= desde && g.fecha <= hasta)
    .reduce((acc, g) => acc + g.monto, 0);
}

export function distribucionCategorias(
  gastos: Gasto[],
  categorias: CategoriaGasto[],
  desde: string,
  hasta: string
): DistribucionCategoria[] {
  const enRango = gastos.filter((g) => g.fecha >= desde && g.fecha <= hasta);
  const total = enRango.reduce((acc, g) => acc + g.monto, 0);
  return categorias
    .map((c) => {
      const monto = enRango.filter((g) => g.categoriaId === c.id).reduce((acc, g) => acc + g.monto, 0);
      return { categoriaId: c.id, nombre: c.nombre, monto, porcentaje: total > 0 ? monto / total : 0 };
    })
    .filter((c) => c.monto > 0)
    .sort((a, b) => b.monto - a.monto);
}

export function gastoPromedioDiario(gastos: Gasto[], desde: string, hasta: string): number {
  const dias = Math.max(1, diasDelMes(mesDe(hasta)));
  const total = gastos.filter((g) => g.fecha >= desde && g.fecha <= hasta).reduce((acc, g) => acc + g.monto, 0);
  return total / dias;
}

export function diaMasCaro(gastos: Gasto[], desde: string, hasta: string): { fecha: string; monto: number } | null {
  const porFecha = new Map<string, number>();
  for (const g of gastos) {
    if (g.fecha < desde || g.fecha > hasta) continue;
    porFecha.set(g.fecha, (porFecha.get(g.fecha) ?? 0) + g.monto);
  }
  let mejor: { fecha: string; monto: number } | null = null;
  for (const [fecha, monto] of porFecha) {
    if (!mejor || monto > mejor.monto) mejor = { fecha, monto };
  }
  return mejor;
}

/** Ciclo de corte de una tarjeta que contiene `fechaRef`, a partir de su día de corte. */
export function cicloTarjeta(tarjeta: Tarjeta, fechaRef: string): { inicio: string; fin: string } {
  const d = parseISO(fechaRef);
  const diaCorteMesActual = Math.min(tarjeta.diaCorte, diasDelMes(mesDe(fechaRef)));
  const corteEsteMes = toISO(new Date(d.getFullYear(), d.getMonth(), diaCorteMesActual));

  const fin = fechaRef <= corteEsteMes ? corteEsteMes : (() => {
    const mesSig = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const diaCorteSig = Math.min(tarjeta.diaCorte, new Date(mesSig.getFullYear(), mesSig.getMonth() + 1, 0).getDate());
    return toISO(new Date(mesSig.getFullYear(), mesSig.getMonth(), diaCorteSig));
  })();

  const inicio = sumarDias(cicloAnteriorFin(tarjeta, fin), 1);
  return { inicio, fin };
}

function cicloAnteriorFin(tarjeta: Tarjeta, finActual: string): string {
  const d = parseISO(finActual);
  const mesAnt = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  const diaCorteAnt = Math.min(tarjeta.diaCorte, new Date(mesAnt.getFullYear(), mesAnt.getMonth() + 1, 0).getDate());
  return toISO(new Date(mesAnt.getFullYear(), mesAnt.getMonth(), diaCorteAnt));
}

// ---------------------------------------------------------------------------
// 10 — Protecciones
// ---------------------------------------------------------------------------

export function dentroDeVentanaProteccion(finSemanaISO: string, ahora: Date, horasVentana: number): boolean {
  const cierre = new Date(finSemanaISO + "T23:59:59");
  const limite = new Date(cierre.getTime() + horasVentana * 3600 * 1000);
  return ahora <= limite;
}

// re-export para quien solo necesite el día del mes al calcular ciclos de corte
export { diaDelMes };
