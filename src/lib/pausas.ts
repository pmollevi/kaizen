// Punto 8: sugerir pausar un hábito que lleva varios días sin registrarse
// mientras el resto sigue con normalidad, y recordar qué sugerencias ya se
// atendieron (aceptadas o ignoradas) sin volver a mostrarlas de inmediato.
import type { AreaId, KaizenState } from "@/types";

export const DIAS_PARA_SUGERIR_PAUSA = 5;

/**
 * Días seguidos (contando desde el registro más reciente hacia atrás) en los
 * que este hábito quedó en 0 mientras al menos otro hábito activo sí se
 * registró ese mismo día — así no se sugiere pausar solo porque el usuario
 * dejó de usar la app por completo.
 */
export function diasSeguidosSinHabito(state: KaizenState, areaId: AreaId): number {
  const registros = [...state.registrosDiarios].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  let dias = 0;
  for (const r of registros) {
    if ((r.valores[areaId] ?? 0) > 0) break;
    const siguioRegistrandoOtros = state.areas.some(
      (a) => a.id !== areaId && !a.pausada && (r.valores[a.id] ?? 0) > 0
    );
    if (!siguioRegistrandoOtros) break;
    dias += 1;
  }
  return dias;
}

function clave(perfilId: string): string {
  return `kaizen:pausas-sugeridas-descartadas:${perfilId}`;
}

/** Mapa areaId -> racha de días sin registrar que tenía cuando se ignoró por última vez. */
function obtenerDescartes(perfilId: string): Record<AreaId, number> {
  try {
    const raw = localStorage.getItem(clave(perfilId));
    return raw ? (JSON.parse(raw) as Record<AreaId, number>) : {};
  } catch {
    return {};
  }
}

/** ¿Ya se ignoró esta sugerencia para esta racha exacta (o una más corta)? Si la racha siguió creciendo, vuelve a mostrarse. */
export function pausaFueDescartada(perfilId: string, areaId: AreaId, diasActuales: number): boolean {
  const descartes = obtenerDescartes(perfilId);
  const diasAlDescartar = descartes[areaId];
  return diasAlDescartar !== undefined && diasActuales <= diasAlDescartar;
}

export function marcarPausaDescartada(perfilId: string, areaId: AreaId, diasActuales: number): void {
  try {
    const descartes = obtenerDescartes(perfilId);
    descartes[areaId] = diasActuales;
    localStorage.setItem(clave(perfilId), JSON.stringify(descartes));
  } catch {
    // almacenamiento no disponible: la sugerencia solo vuelve a aparecer, no rompe nada
  }
}
