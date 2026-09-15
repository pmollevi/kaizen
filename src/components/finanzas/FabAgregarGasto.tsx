import React, { useEffect, useRef, useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Button, Field, Input, Select, Badge } from "@/components/ui/Primitives";
import { hoyISO } from "@/lib/dates";
import type { MetodoPago } from "@/types";
import { OrigoMark } from "@/components/ui/OrigoMark";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { Plus, X } from "lucide-react";

// El teclado móvil reduce el visualViewport sin encoger el layout viewport (100vh):
// seguimos su altura real para que la hoja nunca quede tapada por el teclado.
function useAlturaVisible() {
  const [alto, setAlto] = useState(() => window.visualViewport?.height ?? window.innerHeight);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const actualizar = () => setAlto(vv.height);
    vv.addEventListener("resize", actualizar);
    return () => vv.removeEventListener("resize", actualizar);
  }, []);
  return alto;
}

export function FabAgregarGasto() {
  const state = useKaizenStore();
  const agregarGasto = useKaizenStore((s) => s.agregarGasto);
  const [abierto, setAbierto] = useState(false);
  const [monto, setMonto] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [palabraClave, setPalabraClave] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const [tarjetaId, setTarjetaId] = useState("");
  useBodyScrollLock(abierto);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errores, setErrores] = useState<{ monto?: boolean; categoria?: boolean; tarjeta?: boolean; palabra?: boolean }>({});
  const alturaVisible = useAlturaVisible();
  const hojaRef = useRef<HTMLDivElement>(null);

  const llevarAlaVista = (e: React.FocusEvent<HTMLElement>) => {
    setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 150);
  };

  const hoy = hoyISO();

  const cerrar = () => {
    setAbierto(false);
    setMonto("");
    setCategoriaId("");
    setPalabraClave("");
    setMetodo("efectivo");
    setTarjetaId("");
    setGuardado(false);
    setError(null);
    setErrores({});
  };

  const guardar = () => {
    const m = parseFloat(monto);
    const nuevosErrores: typeof errores = {};
    if (!m || m <= 0) nuevosErrores.monto = true;
    if (!categoriaId) nuevosErrores.categoria = true;
    if (!palabraClave.trim()) nuevosErrores.palabra = true;
    if (metodo === "tarjeta" && !tarjetaId) nuevosErrores.tarjeta = true;
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setError("Completa los campos marcados en rojo.");
      return;
    }
    setErrores({});
    setError(null);
    agregarGasto({
      fecha: hoy,
      monto: m,
      categoriaId,
      palabraClave: palabraClave.trim(),
      metodo,
      tarjetaId: metodo === "tarjeta" ? tarjetaId : undefined,
    });
    setGuardado(true);
    setTimeout(cerrar, 900);
  };

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        aria-label="Agregar gasto rápido"
        data-coach="coach-fab-gasto"
        className="fixed z-40 right-4 md:right-6 bottom-24 md:bottom-6 w-14 h-14 rounded-full bg-finanzas-400 hover:bg-finanzas-300 active:scale-95 transition-all flex items-center justify-center text-base-950 shadow-soft"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"
          style={{ height: alturaVisible }}
          onClick={cerrar}
        >
          <div
            ref={hojaRef}
            className="w-full sm:max-w-sm bg-base-900 border border-base-700 rounded-2xl shadow-soft p-5 animate-pop overflow-y-auto"
            style={{ maxHeight: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold inline-flex items-center gap-2">
                <OrigoMark size={16} /> Agregar gasto
              </h3>
              <button onClick={cerrar} className="text-base-400 hover:text-base-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {state.finanzas.categorias.length === 0 ? (
              <p className="text-sm text-base-500">Agrega una categoría de gasto en Finanzas antes de registrar gastos.</p>
            ) : guardado ? (
              <p className="text-sm text-finanzas-400 py-4 text-center">Gasto guardado.</p>
            ) : (
              <div className="space-y-3">
                <Field label="Monto" required>
                  <Input
                    type="number"
                    inputMode="decimal"
                    autoFocus
                    error={errores.monto}
                    value={monto}
                    onChange={(e) => {
                      setMonto(e.target.value);
                      if (errores.monto) setErrores((prev) => ({ ...prev, monto: false }));
                    }}
                    onFocus={llevarAlaVista}
                    placeholder="0"
                  />
                </Field>
                <Field label="Categoría" required>
                  <Select
                    value={categoriaId}
                    error={errores.categoria}
                    onChange={(e) => {
                      setCategoriaId(e.target.value);
                      if (errores.categoria) setErrores((prev) => ({ ...prev, categoria: false }));
                    }}
                    onFocus={llevarAlaVista}
                  >
                    <option value="">Elige...</option>
                    {state.finanzas.categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMetodo("efectivo")}
                    className={`h-10 rounded-xl text-sm font-medium border transition-all active:scale-95 ${
                      metodo === "efectivo" ? "border-finanzas-500/40 bg-finanzas-500/10 text-finanzas-400" : "border-base-700 text-base-400"
                    }`}
                  >
                    Efectivo
                  </button>
                  <button
                    onClick={() => setMetodo("tarjeta")}
                    disabled={state.finanzas.tarjetas.length === 0}
                    className={`h-10 rounded-xl text-sm font-medium border transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 ${
                      metodo === "tarjeta" ? "border-finanzas-500/40 bg-finanzas-500/10 text-finanzas-400" : "border-base-700 text-base-400"
                    }`}
                  >
                    Tarjeta
                  </button>
                </div>
                {metodo === "tarjeta" && (
                  <Field label="Tarjeta" required>
                    <Select
                      value={tarjetaId}
                      error={errores.tarjeta}
                      onChange={(e) => {
                        setTarjetaId(e.target.value);
                        if (errores.tarjeta) setErrores((prev) => ({ ...prev, tarjeta: false }));
                      }}
                      onFocus={llevarAlaVista}
                    >
                      <option value="">Elige...</option>
                      {state.finanzas.tarjetas.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                    </Select>
                  </Field>
                )}
                <Field label="¿Qué compraste?" required>
                  <Input
                    error={errores.palabra}
                    value={palabraClave}
                    onChange={(e) => {
                      setPalabraClave(e.target.value);
                      if (errores.palabra) setErrores((prev) => ({ ...prev, palabra: false }));
                    }}
                    onKeyDown={(e) => e.key === "Enter" && guardar()}
                    onFocus={llevarAlaVista}
                    placeholder="café, uber..."
                  />
                </Field>
                {error && <Badge tone="red">{error}</Badge>}
                <Button className="w-full" onClick={guardar}>
                  Guardar gasto
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
