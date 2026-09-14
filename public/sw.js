// Service worker de Kaizen: solo dos trabajos, nada de cache de app-shell (la
// app no pide funcionar offline, solo instalarse y recibir push real).
// 1. Instalabilidad como PWA (requisito del navegador para "Agregar a inicio").
// 2. Mostrar como notificación real del sistema los push que llegan del
//    Worker de Cloudflare, y los "festejos" que la propia app dispara vía
//    registration.showNotification() aunque no vengan de un push de red.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { title: "Kaizen", body: event.data ? event.data.text() : "" };
  }
  const titulo = datos.title || "Kaizen";
  const opciones = {
    body: datos.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { ir: datos.ir || "panel" },
    tag: datos.tag || undefined,
  };
  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const ir = (event.notification.data && event.notification.data.ir) || "panel";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
      for (const cliente of lista) {
        if ("focus" in cliente) {
          cliente.postMessage({ tipo: "kaizen:ir", ir });
          return cliente.focus();
        }
      }
      return self.clients.openWindow("/");
    })
  );
});
