// Capa sobre la Notification API del navegador, mostrada siempre a través
// del service worker (ServiceWorkerRegistration.showNotification) — algunos
// navegadores (Chrome en Android) directamente no permiten `new Notification()`
// desde la página. Nunca reemplaza el banner/toast dentro de la app, que
// siempre funciona: esto solo complementa, y solo si el usuario dio permiso.

export type EstadoPermiso = "granted" | "denied" | "default" | "no-soportado";

export function estadoPermisoNotificaciones(): EstadoPermiso {
  if (typeof Notification === "undefined") return "no-soportado";
  return Notification.permission;
}

async function mostrar(titulo: string, cuerpo: string): Promise<void> {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    if ("serviceWorker" in navigator) {
      const registro = await navigator.serviceWorker.ready;
      await registro.showNotification(titulo, { body: cuerpo, icon: "icons/icon-192.png" });
      return;
    }
    new Notification(titulo, { body: cuerpo, icon: "icons/icon-192.png" });
  } catch {
    // el banner dentro de la app sigue funcionando igual
  }
}

/** Avisos tipo "racha en riesgo" / "corte de tarjeta": solo tiene sentido molestar si la pestaña ya no se está viendo. */
export function notificarSiEnSegundoPlano(titulo: string, cuerpo: string): void {
  if (typeof document !== "undefined" && document.visibilityState !== "hidden") return;
  void mostrar(titulo, cuerpo);
}

/** Festejo de un hito de racha: momento puntual y poco frecuente — se muestra siempre, esté la pestaña visible o no. */
export function celebrarHito(titulo: string, cuerpo: string): void {
  void mostrar(titulo, cuerpo);
}
