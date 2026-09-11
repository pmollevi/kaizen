import React, { useMemo, useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { CATALOGO_AREAS } from "@/config/areaCatalog";
import { Button, Field, Input, Badge } from "@/components/ui/Primitives";
import { diasDelMes, formatoMes, hoyISO, mesDe } from "@/lib/dates";
import { generarId } from "@/lib/id";
import { X, Plus, Trash2, Check } from "lucide-react";

interface GastoFijoDraft {
  key: string;
  nombre: string;
  monto: string;
}

export function PlanMensualWizard({ onClose }: { onClose: () => void }) {
  const state = useKaizenStore();
  const aplicarPlanMensual = useKaizenStore((s) => s.aplicarPlanMensual);

  const [mes] = useState(mesDe(hoyISO()));
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const idsActivosIniciales = state.areas.length > 0 ? state.areas.map((a) => a.id) : ["intelecto", "imperio", "fuerza", "vitalidad", "energia", "sabiduria"];
  const [seleccionados, setSeleccionados] = useState<string[]>(idsActivosIniciales);
  const [pesos, setPesos] = useState<Record<string, number>>(() => distribuirPesos(idsActivosIniciales));

  const semanas = diasDelMes(mes) / 7;
  const [metasMensuales, setMetasMensuales] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    for (const id of idsActivosIniciales) {
      const existente = state.areas.find((a) => a.id === id);
      const base = existente ? existente.metaSemanalBase : CATALOGO_AREAS.find((c) => c.id === id)?.metaSemanalSugerida ?? 0;
      m[id] = Math.round(base * semanas);
    }
    return m;
  });

  const presupuestoActual = state.finanzas.presupuestos.find((p) => p.mes === mes);
  const [dineroUtil, setDineroUtil] = useState(presupuestoActual?.dineroUtil ?? 0);
  const [gastosFijos, setGastosFijos] = useState<GastoFijoDraft[]>(
    presupuestoActual
      ? presupuestoActual.categorias
          .filter((c) => c.tipo === "gasto" && c.modo === "fijo")
          .map((c) => ({ key: generarId("gf"), nombre: c.nombre, monto: String(c.valor) }))
      : [{ key: generarId("gf"), nombre: "", monto: "" }]
  );
  const [ahorro, setAhorro] = useState(
    presupuestoActual?.categorias.find((c) => c.tipo === "ahorro")?.valor ?? 0
  );

  function distribuirPesos(ids: string[]): Record<string, number> {
    if (ids.length === 0) return {};
    const base = Math.floor(100 / ids.length);
    const resultado: Record<string, number> = {};
    ids.forEach((id, i) => {
      resultado[id] = i === ids.length - 1 ? 100 - base * (ids.length - 1) : base;
    });
    return resultado;
  }

  const toggleHabito = (id: string) => {
    const nuevos = seleccionados.includes(id) ? seleccionados.filter((x) => x !== id) : [...seleccionados, id];
    setSeleccionados(nuevos);
    setPesos(distribuirPesos(nuevos));
    if (!(id in metasMensuales)) {
      const existente = state.areas.find((a) => a.id === id);
      const base = existente ? existente.metaSemanalBase : CATALOGO_AREAS.find((c) => c.id === id)?.metaSemanalSugerida ?? 0;
      setMetasMensuales((m) => ({ ...m, [id]: Math.round(base * semanas) }));
    }
  };

  const sumaPesos = seleccionados.reduce((acc, id) => acc + (pesos[id] ?? 0), 0);

  const totalGastosFijos = gastosFijos.reduce((acc, g) => acc + (parseFloat(g.monto) || 0), 0);
  const dineroLibre = dineroUtil - totalGastosFijos - ahorro;

  const guardar = () => {
    aplicarPlanMensual({
      mes,
      habitos: seleccionados.map((id) => ({ id, peso: (pesos[id] ?? 0) / 100, metaMensual: metasMensuales[id] ?? 0 })),
      dineroUtil,
      gastosFijos: gastosFijos.map((g) => ({ nombre: g.nombre, monto: parseFloat(g.monto) || 0 })),
      ahorro,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-base-900 rounded-2xl shadow-card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-pop">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-800 sticky top-0 bg-base-900">
          <div>
            <div className="text-base font-semibold">Planear {formatoMes(mes)}</div>
            <div className="text-xs text-base-500 mt-0.5">Paso {step} de 3</div>
          </div>
          <button onClick={onClose} className="text-base-400 hover:text-base-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-base-200 mb-1">¿En qué hábitos quieres mejorar este mes?</div>
                <div className="text-xs text-base-500">Elige los que quieras trabajar. Más de 7-8 suele ser difícil de sostener.</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CATALOGO_AREAS.map((c) => {
                  const activo = seleccionados.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleHabito(c.id)}
                      className={`text-left rounded-xl border px-3 py-2.5 transition-all active:scale-[0.98] ${
                        activo ? "border-sky-600 bg-sky-600/10" : "border-base-800 hover:border-base-700"
                      }`}
                      style={activo ? { borderColor: `${c.color}88`, background: `${c.color}18` } : undefined}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">{c.emoji}</span>
                        <span className="text-sm font-medium flex-1" style={{ color: activo ? c.color : undefined }}>
                          {c.nombre}
                        </span>
                        {activo && <Check className="w-3.5 h-3.5 text-sky-400" />}
                      </div>
                      <div className="text-xs text-base-500 mt-0.5 pl-7">{c.dominio}</div>
                    </button>
                  );
                })}
              </div>

              {seleccionados.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-base-200">Peso de cada uno (debe sumar 100%)</div>
                    <Badge tone={sumaPesos === 100 ? "green" : "red"}>{sumaPesos}%</Badge>
                  </div>
                  <div className="space-y-2">
                    {seleccionados.map((id) => {
                      const c = CATALOGO_AREAS.find((x) => x.id === id)!;
                      return (
                        <div key={id} className="flex items-center gap-3">
                          <span className="text-sm text-base-300 w-28 truncate">{c.nombre}</span>
                          <Input
                            type="number"
                            className="w-20"
                            value={pesos[id] ?? 0}
                            onChange={(e) => setPesos((p) => ({ ...p, [id]: parseInt(e.target.value) || 0 }))}
                          />
                          <span className="text-xs text-base-500">%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-sm font-medium text-base-200">Ponle una meta mensual a cada hábito</div>
              <div className="space-y-3">
                {seleccionados.map((id) => {
                  const c = CATALOGO_AREAS.find((x) => x.id === id)!;
                  return (
                    <Field key={id} label={`${c.nombre} — ${c.metrica} (al mes, en ${c.unidad})`}>
                      <Input
                        type="number"
                        value={metasMensuales[id] ?? 0}
                        onChange={(e) => setMetasMensuales((m) => ({ ...m, [id]: parseFloat(e.target.value) || 0 }))}
                      />
                    </Field>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-sm font-medium text-base-200">Ahora la parte económica</div>
              <Field label="¿Cuánto dinero tienes disponible este mes? (MXN)">
                <Input type="number" value={dineroUtil || ""} onChange={(e) => setDineroUtil(parseFloat(e.target.value) || 0)} />
              </Field>

              <div>
                <div className="text-xs font-medium text-base-300 mb-1.5">
                  Gastos fijos necesarios (gasolina, luz, agua, renta...)
                </div>
                <div className="space-y-2">
                  {gastosFijos.map((g, i) => (
                    <div key={g.key} className="flex items-center gap-2">
                      <Input
                        className="flex-1"
                        placeholder="Nombre (ej. gasolina)"
                        value={g.nombre}
                        onChange={(e) =>
                          setGastosFijos((arr) => arr.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))
                        }
                      />
                      <Input
                        className="w-28"
                        type="number"
                        placeholder="Monto"
                        value={g.monto}
                        onChange={(e) =>
                          setGastosFijos((arr) => arr.map((x, j) => (j === i ? { ...x, monto: e.target.value } : x)))
                        }
                      />
                      <button
                        onClick={() => setGastosFijos((arr) => arr.filter((_, j) => j !== i))}
                        className="text-base-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="mt-2 inline-flex items-center gap-1.5"
                  onClick={() => setGastosFijos((arr) => [...arr, { key: generarId("gf"), nombre: "", monto: "" }])}
                >
                  <Plus className="w-4 h-4" /> Agregar gasto fijo
                </Button>
              </div>

              <Field label="¿Cuánto de lo que sobra quieres apartar directo a ahorro? (opcional)">
                <Input type="number" value={ahorro || ""} onChange={(e) => setAhorro(parseFloat(e.target.value) || 0)} />
              </Field>

              <div className="rounded-lg bg-base-850 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-base-300">Dinero libre (con esto se juega)</span>
                  <span className={`text-lg font-semibold ${dineroLibre < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    ${dineroLibre.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-base-500 mt-1">
                  Dinero total − gastos fijos − ahorro. Es lo que alimenta el Banco de Recompensas del juego.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-base-800 sticky bottom-0 bg-base-900">
          <Button variant="ghost" onClick={() => (step === 1 ? onClose() : setStep((s) => ((s - 1) as 1 | 2 | 3)))}>
            {step === 1 ? "Cancelar" : "Atrás"}
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => ((s + 1) as 1 | 2 | 3))}
              disabled={step === 1 && (seleccionados.length === 0 || sumaPesos !== 100)}
            >
              Siguiente
            </Button>
          ) : (
            <Button onClick={guardar} disabled={dineroLibre < 0 || dineroUtil <= 0}>
              Guardar plan y empezar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
