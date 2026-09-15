// Bandera local (por perfil, por navegador) de si ya se mostró la burbuja de
// bienvenida de Ori. Mismo patrón que kaizen:coachmarks:<id> (ver
// lib/coachmarks.ts) pero en su propia llave: son dos mensajes de "primera
// vez" independientes entre sí (un perfil viejo que ya vio el tour guiado no
// debería saltarse la presentación de Ori, ni viceversa).
function clave(perfilId: string): string {
  return `kaizen:ori-bienvenida:${perfilId}`;
}

export function oriBienvenidaYaVista(perfilId: string): boolean {
  try {
    return localStorage.getItem(clave(perfilId)) === "1";
  } catch {
    return true;
  }
}

export function marcarOriBienvenidaVista(perfilId: string): void {
  try {
    localStorage.setItem(clave(perfilId), "1");
  } catch {
    // almacenamiento no disponible (modo privado, etc.): no bloquea la app
  }
}
