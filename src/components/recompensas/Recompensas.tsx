import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Stat, Button, Badge, EmptyState, ProgressBar } from "@/components/ui/Primitives";
import { Flame, ShieldCheck, Wallet } from "lucide-react";
import { formatoLargo } from "@/lib/dates";
import { rachaDiariaVigente } from "@/lib/achievements";

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

  const cierresConDinero = [...state.cierresSemanales]
    .filter((c) => c.dineroLiberado > 0 || c.protegida)
    .sort((a, b) => (a.semanaInicio < b.semanaInicio ? 1 : -1))
    .slice(0, 8);

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Dinero libre y racha"
        subtitle="Tu dinero libre se libera semana a semana según tu cumplimiento. Tu racha diaria se cambia por protecciones."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card>
          <Stat
            label="Dinero libre disponible"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="w-5 h-5 text-emerald-400" />${state.finanzas.bancoRecompensas.saldo.toLocaleString()}
              </span>
            }
            hint={`tope $${state.finanzas.bancoRecompensas.tope.toLocaleString()}`}
          />
        </Card>
        <Card>
          <Stat
            label="Racha diaria actual"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-amber-400" />
                {racha} {racha === 1 ? "día" : "días"}
              </span>
            }
            hint="días seguidos cumpliendo todos tus hábitos"
          />
        </Card>
      </div>

      {mensaje && <div className="text-sm px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/10">{mensaje}</div>}

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
        <ProgressBar value={disponible / diasPorProteccion} color="#e0a63a" height="h-2" />
        <Button className="mt-4" disabled={!puedeCanjear} onClick={intentarCanje}>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Canjear racha por protección
          </span>
        </Button>
      </Card>

      <Card>
        <SectionTitle title="Desbloqueos recientes" />
        {cierresConDinero.length === 0 ? (
          <EmptyState text="Todavía no hay semanas cerradas con dinero libre." />
        ) : (
          <ul className="divide-y divide-white/10">
            {cierresConDinero.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-base-300">
                  {formatoLargo(c.semanaInicio)} – {formatoLargo(c.semanaFin)}
                </span>
                {c.protegida ? (
                  <Badge tone="blue">semana protegida</Badge>
                ) : (
                  <span className="text-base-400">
                    +${c.dineroLiberado.toLocaleString()} · {Math.round(c.cumplimientoGlobal * 100)}% cumplido
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
