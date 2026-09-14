import React from "react";

/** Se muestra una sola vez al abrir la app, antes de login/panel — sin clic, desaparece sola (ver App.tsx). */
export function SplashScreen({ saliendo }: { saliendo: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-base-950 transition-opacity duration-300 ${
        saliendo ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src="/splash-logo.png"
        alt="Origo — start where you are"
        className="w-72 sm:w-80 animate-pop"
      />
    </div>
  );
}
