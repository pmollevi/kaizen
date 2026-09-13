import React, { useId } from "react";

// Isotipo de Kaizen: una "K" geométrica en dos trazos, pensada para funcionar
// sola (favicon, logros, pantallas de carga) o junto al wordmark en el header.
export function KaizenMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  const gradId = useId();
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B7BC9C" />
          <stop offset="100%" stopColor="#636B47" />
        </linearGradient>
      </defs>
      <path
        d="M9 6.5C9 5.67 9.67 5 10.5 5s1.5.67 1.5 1.5v8.2l7.9-8.98c.32-.36.78-.57 1.26-.57h2.6c.7 0 1.06.84.58 1.35L16.9 15.2l7.9 9.24c.48.51.12 1.35-.58 1.35h-2.65c-.48 0-.94-.21-1.26-.57L12 16.9v7.6c0 .83-.67 1.5-1.5 1.5S9 25.33 9 24.5v-18Z"
        fill={`url(#${gradId})`}
      />
    </svg>
  );
}
