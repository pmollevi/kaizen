import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/index.css";

// Habilita instalabilidad real (PWA) y deja el service worker listo para
// mostrar push del servidor y notificaciones locales de celebración. No
// registra nada de permisos ni de push por sí solo — eso lo activa el
// usuario desde Configuración.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Ruta relativa a propósito: la app puede vivir en la raíz del dominio o
    // en una subruta (ej. GitHub Pages, /kaizen/) y "/sw.js" solo funciona en la raíz.
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // instalación/push no disponibles en este navegador: el resto de la app sigue funcionando igual
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
