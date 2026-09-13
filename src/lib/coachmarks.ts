// Bandera local (por perfil, por navegador) de si ya se mostró el tour guiado
// de bienvenida al dashboard. No vive en el estado persistido de Zustand: es
// puramente de UI y nunca debe viajar en el export/import de datos.
function clave(perfilId: string): string {
  return `kaizen:coachmarks:${perfilId}`;
}

export function coachmarksYaVistos(perfilId: string): boolean {
  try {
    return localStorage.getItem(clave(perfilId)) === "1";
  } catch {
    return true;
  }
}

export function marcarCoachmarksVistos(perfilId: string): void {
  try {
    localStorage.setItem(clave(perfilId), "1");
  } catch {
    // almacenamiento no disponible (modo privado, etc.): no bloquea la app
  }
}
