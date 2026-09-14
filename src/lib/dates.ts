// Utilidades de fecha. Las semanas van de lunes a domingo.

export function hoyISO(): string {
  return toISO(new Date());
}

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISO(fecha: string): Date {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function mesDe(fecha: string): string {
  return fecha.slice(0, 7);
}

export function sumarDias(fecha: string, dias: number): string {
  const d = parseISO(fecha);
  d.setDate(d.getDate() + dias);
  return toISO(d);
}

export function diasEntre(a: string, b: string): number {
  const da = parseISO(a).getTime();
  const db = parseISO(b).getTime();
  return Math.round((db - da) / 86400000);
}

// Lunes de la semana que contiene `fecha`.
export function inicioSemana(fecha: string): string {
  const d = parseISO(fecha);
  const dow = d.getDay(); // 0 domingo .. 6 sabado
  const offset = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + offset);
  return toISO(d);
}

export function finSemana(fecha: string): string {
  return sumarDias(inicioSemana(fecha), 6);
}

export function semanaAnterior(inicioSemanaISO: string): { inicio: string; fin: string } {
  const inicio = sumarDias(inicioSemanaISO, -7);
  return { inicio, fin: sumarDias(inicio, 6) };
}

export function diasDelMes(mes: string): number {
  const [y, m] = mes.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function diaDelMes(fecha: string): number {
  return parseISO(fecha).getDate();
}

export function mesAnterior(mes: string): string {
  const [y, m] = mes.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function mesSiguiente(mes: string): string {
  const [y, m] = mes.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function esFechaFutura(fecha: string): boolean {
  return fecha > hoyISO();
}

export function formatoLargo(fecha: string): string {
  const d = parseISO(fecha);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

export function formatoMes(mes: string): string {
  const [y, m] = mes.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}
