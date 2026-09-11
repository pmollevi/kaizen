import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Stat, Button, Badge, EmptyState } from "@/components/ui/Primitives";
import { Coins, Wallet } from "lucide-react";
import { mesDe, hoyISO, formatoLargo } from "@/lib/dates";

export function RecompensasView() {
  const state = useKaizenStore();
  const canjear = useKaizenStore((s) => s.canjearRecompensa);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const esteMes = mesDe(hoyISO());

  const intentarCanje = (id: string, nombre: string) => {
    const res = canjear(id);
    setMensaje(res.ok ? `Canjeado: ${nombre}` : res.motivo ?? "No se pudo canjear");
    setTimeout(() => setMensaje(null), 3500);
  };

  return (
    <div className="space-y-5">
      <SectionTitle title={state.config.textos.tienda} subtitle="Cada recompensa cuesta créditos y MXN del Banco de Recompensas." />

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <Stat label={state.config.textos.monedas} value={<span className="inline-flex items-center gap-1.5"><Coins className="w-5 h-5 text-amber-400" />{state.usuario.creditos}</span>} />
        </Card>
        <Card>
          <Stat label="Banco de Recompensas" value={<span className="inline-flex items-center gap-1.5"><Wallet className="w-5 h-5 text-emerald-400" />${state.finanzas.bancoRecompensas.saldo.toLocaleString()}</span>} />
        </Card>
      </div>

      {mensaje && (
        <div className="text-sm px-4 py-2.5 rounded-lg bg-base-850 border border-base-700">{mensaje}</div>
      )}

      <Card>
        <SectionTitle title="Catálogo" />
        {state.config.catalogoRecompensas.filter((r) => r.activa).length === 0 ? (
          <EmptyState text="El catálogo está vacío. Revísalo en Configuración." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {state.config.catalogoRecompensas.filter((r) => r.activa).map((r) => {
              const canjesEsteMes = state.canjes.filter((c) => c.recompensaId === r.id && mesDe(c.fecha) === esteMes).length;
              const limiteAlcanzado = r.limitePorMes !== null && canjesEsteMes >= r.limitePorMes;
              return (
                <div key={r.id} className="bg-base-850 rounded-lg p-4 flex flex-col">
                  <div className="font-medium mb-1">{r.nombre}</div>
                  <Badge>{r.categoria}</Badge>
                  <div className="text-sm text-base-400 mt-2">
                    {r.costoCreditos} créditos {r.costoMXN > 0 && `· $${r.costoMXN}`}
                  </div>
                  {r.limitePorMes !== null && (
                    <div className="text-xs text-base-500 mt-1">
                      {canjesEsteMes}/{r.limitePorMes} este mes
                    </div>
                  )}
                  <Button
                    className="mt-3"
                    variant="secondary"
                    disabled={limiteAlcanzado}
                    onClick={() => intentarCanje(r.id, r.nombre)}
                  >
                    Canjear
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="Historial de canjes" />
        {state.canjes.length === 0 ? (
          <EmptyState text="Sin canjes todavía." />
        ) : (
          <ul className="divide-y divide-base-800">
            {[...state.canjes].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-base-300">{c.nombre}</span>
                <span className="text-base-500">
                  {formatoLargo(c.fecha)} · {c.costoCreditos} créditos{c.costoMXN > 0 && ` · $${c.costoMXN}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
