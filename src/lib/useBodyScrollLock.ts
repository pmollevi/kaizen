import { useEffect } from "react";

let bloqueosActivos = 0;
let scrollYPrevio = 0;

/**
 * Bloquea el scroll del body mientras `activo` sea true (contador global para
 * soportar overlays anidados). Fija el body en su posicion actual en vez de solo
 * poner overflow:hidden, que en iOS Safari no basta para evitar que el fondo se
 * arrastre detras de un modal.
 */
export function useBodyScrollLock(activo: boolean) {
  useEffect(() => {
    if (!activo) return;
    if (bloqueosActivos === 0) {
      scrollYPrevio = window.scrollY;
      const body = document.body;
      body.style.position = "fixed";
      body.style.top = `-${scrollYPrevio}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
    }
    bloqueosActivos++;

    return () => {
      bloqueosActivos--;
      if (bloqueosActivos === 0) {
        const body = document.body;
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.width = "";
        window.scrollTo(0, scrollYPrevio);
      }
    };
  }, [activo]);
}
