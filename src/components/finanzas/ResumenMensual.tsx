import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Stat, EmptyState } from "@/components/ui/Primitives";
import { formatoMes, mesDe } from "@/lib/dates";
import { GraficaCategorias, GraficaMetodoPago, GraficaProgresoHabitos } from "@/components/finanzas/charts/FinanzasCharts";

function etiquetaSemana(fecha: string): string {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export function ResumenMensualTab() {
  const state = useKaizenStore();
  const resumenes = [...state.finanzas.resumenesMensuales].sort((a, b) => (a.mes < b.mes ? 1 : -1));
  const [abierto, setAbierto] = useState<string | null>(resumenes[0]?.mes ?? null);

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle title="Resumen mensual" subtitle="Se genera automáticamente al cerrar cada mes. Nada se borra." />
        {resumenes.length === 0 ? (
          <EmptyState text="Aún no hay meses cerrados." />
        ) : (
          <div className="space-y-3">
            {resumenes.map((r) => {
              const semanasDelMes = [...state.cierresSemanales]
                .filter((c) => mesDe(c.semanaFin) === r.mes)
                .sort((a, b) => (a.semanaInicio < b.semanaInicio ? -1 : 1))
                .map((c) => ({ etiqueta: etiquetaSemana(c.semanaInicio), cumplimiento: c.cumplimientoGlobal }));
              const comparativa = [...r.comparativaMesesAnteriores, { mes: r.mes, totalGastado: r.totalGastado }];

              return (
                <div key={r.mes} className="rounded-xl bg-base-850 border border-base-700 overflow-hidden">
                  <button
                    onClick={() => setAbierto(abierto === r.mes ? null : r.mes)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="font-medium capitalize">{formatoMes(r.mes)}</span>
                    <span className="text-lg font-semibold text-base-100">${r.totalGastado.toLocaleString()}</span>
                  </button>
                  {abierto === r.mes && (
                    <div className="px-4 pb-5 space-y-6">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-base-500 font-medium mb-1">Total gastado</div>
                        <div className="text-3xl font-semibold tracking-tight text-base-100">${r.totalGastado.toLocaleString()}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-base-700">
                        <Stat label="Promedio diario" value={`$${r.gastoPromedioDiario.toFixed(0)}`} />
                        <Stat label="Día más caro" value={r.diaMasCaro ? `$${r.diaMasCaro.monto.toLocaleString()}` : "—"} hint={r.diaMasCaro?.fecha} />
                      </div>

                      {semanasDelMes.length > 0 && (
                        <div className="pt-4 border-t border-base-700">
                          <div className="text-xs uppercase tracking-wide text-base-400 mb-2">Progreso de hábitos en el mes</div>
                          <GraficaProgresoHabitos semanas={semanasDelMes} />
                        </div>
                      )}

                      {(r.totalEfectivo > 0 || r.totalTarjeta > 0) && (
                        <div className="pt-4 border-t border-base-700">
                          <div className="text-xs uppercase tracking-wide text-base-400 mb-2">Efectivo vs. tarjeta</div>
                          <GraficaMetodoPago efectivo={r.totalEfectivo} tarjeta={r.totalTarjeta} />
                        </div>
                      )}

                      {r.categorias.length > 0 && (
                        <div className="pt-4 border-t border-base-700">
                          <div className="text-xs uppercase tracking-wide text-base-400 mb-2">¿En qué se fue?</div>
                          <GraficaCategorias datos={r.categorias} />
                        </div>
                      )}

                      {comparativa.length > 1 && (
                        <div className="pt-4 border-t border-base-700">
                          <div className="text-xs uppercase tracking-wide text-base-400 mb-2">Comparativa con meses anteriores</div>
                          <GraficaCategorias
                            datos={comparativa.map((m) => ({ nombre: formatoMes(m.mes), monto: m.totalGastado }))}
                          />
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
    </div>
  );
}
