import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { CATALOGO_AREAS, type PlantillaArea } from "@/config/areaCatalog";
import { iconoDeHabito } from "@/config/habitIcons";
import { Button, Field, Input, Badge } from "@/components/ui/Primitives";
import { formatoMes, hoyISO, mesDe } from "@/lib/dates";
import { generarId } from "@/lib/id";
import { X, Plus, Trash2, Check } from "lucide-react";

// Para hábitos continuos (horas, páginas, minutos) el usuario pone la meta DIARIA
// y la semanal se calcula sola. Para hábitos que ya son un conteo semanal
// (días entrenados, veces con amigos) el número que pone ya es la meta semanal.
function esMetaDiaria(tipo: PlantillaArea["tipoMeta"]): boolean {
  return tipo === "horas" || tipo === "minutos" || tipo === "paginas" || tipo === "conteo3";
}

function metaSemanalDesdeValor(c: PlantillaArea, valor: number): number {
  return esMetaDiaria(c.tipoMeta) ? Math.round(valor * 7 * 100) / 100 : valor;
}

function valorInicial(c: PlantillaArea, existente: { metaDiaria: number | null; metaSemanalBase: number } | undefined): number {
  if (esMetaDiaria(c.tipoMeta)) {
    if (existente?.metaDiaria != null) return existente.metaDiaria;
    return c.metaDiariaSugerida ?? Math.round((c.metaSemanalSugerida / 7) * 100) / 100;
  }
  const base = existente?.metaSemanalBase ?? c.metaSemanalSugerida;
  return c.tipoMeta === "binaria" ? Math.round(base) : base;
}

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

  const [metas, setMetas] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    for (const id of idsActivosIniciales) {
      const c = CATALOGO_AREAS.find((x) => x.id === id);
      if (!c) continue;
      m[id] = valorInicial(c, state.areas.find((a) => a.id === id));
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
    if (!(id in metas)) {
      const c = CATALOGO_AREAS.find((x) => x.id === id);
      if (c) setMetas((m) => ({ ...m, [id]: valorInicial(c, state.areas.find((a) => a.id === id)) }));
    }
  };

  const sumaPesos = seleccionados.reduce((acc, id) => acc + (pesos[id] ?? 0), 0);

  const totalGastosFijos = gastosFijos.reduce((acc, g) => acc + (parseFloat(g.monto) || 0), 0);
  const dineroLibre = dineroUtil - totalGastosFijos - ahorro;

  const guardar = () => {
    aplicarPlanMensual({
      mes,
      habitos: seleccionados.map((id) => {
        const c = CATALOGO_AREAS.find((x) => x.id === id)!;
        return { id, peso: (pesos[id] ?? 0) / 100, metaSemanal: metaSemanalDesdeValor(c, metas[id] ?? 0) };
      }),
      dineroUtil,
      gastosFijos: gastosFijos.map((g) => ({ nombre: g.nombre, monto: parseFloat(g.monto) || 0 })),
      ahorro,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-base-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-pop">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-base-900/95 backdrop-blur-xl">
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
                  const Icono = iconoDeHabito(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleHabito(c.id)}
                      className={`text-left rounded-xl border px-3 py-2.5 transition-all active:scale-[0.98] ${
                        activo ? "border-sky-500/50 bg-sky-500/10" : "border-white/10 hover:border-white/20"
                      }`}
                      style={activo ? { borderColor: `${c.color}88`, background: `${c.color}18` } : undefined}
                    >
                      <div className="flex items-center gap-2">
                        <Icono className="w-4 h-4 shrink-0" style={{ color: activo ? c.color : undefined }} />
                        <span className="text-sm font-medium flex-1" style={{ color: activo ? c.color : undefined }}>
                          {c.nombre}
                        </span>
                        {activo && <Check className="w-3.5 h-3.5 text-sky-400" />}
                      </div>
                      <div className="text-xs text-base-500 mt-0.5 pl-6">{c.dominio}</div>
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
              <div className="text-sm font-medium text-base-200">Ponle una meta a cada hábito</div>
              <div className="text-xs text-base-500 -mt-2">
                En los que se miden en horas, páginas o minutos, dinos tu meta por día y nosotros sacamos la cuenta de la semana.
              </div>
              <div className="space-y-3">
                {seleccionados.map((id) => {
                  const c = CATALOGO_AREAS.find((x) => x.id === id)!;
                  const diaria = esMetaDiaria(c.tipoMeta);
                  const valor = metas[id] ?? 0;
                  const semanal = metaSemanalDesdeValor(c, valor);
                  const Icono = iconoDeHabito(c.id);
                  return (
                    <div key={id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <Icono className="w-4 h-4" style={{ color: c.color }} />
                        <span className="text-sm font-medium">{c.nombre}</span>
                        <span className="text-xs text-base-500">· {c.metrica}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Field label={diaria ? `Meta diaria (${c.unidad})` : `Meta semanal (${c.unidad})`}>
                          <Input
                            type="number"
                            step={c.tipoMeta === "horas" ? 0.5 : 1}
                            max={c.tipoMeta === "binaria" || c.tipoMeta === "veces" ? 7 : undefined}
                            value={valor}
                            onChange={(e) => setMetas((m) => ({ ...m, [id]: parseFloat(e.target.value) || 0 }))}
                          />
                        </Field>
                        {diaria && (
                          <div className="text-xs text-base-500 whitespace-nowrap pt-5">
                            = <span className="text-base-200 font-medium">{semanal}</span> a la semana
                          </div>
                        )}
                      </div>
                    </div>
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

              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
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

        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 sticky bottom-0 bg-base-900/95 backdrop-blur-xl">
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
