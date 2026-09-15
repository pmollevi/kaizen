import type { SexoBiologico } from "@/types";

// Soporte para el modo "Conteo de calorías" del hábito Alimentación (vitalidad).
//
// TDEE aproximado vía Mifflin-St Jeor (BMR) + un factor de actividad fijo.
// No se pregunta nivel de actividad (fuera del alcance pedido), así que se
// usa "ligeramente activo" (1.375) como default razonable y conservador —
// ni sedentario ni muy activo. El resultado es siempre una SUGERENCIA
// editable, nunca un valor forzado.
const FACTOR_ACTIVIDAD_DEFAULT = 1.375;

export function caloriasSugeridasPorDia(pesoKg: number, tallaCm: number, edad: number, sexo: SexoBiologico): number {
  const bmr = 10 * pesoKg + 6.25 * tallaCm - 5 * edad + (sexo === "m" ? 5 : -161);
  return Math.max(1000, Math.round((bmr * FACTOR_ACTIVIDAD_DEFAULT) / 10) * 10);
}
