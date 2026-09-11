import React from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, ProgressBar, Stat, Badge, EmptyState } from "@/components/ui/Primitives";
import { calcularAsignaciones, gastadoEnCategoria, proyeccionCierre, ritmoDiarioPermitido, semaforo } from "@/lib/formulas";
import { diaDelMes, diasDelMes, hoyISO, mesDe } from "@/lib/dates";

export function PanelFinancieroTab() {
  const state = useKaizenStore();
  const hoy = hoyISO();
  const mesActual = mesDe(hoy);
  const presupuesto = state.finanzas.presupuestos.find((p) => p.mes === mesActual);

  if (!presupuesto) return <EmptyState text="Define el presupuesto del mes para ver el panel financiero." />;

  const asignaciones = calcularAsignaciones(presupuesto);
  const totalAsignado = [...asignaciones.values()].reduce((a, b) => a + b, 0);
  const gastoCategorias = presupuesto.categorias.filter((c) => c.tipo === "gasto");
  const totalGastado = gastoCategorias.reduce((acc, c) => acc + gastadoEnCategoria(state.finanzas.gastos, c.id, mesActual), 0);
  const diasRestantes = Math.max(1, diasDelMes(mesActual) - diaDelMes(hoy) + 1);
  const ritmo = ritmoDiarioPermitido(totalAsignado, totalGastado, diasRestantes);
  const gastoPromedioDiario = totalGastado / Math.max(1, diaDelMes(hoy));
  const proyeccion = proyeccionCierre(gastoPromedioDiario, mesActual);

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle title="Panel financiero del mes" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <Stat label="Dinero útil" value={`$${presupuesto.dineroUtil.toLocaleString()}`} />
          <Stat label="Gastado" value={`$${totalGastado.toLocaleString()}`} />
          <Stat label="Ritmo diario permitido" value={`$${Math.max(0, ritmo).toFixed(0)}`} />
          <Stat
            label="Proyección de cierre"
            value={`$${proyeccion.toFixed(0)}`}
            hint={proyeccion > totalAsignado ? "por encima del asignado" : "dentro del presupuesto"}
          />
        </div>
        <ProgressBar value={presupuesto.dineroUtil > 0 ? totalGastado / presupuesto.dineroUtil : 0} colorClass="bg-sky-500" height="h-2.5" />
      </Card>

      <Card>
        <SectionTitle title="Por categoría" />
        <div className="space-y-4">
          {presupuesto.categorias.map((c) => {
            const asignado = asignaciones.get(c.id) ?? 0;
            const gastado = gastadoEnCategoria(state.finanzas.gastos, c.id, mesActual);
            const pct = asignado > 0 ? gastado / asignado : 0;
            const s = semaforo(pct);
            return (
              <div key={c.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-base-200">{c.nombre}</span>
                  <div className="flex items-center gap-2">
                    {pct >= 1 && <Badge tone="red">100%+</Badge>}
                    {pct >= 0.9 && pct < 1 && <Badge tone="yellow">90%+</Badge>}
                    {pct >= 0.7 && pct < 0.9 && <Badge tone="blue">70%+</Badge>}
                    <span className="text-base-400">
                      ${gastado.toLocaleString()} / ${asignado.toLocaleString()}
                    </span>
                  </div>
                </div>
                <ProgressBar
                  value={pct}
                  colorClass={s === "rojo" ? "bg-rose-500" : s === "amarillo" ? "bg-amber-500" : "bg-emerald-500"}
                />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
