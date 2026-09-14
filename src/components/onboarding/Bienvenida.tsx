import React, { useState } from "react";
import { Card, Button } from "@/components/ui/Primitives";
import { OrigoMark } from "@/components/ui/OrigoMark";

function Logo() {
  return (
    <div className="w-11 h-11 rounded-2xl bg-base-850 border border-base-700 flex items-center justify-center mb-3">
      <OrigoMark size={22} />
    </div>
  );
}

export function BienvenidaFlow({ onFinalizar }: { onFinalizar: () => void }) {
  const [pantalla, setPantalla] = useState<1 | 2>(1);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm relative animate-fade-up">
        {pantalla === 1 ? (
          <>
            <Logo />
            <div className="text-lg font-semibold tracking-tight">Bienvenido a Origo</div>
            <p className="text-sm text-base-400 mt-2 leading-relaxed">
              Origo — start where you are. No hace falta partir de cero perfecto: cada pequeño avance de hoy es de
              dónde arrancas mañana. Aquí ese progreso se ve, en rachas, niveles y logros.
            </p>
            <Button className="w-full mt-6" onClick={() => setPantalla(2)}>
              Continuar
            </Button>
          </>
        ) : (
          <>
            <div className="text-lg font-semibold tracking-tight mb-4">¿Hasta dónde puedes llegar?</div>
            <div className="space-y-3 text-sm text-base-300 leading-relaxed">
              <p>Elige los hábitos que quieras mejorar. Cúmplelos hoy, mañana, y al día siguiente.</p>
              <p className="text-base font-medium text-base-100">
                Cada racha que mantienes es la prueba de lo que eres capaz de hacer.
              </p>
            </div>
            <Button className="w-full mt-6" onClick={onFinalizar}>
              Empezar mi racha
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
