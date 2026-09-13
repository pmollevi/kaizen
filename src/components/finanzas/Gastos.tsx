import React, { useMemo, useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Field, Input, Select, Button, Badge, EmptyState } from "@/components/ui/Primitives";
import { hoyISO, formatoLargo } from "@/lib/dates";
import type { Gasto, MetodoPago } from "@/types";
import { Repeat, Trash2 } from "lucide-react";

export function GastosTab() {
  const state = useKaizenStore();
  const agregarGasto = useKaizenStore((s) => s.agregarGasto);
  const eliminarGasto = useKaizenStore((s) => s.eliminarGasto);

  const hoy = hoyISO();

  const [fecha, setFecha] = useState(hoy);
  const [monto, setMonto] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [palabraClave, setPalabraClave] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const [tarjetaId, setTarjetaId] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    setMetodo(g.metodo);
    setTarjetaId(g.tarjetaId ?? "");
  };

  const guardar = () => {
    const m = parseFloat(monto);
    if (!m || m <= 0) return setError("Indica un monto válido.");
    if (!categoriaId) return setError("Elige una categoría.");
    if (!palabraClave.trim()) return setError("Indica qué compraste.");
    if (metodo === "tarjeta" && !tarjetaId) return setError("Elige con qué tarjeta pagaste.");
    setError(null);
    agregarGasto({
      fecha,
      monto: m,
      categoriaId,
      palabraClave: palabraClave.trim(),
      metodo,
      tarjetaId: metodo === "tarjeta" ? tarjetaId : undefined,
      nota: nota || undefined,
    });
    setMonto("");
    setPalabraClave("");
    setNota("");
  };

  const gastosRecientes = [...state.finanzas.gastos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, 15);
  const categoriaNombre = (id: string) => state.finanzas.categorias.find((c) => c.id === id)?.nombre ?? "—";

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle title="Registrar gasto" subtitle="Menos de 10 segundos." />
        {state.finanzas.categorias.length === 0 ? (
          <EmptyState text="Agrega una categoría de gasto en la pestaña Tarjetas antes de registrar gastos." />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Monto">
                <Input type="number" inputMode="decimal" autoFocus value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" />
              </Field>
              <Field label="Fecha">
                <Input type="date" value={fecha} max={hoy} onChange={(e) => setFecha(e.target.value)} />
              </Field>
              <Field label="Categoría">
                <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                  <option value="">Elige...</option>
                  {state.finanzas.categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Método de pago">
                <Select value={metodo} onChange={(e) => setMetodo(e.target.value as MetodoPago)}>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                </Select>
              </Field>
            </div>

            {metodo === "tarjeta" && (
              <div className="mt-3">
                {state.finanzas.tarjetas.length === 0 ? (
                  <div className="text-sm text-base-500">Registra una tarjeta en la pestaña Tarjetas primero.</div>
                ) : (
                  <Field label="Tarjeta">
                    <Select value={tarjetaId} onChange={(e) => setTarjetaId(e.target.value)}>
                      <option value="">Elige...</option>
                      {state.finanzas.tarjetas.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                    </Select>
                  </Field>
                )}
              </div>
            )}

            <div className="mt-3">
              <Field label="¿Qué compraste?">
                <Input value={palabraClave} onChange={(e) => setPalabraClave(e.target.value)} placeholder="café, uber, supermercado..." />
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

            <div className="mt-4 flex items-center justify-between gap-3">
              {gastoFrecuente ? (
                <Button variant="ghost" onClick={() => repetir(gastoFrecuente)} className="inline-flex items-center gap-1.5">
                  <Repeat className="w-4 h-4" /> Repetir "{gastoFrecuente.palabraClave}"
                </Button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-3">
                {error && <Badge tone="red">{error}</Badge>}
                <Button onClick={guardar}>Guardar gasto</Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Card>
        <SectionTitle title="Gastos recientes" />
        {gastosRecientes.length === 0 ? (
          <EmptyState text="Sin gastos todavía." />
        ) : (
          <ul className="divide-y divide-base-700">
            {gastosRecientes.map((g) => (
              <li key={g.id} className="flex items-center justify-between py-2.5 text-sm">
                <div className="min-w-0">
                  <div className="font-medium text-base-200 truncate">{g.palabraClave}</div>
                  <div className="text-xs text-base-500">
                    {formatoLargo(g.fecha)} · {categoriaNombre(g.categoriaId)} · {g.metodo === "tarjeta" ? "tarjeta" : "efectivo"}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-medium">${g.monto.toLocaleString()}</span>
                  <button onClick={() => eliminarGasto(g.id)} className="text-base-500 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
