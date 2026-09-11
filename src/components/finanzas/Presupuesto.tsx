import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Field, Input, Select, Button, Badge, EmptyState } from "@/components/ui/Primitives";
import { calcularAsignaciones, sinAsignar } from "@/lib/formulas";
import { hoyISO, mesAnterior, mesDe, formatoMes } from "@/lib/dates";
import { generarId } from "@/lib/id";
import type { CategoriaPresupuesto, ModoAsignacion, TipoCategoria } from "@/types";
import { Plus, Trash2 } from "lucide-react";

export function PresupuestoTab() {
  const state = useKaizenStore();
  const setPresupuestoMes = useKaizenStore((s) => s.setPresupuestoMes);
  const clonarPresupuesto = useKaizenStore((s) => s.clonarPresupuesto);
  const setModoAtipico = useKaizenStore((s) => s.setModoAtipico);

  const mesActual = mesDe(hoyISO());
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
  const presupuesto = state.finanzas.presupuestos.find((p) => p.mes === mesSeleccionado);
  const presupuestoAnterior = state.finanzas.presupuestos.find((p) => p.mes === mesAnterior(mesSeleccionado));

  const [dineroUtil, setDineroUtil] = useState(presupuesto?.dineroUtil ?? 0);
  const [categorias, setCategorias] = useState<CategoriaPresupuesto[]>(presupuesto?.categorias ?? []);

  const cargarMes = (mes: string) => {
    setMesSeleccionado(mes);
    const p = state.finanzas.presupuestos.find((x) => x.mes === mes);
    setDineroUtil(p?.dineroUtil ?? 0);
    setCategorias(p?.categorias ?? []);
  };

  const agregarCategoria = () => {
    setCategorias((c) => [
      ...c,
      { id: generarId("cat"), nombre: "Nueva categoría", tipo: "gasto" as TipoCategoria, modo: "fijo" as ModoAsignacion, valor: 0 },
    ]);
  };

  const actualizarCategoria = (id: string, cambios: Partial<CategoriaPresupuesto>) => {
    setCategorias((c) => c.map((cat) => (cat.id === id ? { ...cat, ...cambios } : cat)));
  };

  const eliminarCategoria = (id: string) => setCategorias((c) => c.filter((cat) => cat.id !== id));

  const sumaFijoYPorcentaje = categorias.reduce((acc, c) => {
    if (c.modo === "fijo") return acc + c.valor;
    if (c.modo === "porcentaje") return acc + dineroUtil * (c.valor / 100);
    return acc;
  }, 0);
  const excedePresupuesto = sumaFijoYPorcentaje > dineroUtil;
  const tieneResto = categorias.some((c) => c.modo === "resto");
  const masDeUnResto = categorias.filter((c) => c.modo === "resto").length > 1;

  const borradorPresupuesto = { mes: mesSeleccionado, dineroUtil, categorias, modoAtipico: presupuesto?.modoAtipico ?? false };
  const asignaciones = calcularAsignaciones(borradorPresupuesto);
  const noAsignado = sinAsignar(borradorPresupuesto);

  const guardar = () => {
    if (excedePresupuesto || masDeUnResto) return;
    setPresupuestoMes(mesSeleccionado, dineroUtil, categorias);
  };

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          title="Presupuesto del mes"
          action={
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={mesSeleccionado}
                onChange={(e) => cargarMes(e.target.value)}
                className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
              {presupuestoAnterior && !presupuesto && (
                <Button variant="secondary" onClick={() => clonarPresupuesto(presupuestoAnterior.mes, mesSeleccionado)}>
                  Clonar {formatoMes(presupuestoAnterior.mes)}
                </Button>
              )}
            </div>
          }
        />

        <div className="grid grid-cols-2 gap-4 mb-5">
          <Field label="Dinero útil del mes (MXN)">
            <Input
              type="number"
              min={0}
              value={dineroUtil || ""}
              onChange={(e) => setDineroUtil(parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field label="Modo mes atípico" hint="Ajusta el presupuesto sin contaminar la comparativa histórica">
            <Button
              variant={presupuesto?.modoAtipico ? "primary" : "secondary"}
              onClick={() => setModoAtipico(mesSeleccionado, !presupuesto?.modoAtipico, presupuesto?.notaAtipico ?? "")}
            >
              {presupuesto?.modoAtipico ? "Activado" : "Desactivado"}
            </Button>
          </Field>
        </div>

        <div className="space-y-3">
          {categorias.map((c) => {
            const monto = asignaciones.get(c.id) ?? 0;
            return (
              <div key={c.id} className="grid grid-cols-12 gap-2 items-center bg-white/[0.04] rounded-lg px-3 py-2.5">
                <Input
                  className="col-span-3"
                  value={c.nombre}
                  onChange={(e) => actualizarCategoria(c.id, { nombre: e.target.value })}
                />
                <Select
                  className="col-span-2"
                  value={c.tipo}
                  onChange={(e) => actualizarCategoria(c.id, { tipo: e.target.value as TipoCategoria })}
                >
                  <option value="gasto">Gasto</option>
                  <option value="ahorro">Ahorro</option>
                  <option value="recompensas">Dinero libre</option>
                </Select>
                <Select
                  className="col-span-2"
                  value={c.modo}
                  onChange={(e) => actualizarCategoria(c.id, { modo: e.target.value as ModoAsignacion })}
                >
                  <option value="fijo">Fijo</option>
                  <option value="porcentaje">%</option>
                  <option value="resto">Resto</option>
                </Select>
                {c.modo !== "resto" ? (
                  <Input
                    className="col-span-2"
                    type="number"
                    value={c.valor || ""}
                    onChange={(e) => actualizarCategoria(c.id, { valor: parseFloat(e.target.value) || 0 })}
                    placeholder={c.modo === "porcentaje" ? "%" : "$"}
                  />
                ) : (
                  <div className="col-span-2 text-sm text-base-400">auto</div>
                )}
                <div className="col-span-2 text-sm text-right font-medium">${monto.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <button onClick={() => eliminarCategoria(c.id)} className="col-span-1 text-base-500 hover:text-rose-400 justify-self-end">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          {categorias.length === 0 && <EmptyState text="Aún no hay categorías. Agrega la primera." />}
        </div>

        <div className="mt-3">
          <Button variant="ghost" onClick={agregarCategoria} className="inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Agregar categoría
          </Button>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="space-y-1">
            {excedePresupuesto && <Badge tone="red">La suma de fijo + porcentaje supera el dinero útil</Badge>}
            {masDeUnResto && <Badge tone="red">Solo una categoría puede ser "resto"</Badge>}
            {!tieneResto && noAsignado > 0 && <Badge tone="yellow">Sin asignar: ${noAsignado.toLocaleString()}</Badge>}
          </div>
          <Button onClick={guardar} disabled={excedePresupuesto || masDeUnResto}>
            Guardar presupuesto
          </Button>
        </div>
      </Card>
    </div>
  );
}
