import React from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Stat, ProgressBar, EmptyState } from "@/components/ui/Primitives";
import { distribucionCategorias } from "@/lib/formulas";
import { diasDelMes, formatoLargo, hoyISO, mesDe } from "@/lib/dates";

export function PanelFinancieroTab() {
  const state = useKaizenStore();
  const { finanzas } = state;
  const hoy = hoyISO();
  const mesActual = mesDe(hoy);
  const desde = `${mesActual}-01`;
  const hasta = `${mesActual}-${String(diasDelMes(mesActual)).padStart(2, "0")}`;

  const gastosDelMes = finanzas.gastos.filter((g) => g.fecha >= desde && g.fecha <= hasta);
  const totalMes = gastosDelMes.reduce((acc, g) => acc + g.monto, 0);
  const totalEfectivo = gastosDelMes.filter((g) => g.metodo === "efectivo").reduce((acc, g) => acc + g.monto, 0);
  const totalTarjeta = gastosDelMes.filter((g) => g.metodo === "tarjeta").reduce((acc, g) => acc + g.monto, 0);
  const categorias = distribucionCategorias(finanzas.gastos, finanzas.categorias, desde, hasta);
  const gastosRecientes = [...finanzas.gastos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, 8);
  const ingreso = finanzas.ingresosMensuales.find((i) => i.mes === mesActual)?.monto ?? 0;
  const pctIngreso = ingreso > 0 ? totalMes / ingreso : null;

  if (gastosDelMes.length === 0) {
    return (
      <Card>
        <SectionTitle title="Este mes" />
        <EmptyState text="Registra tu primer gasto y aquí verás en qué se te va el dinero — usa el botón + de abajo." />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="border-finanzas-500/35 bg-finanzas-500/[0.08]">
        <div className="text-xs uppercase tracking-wider text-finanzas-400 font-medium mb-1">Total gastado</div>
        <div className="text-4xl font-semibold tracking-tight text-base-100">${totalMes.toLocaleString()}</div>
        <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-base-700">
          <Stat label="Efectivo" value={`$${totalEfectivo.toLocaleString()}`} />
          <Stat label="Tarjeta" value={`$${totalTarjeta.toLocaleString()}`} />
        </div>
        {pctIngreso !== null && (
          <div className="mt-5 pt-5 border-t border-base-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-base-400">Llevas gastado del ingreso del mes</span>
              <span className={`text-2xl font-bold tabular-nums ${pctIngreso > 1 ? "text-rose-400" : "text-base-100"}`}>
                {Math.round(pctIngreso * 100)}%
              </span>
            </div>
            <ProgressBar value={pctIngreso} colorClass={pctIngreso > 1 ? "bg-rose-500" : "bg-finanzas-500"} height="h-1.5" />
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="Gastos recientes" />
        <ul className="divide-y divide-base-700">
          {gastosRecientes.map((g) => (
            <li key={g.id} className="flex items-center justify-between py-2.5 text-sm">
              <div className="min-w-0">
                <div className="font-medium text-base-200 truncate">{g.palabraClave}</div>
                <div className="text-xs text-base-500">{formatoLargo(g.fecha)}</div>
              </div>
              <span className="font-medium text-base-100 shrink-0">${g.monto.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle title="Por categoría" subtitle={mesActual} />
        {categorias.length === 0 ? (
          <EmptyState text="Sin categorías con gasto este mes." />
        ) : (
          <div className="space-y-3">
            {categorias.map((c) => (
              <div key={c.categoriaId}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-base-200">{c.nombre}</span>
                  <span className="text-base-400">
                    ${c.monto.toLocaleString()} · {Math.round(c.porcentaje * 100)}%
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-base-800 overflow-hidden">
                  <div className="h-full bg-finanzas-500 rounded-full" style={{ width: `${c.porcentaje * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
