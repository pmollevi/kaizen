import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Stat, Button, Badge, EmptyState, ProgressBar } from "@/components/ui/Primitives";
import { Flame, ShieldCheck } from "lucide-react";
import { formatoLargo } from "@/lib/dates";
import { rachaDiariaVigente } from "@/lib/achievements";
import { COLOR_SECCION } from "@/lib/color";

export function RecompensasView() {
  const state = useKaizenStore();
  const canjear = useKaizenStore((s) => s.canjearRachaPorProteccion);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const racha = rachaDiariaVigente(state);
  const disponible = Math.max(0, racha - state.usuario.diasRachaCanjeados);
  const { diasPorProteccion, proteccionesMaxAcumulables } = state.config.economia;
  const puedeCanjear =
    disponible >= diasPorProteccion && state.usuario.protecciones < proteccionesMaxAcumulables;

  const intentarCanje = () => {
    const res = canjear();
    setMensaje(res.ok ? "Canjeado: +1 protección" : res.motivo ?? "No se pudo canjear");
    setTimeout(() => setMensaje(null), 3500);
  };

  const cierresRecientes = [...state.cierresSemanales]
    .sort((a, b) => (a.semanaInicio < b.semanaInicio ? 1 : -1))
    .slice(0, 8);

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Racha y protecciones"
        subtitle="Tu racha diaria se cambia por protecciones que cubren una semana mala sin romper tu historial."
        accent={COLOR_SECCION.recompensas}
      />

      <Card>
        <Stat
          label="Racha diaria actual"
          value={
            <span className="inline-flex items-center gap-1.5">
              <Flame className={`w-5 h-5 text-amber-400 ${racha > 0 ? "animate-flicker" : ""}`} />
              {racha} {racha === 1 ? "día" : "días"}
            </span>
          }
          hint="días seguidos cumpliendo todos tus hábitos"
        />
      </Card>

      {mensaje && <div className="text-sm px-4 py-2.5 rounded-lg bg-base-850 border border-base-700">{mensaje}</div>}

      <Card>
        <SectionTitle
          title={state.config.textos.escudos}
          subtitle={`Cada ${diasPorProteccion} días de racha se cambian por 1 protección. Cubren una semana mala sin romper tu historial.`}
        />
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-base-300">
            {state.usuario.protecciones} / {proteccionesMaxAcumulables} protecciones
          </span>
          <span className="text-sm text-base-500">
            {disponible} / {diasPorProteccion} días hacia la próxima
          </span>
        </div>
        <ProgressBar value={disponible / diasPorProteccion} color="#C5A85B" height="h-1.5" />
        <Button className="mt-4" disabled={!puedeCanjear} onClick={intentarCanje}>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Canjear racha por protección
          </span>
        </Button>
      </Card>

      <Card>
        <SectionTitle title="Cierres recientes" />
        {cierresRecientes.length === 0 ? (
          <EmptyState text="Todavía no hay semanas cerradas." />
        ) : (
          <ul className="divide-y divide-base-700">
            {cierresRecientes.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-base-300">
                  {formatoLargo(c.semanaInicio)} – {formatoLargo(c.semanaFin)}
                </span>
                {c.protegida ? (
                  <Badge tone="blue">semana protegida</Badge>
                ) : (
                  <span className="text-base-400">
                    +{c.ppGanados} PP · {Math.round(c.cumplimientoGlobal * 100)}% cumplido
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
