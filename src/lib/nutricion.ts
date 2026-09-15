// Soporte para el modo "Calorías" del hábito Alimentación (vitalidad).
//
// El usuario solo da talla y peso (sin edad ni sexo), así que el rango de
// referencia es necesariamente aproximado: se asume una edad promedio (30
// años) y un punto medio entre las constantes masculina/femenina de la
// fórmula de Mifflin-St Jeor, y luego se aplica un rango de actividad
// ligera-moderada (1.2x-1.55x) como banda de mantenimiento. Se muestra
// siempre como "rango de referencia", nunca como recomendación médica.
export function rangoCaloricoReferencia(pesoKg: number, tallaCm: number): { min: number; max: number } {
  const tmb = 10 * pesoKg + 6.25 * tallaCm - 5 * 30 - 78; // -78 = promedio entre +5 (hombre) y -161 (mujer)
  const min = Math.max(1000, Math.round((tmb * 1.2) / 10) * 10);
  const max = Math.max(min, Math.round((tmb * 1.55) / 10) * 10);
  return { min, max };
}

/**
 * Traduce las calorías registradas en un día al mismo puntaje 0-3 que usan
 * el resto de los modos de Alimentación, para que el cumplimiento semanal y
 * la economía de PP no necesiten saber nada de calorías: 3 si cae dentro del
 * rango de referencia, 2 si está cerca (dentro de un margen del 25% del
 * rango), 1 si se registró pero lejos del rango. 0 solo si no se registró nada.
 */
export function puntajeCalorias(kcal: number, rango: { min: number; max: number }): number {
  if (kcal <= 0) return 0;
  if (kcal >= rango.min && kcal <= rango.max) return 3;
  const margen = (rango.max - rango.min) * 0.25;
  if (kcal >= rango.min - margen && kcal <= rango.max + margen) return 2;
  return 1;
}

/** Clave usada dentro de `valores` para guardar las calorías crudas junto al puntaje derivado. */
export function claveCalorias(areaId: string): string {
  return `${areaId}__kcal`;
}
