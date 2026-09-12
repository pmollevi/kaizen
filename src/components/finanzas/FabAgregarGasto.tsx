import React, { useEffect, useRef, useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Button, Field, Input, Select } from "@/components/ui/Primitives";
import { hoyISO, mesDe } from "@/lib/dates";
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
  const [guardado, setGuardado] = useState(false);
  const alturaVisible = useAlturaVisible();
  const hojaRef = useRef<HTMLDivElement>(null);

  const llevarAlaVista = (e: React.FocusEvent<HTMLElement>) => {
    setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 150);
  };

  const hoy = hoyISO();
  const presupuestoMes = state.finanzas.presupuestos.find((p) => p.mes === mesDe(hoy));

  const cerrar = () => {
    setAbierto(false);
    setMonto("");
    setCategoriaId("");
    setPalabraClave("");
    setGuardado(false);
  };

  const guardar = () => {
    const m = parseFloat(monto);
    if (!m || m <= 0 || !categoriaId || !palabraClave.trim()) return;
    agregarGasto({ fecha: hoy, monto: m, categoriaId, palabraClave: palabraClave.trim() });
    setGuardado(true);
    setTimeout(cerrar, 900);
  };

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        aria-label="Agregar gasto rápido"
        className="fixed z-40 right-4 md:right-6 bottom-24 md:bottom-6 w-14 h-14 rounded-full bg-sky-500 hover:bg-sky-400 active:scale-95 transition-all flex items-center justify-center text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_12px_28px_-8px_rgba(59,130,246,0.7)]"
      >
        <Plus className="w-6 h-6" />
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          style={{ height: alturaVisible }}
          onClick={cerrar}
        >
          <div
            ref={hojaRef}
            className="w-full sm:max-w-sm bg-base-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] p-5 animate-pop overflow-y-auto"
            style={{ maxHeight: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Agregar gasto</h3>
              <button onClick={cerrar} className="text-base-400 hover:text-base-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!presupuestoMes ? (
              <p className="text-sm text-base-500">
                Configura el presupuesto de este mes en Finanzas antes de registrar gastos.
              </p>
            ) : guardado ? (
              <p className="text-sm text-emerald-400 py-4 text-center">Gasto guardado.</p>
            ) : (
              <div className="space-y-3">
                <Field label="Monto (MXN)">
                  <Input
                    type="number"
                    inputMode="decimal"
                    autoFocus
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    onFocus={llevarAlaVista}
                    placeholder="0"
                  />
                </Field>
                <Field label="Categoría">
                  <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} onFocus={llevarAlaVista}>
                    <option value="">Elige...</option>
                    {presupuestoMes.categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Palabra clave">
                  <Input
                    value={palabraClave}
                    onChange={(e) => setPalabraClave(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && guardar()}
                    onFocus={llevarAlaVista}
                    placeholder="café, uber..."
                  />
                </Field>
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
