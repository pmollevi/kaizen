import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Primitives";

interface PasoCoach {
  targetId: string;
  texto: string;
}

const PASOS: PasoCoach[] = [
  { targetId: "coach-registrar-dia", texto: "Aquí registras tu día. Es el corazón de Kaizen — todo lo demás se construye desde acá." },
  { targetId: "coach-racha", texto: "Tu racha diaria: días seguidos cumpliendo todos tus hábitos activos. Se protege, nunca se rompe de golpe." },
  { targetId: "coach-nav-registro", texto: "Hábitos: el detalle y el progreso de cada uno que elegiste." },
  { targetId: "coach-nav-finanzas", texto: "Finanzas: control de gastos, completamente separado de tus hábitos." },
  { targetId: "coach-nav-recompensas", texto: "Recompensas: tu racha, tus protecciones y los logros que vas desbloqueando." },
  { targetId: "coach-fab-gasto", texto: "Registra un gasto en segundos desde cualquier pantalla con este botón." },
];

/** Primer elemento con ese data-coach que esté realmente visible (evita apuntar al nav oculto por el breakpoint). */
function elementoVisible(targetId: string): HTMLElement | null {
  const candidatos = document.querySelectorAll<HTMLElement>(`[data-coach="${targetId}"]`);
  for (const el of candidatos) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

function useRectDeCoach(targetId: string): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    const medir = () => {
      const el = elementoVisible(targetId);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    medir();
    window.addEventListener("resize", medir);
    const id = setInterval(medir, 250);
    return () => {
      window.removeEventListener("resize", medir);
      clearInterval(id);
    };
  }, [targetId]);
  return rect;
}

const ANCHO_BURBUJA = 260;
const MARGEN = 10;

export function Coachmarks({ onTerminar }: { onTerminar: () => void }) {
  const [paso, setPaso] = useState(0);
  const step = PASOS[paso];
  const rect = useRectDeCoach(step.targetId);

  // Si el objetivo de este paso no está en pantalla, no se traba: avanza solo.
  useEffect(() => {
    if (rect) return;
    const t = setTimeout(() => {
      if (paso + 1 < PASOS.length) setPaso((p) => p + 1);
      else onTerminar();
    }, 400);
    return () => clearTimeout(t);
  }, [rect, paso, onTerminar]);

  if (!rect) return null;

  const espacioAbajo = window.innerHeight - rect.bottom;
  const arriba = espacioAbajo < 160 && rect.top > 160;
  const top = arriba ? rect.top - MARGEN : rect.bottom + MARGEN;
  const left = Math.min(Math.max(rect.left, MARGEN), window.innerWidth - ANCHO_BURBUJA - MARGEN);

  const siguiente = () => (paso + 1 < PASOS.length ? setPaso((p) => p + 1) : onTerminar());

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="fixed rounded-xl border-2 border-kaizen-400 transition-all duration-300 pointer-events-none"
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
        }}
      />
      <div
        key={paso}
        className="fixed w-[260px] max-w-[calc(100vw-20px)] rounded-xl border border-base-700 bg-base-900 p-4 shadow-soft animate-pop"
        style={{ top: arriba ? undefined : top, bottom: arriba ? window.innerHeight - top : undefined, left }}
      >
        <div className="text-[11px] uppercase tracking-wider text-base-500 font-medium mb-1.5">
          {paso + 1} de {PASOS.length}
        </div>
        <p className="text-sm text-base-200 leading-relaxed">{step.texto}</p>
        <div className="flex items-center justify-between mt-3">
          <button onClick={onTerminar} className="text-xs text-base-500 hover:text-base-300">
            Saltar
          </button>
          <Button onClick={siguiente} className="!px-3 !py-1.5 text-xs">
            {paso + 1 < PASOS.length ? "Siguiente" : "Entendido"}
          </Button>
        </div>
      </div>
    </div>
  );
}
