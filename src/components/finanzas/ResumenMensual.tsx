import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Stat, Button, EmptyState } from "@/components/ui/Primitives";
import { formatoMes } from "@/lib/dates";
import { Download } from "lucide-react";

function exportarCSV(gastos: { fecha: string; monto: number; categoriaId: string; palabraClave: string; metodo: string; nota?: string }[]) {
  const encabezado = "fecha,monto,categoria,palabraClave,metodo,nota";
  const filas = gastos.map((g) =>
    [g.fecha, g.monto, g.categoriaId, g.palabraClave, g.metodo, (g.nota ?? "").replace(/,/g, ";")].join(",")
  );
  const csv = [encabezado, ...filas].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kaizen-finanzas.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function ResumenMensualTab() {
  const state = useKaizenStore();
  const resumenes = [...state.finanzas.resumenesMensuales].sort((a, b) => (a.mes < b.mes ? 1 : -1));
  const [abierto, setAbierto] = useState<string | null>(resumenes[0]?.mes ?? null);

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          title="Resumen mensual"
          subtitle="Se genera automáticamente al cerrar cada mes. Nada se borra."
          action={
            <Button variant="secondary" onClick={() => exportarCSV(state.finanzas.gastos)} className="inline-flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Exportar CSV
            </Button>
          }
        />
        {resumenes.length === 0 ? (
          <EmptyState text="Aún no hay meses cerrados." />
        ) : (
          <div className="space-y-3">
            {resumenes.map((r) => (
              <div key={r.mes} className="rounded-xl bg-base-850 border border-base-700 overflow-hidden">
                <button
                  onClick={() => setAbierto(abierto === r.mes ? null : r.mes)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <span className="font-medium capitalize">{formatoMes(r.mes)}</span>
                  <span className="text-lg font-semibold text-base-100">${r.totalGastado.toLocaleString()}</span>
                </button>
                {abierto === r.mes && (
                  <div className="px-4 pb-5 space-y-5">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-base-500 font-medium mb-1">Total gastado</div>
                      <div className="text-3xl font-semibold tracking-tight text-base-100">${r.totalGastado.toLocaleString()}</div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-base-700">
                      <Stat label="Efectivo" value={`$${r.totalEfectivo.toLocaleString()}`} />
                      <Stat label="Tarjeta" value={`$${r.totalTarjeta.toLocaleString()}`} />
                      <Stat label="Promedio diario" value={`$${r.gastoPromedioDiario.toFixed(0)}`} />
                      <Stat label="Día más caro" value={r.diaMasCaro ? `$${r.diaMasCaro.monto.toLocaleString()}` : "—"} hint={r.diaMasCaro?.fecha} />
                    </div>

                    {r.categorias.length > 0 && (
                      <div>
                        <div className="text-xs uppercase tracking-wide text-base-400 mb-2">¿En qué?</div>
                        <div className="space-y-1.5">
                          {r.categorias.map((c) => (
                            <div key={c.categoriaId} className="flex items-center justify-between text-sm">
                              <span className="text-base-300">{c.nombre}</span>
                              <span className="text-base-400">
                                ${c.monto.toLocaleString()} · {Math.round(c.porcentaje * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {r.comparativaMesesAnteriores.length > 0 && (
                      <div>
                        <div className="text-xs uppercase tracking-wide text-base-400 mb-2">Comparativa</div>
                        <div className="text-sm text-base-400">
                          Promedio histórico: ${r.promedioHistorico.toFixed(0)} ·{" "}
                          {r.comparativaMesesAnteriores.map((m) => `${formatoMes(m.mes)}: $${m.totalGastado.toFixed(0)}`).join(" · ")}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
