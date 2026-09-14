import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, EmptyState, Stat } from "@/components/ui/Primitives";
import { formatoLargo } from "@/lib/dates";
import { GraficaCategorias } from "@/components/finanzas/charts/FinanzasCharts";

export function ResumenesTarjeta() {
  const state = useKaizenStore();
  const { tarjetas, resumenesTarjeta } = state.finanzas;
  const [abierto, setAbierto] = useState<string | null>(null);

  if (tarjetas.length === 0) return null;

  const resumenesOrdenados = [...resumenesTarjeta].sort((a, b) => (a.periodoFin < b.periodoFin ? 1 : -1));

  return (
    <Card>
      <SectionTitle title="Resúmenes de corte" subtitle="Se generan solos el día de corte de cada tarjeta." />
      {resumenesOrdenados.length === 0 ? (
        <EmptyState text="Aún no hay ningún corte cerrado." />
      ) : (
        <div className="space-y-3">
          {resumenesOrdenados.map((r) => {
            const tarjeta = tarjetas.find((t) => t.id === r.tarjetaId);
            const abiertoAhora = abierto === r.id;
            return (
              <div key={r.id} className="rounded-xl bg-base-850 border border-base-700 overflow-hidden">
                <button
                  onClick={() => setAbierto(abiertoAhora ? null : r.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div>
                    <div className="text-sm font-medium text-base-200">{tarjeta?.nombre ?? "Tarjeta"}</div>
                    <div className="text-xs text-base-500">
                      {formatoLargo(r.periodoInicio)} – {formatoLargo(r.periodoFin)}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-base-100">${r.totalGastado.toLocaleString()}</div>
                </button>
                {abiertoAhora && (
                  <div className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Stat label="Gastos" value={String(r.numeroGastos)} />
                      <Stat label="Total del corte" value={`$${r.totalGastado.toLocaleString()}`} />
                    </div>
                    {r.categorias.length > 0 && (
                      <div className="pt-3 border-t border-base-700">
                        <div className="text-xs uppercase tracking-wide text-base-400 mb-2">Por categoría</div>
                        <GraficaCategorias datos={r.categorias} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
