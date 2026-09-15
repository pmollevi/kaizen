import React from "react";
import { OriIcon } from "@/components/ui/OriIcon";
import { X } from "lucide-react";

const MENSAJE =
  "¡Hola! Soy Ori 👋 Voy a acompañarte a mejorar tu día a día — cada racha, cada hábito, cada pequeño paso. Vivo junto a tu progreso, así que vamos a lograrlo juntos.";

/**
 * Presentación de Ori la primera vez que entra un perfil nuevo. Se muestra
 * una sola vez (ver lib/oriBienvenida.ts) y se cierra tocando fuera o la X —
 * a diferencia de la celebración del registro diario, aquí no hay
 * auto-cierre: es la primera impresión, no debe sentirse apurada.
 */
export function OriBienvenida({ onCerrar }: { onCerrar: () => void }) {
  return (
    // z-[60]: por arriba del asistente de planeación mensual (z-50), que para
    // un perfil nuevo puede estar abierto al mismo tiempo — Ori debe ganar.
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 animate-pop" onClick={onCerrar}>
      <div className="relative flex flex-col items-center gap-3 max-w-[min(90vw,360px)]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-base-900 border border-base-700 text-base-400 hover:text-base-100 flex items-center justify-center shadow-soft z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <OriIcon mode="habito" state="reposo" size="md" />
        <div className="bg-base-900 text-base-100 px-5 py-3.5 rounded-2xl shadow-soft border border-habitos-500/40 text-center">
          <p className="text-sm leading-relaxed">{MENSAJE}</p>
        </div>
      </div>
    </div>
  );
}
