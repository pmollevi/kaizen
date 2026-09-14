import React from "react";

// Isotipo de Origo: el anillo con corte, pensado para funcionar solo
// (favicon, logros, pantallas de carga) o junto al wordmark en el header.
// Es un raster (no hay fuente vectorial del logo), su fondo casi negro ya
// coincide con el fondo del sistema (#0D0E0E) así que se integra sin recorte.
export function OrigoMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <img src="/icons/icon-192.png" width={size} height={size} className={className} alt="" aria-hidden="true" />
  );
}
