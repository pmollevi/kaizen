import React, { useState } from "react";
import { Sparkles, Target, Wallet, Gift } from "lucide-react";
import { Card, Button } from "@/components/ui/Primitives";

function Logo() {
  return (
    <div className="w-11 h-11 rounded-2xl bg-sky-500 flex items-center justify-center mb-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_24px_-8px_rgba(59,130,246,0.6)]">
      <Sparkles className="w-5 h-5 text-white" />
    </div>
  );
}

const PASOS = [
  {
    icono: Target,
    titulo: "Elige tus hábitos y ponles una meta",
    texto: "Escoges del catálogo los que quieres trabajar este mes y decides cuánto es suficiente para cada uno.",
  },
  {
    icono: Wallet,
    titulo: "Arma el presupuesto del mes",
    texto: "Le dices a Kaizen cuánto dinero tienes, tus gastos fijos y cuánto quieres ahorrar.",
  },
  {
    icono: Gift,
    titulo: "Cumple y desbloquea",
    texto: "Cada semana que cumples tus hábitos y tu presupuesto, desbloqueas dinero para lujos real y protecciones para las semanas difíciles.",
  },
];

export function BienvenidaFlow({ onFinalizar }: { onFinalizar: () => void }) {
  const [pantalla, setPantalla] = useState<1 | 2>(1);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm relative animate-fade-up">
        {pantalla === 1 ? (
          <>
            <Logo />
            <div className="text-lg font-semibold tracking-tight">Bienvenido a Kaizen</div>
            <p className="text-sm text-base-400 mt-2 leading-relaxed">
              Kaizen une tus hábitos diarios y tu presupuesto en un solo juego: cuando cumples, desbloqueas dinero
              real para lujos y protecciones para las semanas difíciles. Nada de puntos simbólicos — tu progreso
              mueve tu economía real.
            </p>
            <Button className="w-full mt-6" onClick={() => setPantalla(2)}>
              Continuar
            </Button>
          </>
        ) : (
          <>
            <div className="text-lg font-semibold tracking-tight mb-1">Así funciona</div>
            <p className="text-sm text-base-400 mb-5">Tres pasos, en este orden.</p>
            <div className="space-y-4">
              {PASOS.map((p, i) => {
                const Icono = p.icono;
                return (
                  <div key={p.titulo} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                      <Icono className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-base-100">
                        {i + 1}. {p.titulo}
                      </div>
                      <div className="text-xs text-base-400 mt-0.5 leading-relaxed">{p.texto}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button className="w-full mt-6" onClick={onFinalizar}>
              Configurar mi primer mes
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
