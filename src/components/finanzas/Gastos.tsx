import React, { useMemo, useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Field, Input, Select, Button, EmptyState } from "@/components/ui/Primitives";
import { hoyISO, mesDe, formatoLargo } from "@/lib/dates";
import type { Gasto, MetodoPago } from "@/types";
import { Repeat, Trash2 } from "lucide-react";

export function GastosTab() {
  const state = useKaizenStore();
  const agregarGasto = useKaizenStore((s) => s.agregarGasto);
  const eliminarGasto = useKaizenStore((s) => s.eliminarGasto);

  const hoy = hoyISO();
  const presupuestoMes = state.finanzas.presupuestos.find((p) => p.mes === mesDe(hoy));

  const [fecha, setFecha] = useState(hoy);
  const [monto, setMonto] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [palabraClave, setPalabraClave] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago | "">("");
  const [nota, setNota] = useState("");

  const ultimasPalabras = useMemo(() => {
    const vistas = new Set<string>();
    const resultado: string[] = [];
    for (const g of [...state.finanzas.gastos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))) {
      const clave = g.palabraClave.trim();
      if (clave && !vistas.has(clave.toLowerCase())) {
        vistas.add(clave.toLowerCase());
        resultado.push(clave);
      }
      if (resultado.length >= 5) break;
    }
    return resultado;
  }, [state.finanzas.gastos]);

  const gastoFrecuente = useMemo(() => {
    const conteo = new Map<string, { gasto: Gasto; n: number }>();
    for (const g of state.finanzas.gastos) {
      const clave = g.palabraClave.trim().toLowerCase();
      const actual = conteo.get(clave);
      conteo.set(clave, { gasto: g, n: (actual?.n ?? 0) + 1 });
    }
    let mejor: { gasto: Gasto; n: number } | null = null;
    for (const v of conteo.values()) if (!mejor || v.n > mejor.n) mejor = v;
    return mejor && mejor.n > 1 ? mejor.gasto : null;
  }, [state.finanzas.gastos]);

  const repetir = (g: Gasto) => {
    setMonto(String(g.monto));
    setCategoriaId(g.categoriaId);
    setPalabraClave(g.palabraClave);
    setMetodo(g.metodo ?? "");
  };

  const guardar = () => {
    const m = parseFloat(monto);
    if (!m || m <= 0 || !categoriaId || !palabraClave.trim()) return;
    agregarGasto({ fecha, monto: m, categoriaId, palabraClave: palabraClave.trim(), metodo: metodo || undefined, nota: nota || undefined });
    setMonto("");
    setPalabraClave("");
    setNota("");
  };

  const gastosRecientes = [...state.finanzas.gastos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, 15);

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle title="Registrar gasto" subtitle="Menos de 10 segundos." />
        {!presupuestoMes ? (
          <EmptyState text="Define el presupuesto del mes antes de registrar gastos." />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Monto (MXN)">
                <Input type="number" inputMode="decimal" autoFocus value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" />
              </Field>
              <Field label="Fecha">
                <Input type="date" value={fecha} max={hoy} onChange={(e) => setFecha(e.target.value)} />
              </Field>
              <Field label="Categoría">
                <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                  <option value="">Elige...</option>
                  {presupuestoMes.categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Método (opcional)">
                <Select value={metodo} onChange={(e) => setMetodo(e.target.value as MetodoPago | "")}>
                  <option value="">—</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                </Select>
              </Field>
            </div>

            <div className="mt-3">
              <Field label="Palabra clave">
                <Input value={palabraClave} onChange={(e) => setPalabraClave(e.target.value)} placeholder="café, uber hospital..." />
              </Field>
              {ultimasPalabras.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {ultimasPalabras.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPalabraClave(p)}
                      className="px-2 py-1 rounded-md bg-base-800 text-xs text-base-300 hover:bg-base-700"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3">
              <Field label="Nota (opcional)">
                <Input value={nota} onChange={(e) => setNota(e.target.value)} />
              </Field>
            </div>

            <div className="mt-4 flex items-center justify-between">
              {gastoFrecuente ? (
                <Button variant="ghost" onClick={() => repetir(gastoFrecuente)} className="inline-flex items-center gap-1.5">
                  <Repeat className="w-4 h-4" /> Repetir "{gastoFrecuente.palabraClave}"
                </Button>
              ) : (
                <span />
              )}
              <Button onClick={guardar}>Guardar gasto</Button>
            </div>
          </>
        )}
      </Card>

      <Card>
        <SectionTitle title="Gastos recientes" />
        {gastosRecientes.length === 0 ? (
          <EmptyState text="Sin gastos todavía." />
        ) : (
          <ul className="divide-y divide-base-800">
            {gastosRecientes.map((g) => {
              const cat = state.finanzas.presupuestos.find((p) => p.mes === mesDe(g.fecha))?.categorias.find((c) => c.id === g.categoriaId);
              return (
                <li key={g.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-base-200 truncate">{g.palabraClave}</div>
                    <div className="text-xs text-base-500">
                      {formatoLargo(g.fecha)} · {cat?.nombre ?? "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-medium">${g.monto.toLocaleString()}</span>
                    <button onClick={() => eliminarGasto(g.id)} className="text-base-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
