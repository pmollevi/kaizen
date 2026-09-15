import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Stat, ProgressBar, EmptyState, Field, Input, Button } from "@/components/ui/Primitives";
import { GraficaCategoriasPastel } from "@/components/finanzas/charts/FinanzasCharts";
import { distribucionCategorias } from "@/lib/formulas";
import { diasDelMes, formatoMes, hoyISO, mesDe } from "@/lib/dates";
import { Plus, Trash2 } from "lucide-react";
import { OriIcon } from "@/components/ui/OriIcon";
import { estadoOriFinanzasResumen } from "@/lib/ori";

function IngresoMensualInline() {
  const state = useKaizenStore();
  const setIngresoMensual = useKaizenStore((s) => s.setIngresoMensual);
  const mesActual = mesDe(hoyISO());
  const actual = state.finanzas.ingresosMensuales.find((i) => i.mes === mesActual)?.monto ?? 0;
  const [editando, setEditando] = useState(false);
  const [monto, setMonto] = useState(actual);

  const guardar = () => {
    setIngresoMensual(mesActual, monto);
    setEditando(false);
  };

  if (editando) {
    return (
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Field label="Ingreso de este mes">
            <Input
              type="number"
              min={0}
              autoFocus
              value={monto || ""}
              onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </Field>
        </div>
        <Button variant="secondary" onClick={guardar}>
          Guardar
        </Button>
      </div>
    );
  }

  return (
    <button onClick={() => setEditando(true)} className="text-left w-full group">
      <Stat label="Ingreso mensual" value={actual > 0 ? `$${actual.toLocaleString()}` : "—"} hint="Toca para editar" />
    </button>
  );
}

function CategoriasSection() {
  const state = useKaizenStore();
  const agregarCategoriaGasto = useKaizenStore((s) => s.agregarCategoriaGasto);
  const eliminarCategoriaGasto = useKaizenStore((s) => s.eliminarCategoriaGasto);
  const [nombre, setNombre] = useState("");

  const agregar = () => {
    if (!nombre.trim()) return;
    agregarCategoriaGasto(nombre);
    setNombre("");
  };

  return (
    <Card>
      <SectionTitle title="Categorías de gasto" />
      <div className="flex flex-wrap gap-2 mb-4">
        {state.finanzas.categorias.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-base-850 border border-base-700 text-sm text-base-200">
            {c.nombre}
            <button onClick={() => eliminarCategoriaGasto(c.id)} className="text-base-500 hover:text-rose-400 p-0.5">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
        {state.finanzas.categorias.length === 0 && <EmptyState text="Aún no hay categorías." />}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Nueva categoría"
          className="max-w-xs"
        />
        <Button variant="secondary" onClick={agregar} className="inline-flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Agregar
        </Button>
      </div>
    </Card>
  );
}

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
  const ingreso = finanzas.ingresosMensuales.find((i) => i.mes === mesActual)?.monto ?? 0;
  const pctIngreso = ingreso > 0 ? totalMes / ingreso : null;

  return (
    <div className="space-y-5">
      <Card className="border-finanzas-500/35 bg-finanzas-500/[0.08]">
        <div className="text-xs uppercase tracking-wider text-finanzas-400 font-medium mb-1">Total gastado</div>
        <div className="text-4xl font-semibold tracking-tight text-base-100">${totalMes.toLocaleString()}</div>
        <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-base-700">
          <Stat label="Efectivo" value={`$${totalEfectivo.toLocaleString()}`} />
          <Stat label="Tarjeta" value={`$${totalTarjeta.toLocaleString()}`} />
        </div>
        <div className="mt-5 pt-5 border-t border-base-700">
          <IngresoMensualInline />
        </div>
        {pctIngreso !== null && (
          <div className="mt-5 pt-5 border-t border-base-700 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-base-400">Llevas gastado del ingreso del mes</span>
                <span className={`text-2xl font-bold tabular-nums ${pctIngreso > 1 ? "text-rose-400" : "text-base-100"}`}>
                  {Math.round(pctIngreso * 100)}%
                </span>
              </div>
              <ProgressBar value={pctIngreso} colorClass={pctIngreso > 1 ? "bg-rose-500" : "bg-finanzas-500"} height="h-1.5" />
            </div>
            <OriIcon mode="finanzas" state={estadoOriFinanzasResumen(state) ?? "reposo"} />
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="Por categoría" subtitle={formatoMes(mesActual)} />
        {categorias.length === 0 ? (
          <EmptyState text="Registra tu primer gasto y aquí verás en qué se te va el dinero — usa el botón + de abajo." />
        ) : (
          <GraficaCategoriasPastel datos={categorias} />
        )}
      </Card>

      <CategoriasSection />
    </div>
  );
}
