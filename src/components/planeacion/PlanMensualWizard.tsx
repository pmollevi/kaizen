import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { CATALOGO_AREAS, type PlantillaArea } from "@/config/areaCatalog";
import { iconoDeHabito } from "@/config/habitIcons";
import { Button, Field, Input, InputDiaDelMes, ScrollFade, useScrollFade } from "@/components/ui/Primitives";
import { SelectorHorizontal } from "@/components/ui/SelectorHorizontal";
import { formatoMes, hoyISO, mesDe } from "@/lib/dates";
import { generarId } from "@/lib/id";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { X, Check, Plus, Trash2 } from "lucide-react";

const MAX_TARJETAS = 3;

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

// Rango y paso del selector horizontal para cada tipo de meta. Generoso a
// propósito — cubre a quien lee/entrena/trabaja muy por encima del promedio;
// quien tenga una meta todavía mayor puede tocar el número y escribirla.
function rangoParaTipo(c: PlantillaArea): { min: number; max: number; step: number } {
  if (c.tipoMeta === "conteo3") return { min: 0, max: 3, step: 1 };
  if (c.tipoMeta === "binaria") return { min: 0, max: 7, step: 1 };
  if (c.tipoMeta === "veces") return { min: 0, max: 14, step: 1 };
  if (c.tipoMeta === "horas") return { min: 0, max: 16, step: 0.5 };
  if (c.tipoMeta === "paginas") return { min: 0, max: 300, step: 5 };
  return { min: 0, max: 240, step: 5 }; // minutos
}

function distribuirPesos(ids: string[]): Record<string, number> {
  if (ids.length === 0) return {};
  const base = Math.floor(100 / ids.length);
  const resultado: Record<string, number> = {};
  ids.forEach((id, i) => {
    resultado[id] = i === ids.length - 1 ? 100 - base * (ids.length - 1) : base;
  });
  return resultado;
}

interface TarjetaDraft {
  key: string;
  nombre: string;
  diaCorte: number;
}

export function PlanMensualWizard({ onClose }: { onClose: () => void }) {
  const state = useKaizenStore();
  const aplicarPlanMensual = useKaizenStore((s) => s.aplicarPlanMensual);
  const setMetaMensual = useKaizenStore((s) => s.setMetaMensual);
  const setIngresoMensual = useKaizenStore((s) => s.setIngresoMensual);
  const agregarTarjeta = useKaizenStore((s) => s.agregarTarjeta);

  const esPrimeraVez = state.planesMensuales.length === 0;
  const [mes] = useState(mesDe(hoyISO()));
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [metaIndex, setMetaIndex] = useState(0);
  const [metaGrande, setMetaGrande] = useState(
    state.metasMensuales.find((m) => m.mes === mesDe(hoyISO()))?.descripcion ?? ""
  );

  // Primera vez: arranca vacío para forzar una elección deliberada de 2-3 hábitos.
  // Re-planeación: preselecciona lo que ya tenía activo.
  const idsActivosIniciales = esPrimeraVez ? [] : state.areas.map((a) => a.id);
  const [seleccionados, setSeleccionados] = useState<string[]>(idsActivosIniciales);

  const [metas, setMetas] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    for (const id of idsActivosIniciales) {
      const c = CATALOGO_AREAS.find((x) => x.id === id);
      if (!c) continue;
      m[id] = valorInicial(c, state.areas.find((a) => a.id === id));
    }
    return m;
  });

  const [ingresoMensual, setIngresoMensualLocal] = useState(0);
  const espacioTarjetas = Math.max(0, MAX_TARJETAS - state.finanzas.tarjetas.length);
  const [tarjetasNuevas, setTarjetasNuevas] = useState<TarjetaDraft[]>([]);
  const [formTarjetaAbierto, setFormTarjetaAbierto] = useState(false);
  const [nombreTarjeta, setNombreTarjeta] = useState("");
  const [diaCorteTarjeta, setDiaCorteTarjeta] = useState(1);

  const toggleHabito = (id: string) => {
    const nuevos = seleccionados.includes(id) ? seleccionados.filter((x) => x !== id) : [...seleccionados, id];
    setSeleccionados(nuevos);
    if (!(id in metas)) {
      const c = CATALOGO_AREAS.find((x) => x.id === id);
      if (c) setMetas((m) => ({ ...m, [id]: valorInicial(c, state.areas.find((a) => a.id === id)) }));
    }
  };

  const finalizar = () => {
    const pesos = distribuirPesos(seleccionados);
    aplicarPlanMensual({
      mes,
      habitos: seleccionados.map((id) => {
        const c = CATALOGO_AREAS.find((x) => x.id === id)!;
        return { id, peso: (pesos[id] ?? 0) / 100, metaSemanal: metaSemanalDesdeValor(c, metas[id] ?? 0) };
      }),
    });
    if (metaGrande.trim()) setMetaMensual(mes, metaGrande.trim());
    if (ingresoMensual > 0) setIngresoMensual(mes, ingresoMensual);
    for (const t of tarjetasNuevas) {
      if (t.nombre.trim()) agregarTarjeta({ nombre: t.nombre, diaCorte: t.diaCorte });
    }
    onClose();
  };

  const agregarTarjetaDraft = () => {
    if (!nombreTarjeta.trim()) return;
    setTarjetasNuevas((arr) => [...arr, { key: generarId("tj"), nombre: nombreTarjeta.trim(), diaCorte: diaCorteTarjeta }]);
    setNombreTarjeta("");
    setDiaCorteTarjeta(1);
    setFormTarjetaAbierto(false);
  };

  const irASiguienteMeta = () => {
    if (metaIndex + 1 < seleccionados.length) setMetaIndex((i) => i + 1);
    else setStep(3);
  };
  const irAAnteriorMeta = () => {
    if (metaIndex > 0) setMetaIndex((i) => i - 1);
    else setStep(1);
  };

  const { ref: scrollRef, arribaOculto, abajoOculto, onScroll } = useScrollFade<HTMLDivElement>();
  useBodyScrollLock(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-base-900 border border-base-700 rounded-2xl shadow-soft w-full max-w-2xl max-h-[90vh] flex flex-col animate-pop">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-700 shrink-0">
          <div>
            <div className="text-base font-semibold">Planear {formatoMes(mes)}</div>
            <div className="text-xs text-base-500 mt-0.5">Paso {step} de 3</div>
          </div>
          <button onClick={onClose} className="text-base-400 hover:text-base-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* flex flex-col aquí en vez de solo "relative": con contenido largo (ver
            punto 1 de la ronda de UX, lista vertical de hábitos) el hijo con
            h-full no siempre resolvía su alto por porcentaje contra este padre
            y terminaba creciendo al alto de su contenido en vez de recortarse.
            Anidar flex-1/min-h-0 en vez de depender de un porcentaje evita eso. */}
        <div className="relative min-h-0 flex-1 flex flex-col">
          <div ref={scrollRef} onScroll={onScroll} className="flex-1 min-h-0 overflow-y-auto p-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-base-200 mb-1">
                    {esPrimeraVez ? "¿Con qué hábitos quieres empezar?" : "¿En qué hábitos quieres mejorar este mes?"}
                  </div>
                  <div className="text-xs text-base-500">
                    {esPrimeraVez
                      ? "Menos es más al principio. Puedes activar el resto del catálogo cuando estos ya sean automáticos."
                      : "Elige los que quieras trabajar. Más de 7-8 suele ser difícil de sostener."}
                  </div>
                </div>
                <div className="space-y-2">
                  {CATALOGO_AREAS.map((c) => {
                    const activo = seleccionados.includes(c.id);
                    const Icono = iconoDeHabito(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleHabito(c.id)}
                        className={`relative w-full text-left rounded-xl border px-3 py-2.5 transition-all active:scale-[0.98] ${
                          activo ? "border-kaizen-500/40 bg-base-850" : "border-base-700 hover:border-base-600"
                        }`}
                      >
                        {activo && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: c.color }} />}
                        <div className="flex items-center gap-2">
                          <Icono className="w-4 h-4 shrink-0" style={{ color: activo ? c.color : undefined }} />
                          <span className="text-sm font-medium flex-1 text-base-200">{c.nombre}</span>
                          {activo && <Check className="w-3.5 h-3.5 text-kaizen-400" />}
                        </div>
                        <div className="text-xs text-base-500 mt-0.5 pl-6 whitespace-pre-line break-words">{c.descripcion}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 &&
              (() => {
                const id = seleccionados[metaIndex];
                const c = CATALOGO_AREAS.find((x) => x.id === id)!;
                const diaria = esMetaDiaria(c.tipoMeta);
                const valor = metas[id] ?? 0;
                const semanal = metaSemanalDesdeValor(c, valor);
                const Icono = iconoDeHabito(c.id);
                const rango = rangoParaTipo(c);

                return (
                  <div className="space-y-5">
                    <div className="text-center text-xs uppercase tracking-wider text-base-500 font-medium">
                      Hábito {metaIndex + 1} de {seleccionados.length}
                    </div>

                    <div key={id} className="rounded-2xl border p-6 animate-pop" style={{ borderColor: `${c.color}55`, background: `${c.color}0d` }}>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Icono className="w-5 h-5" style={{ color: c.color }} />
                        <span className="text-base font-semibold text-base-100">{c.nombre}</span>
                      </div>
                      <div className="text-xs text-base-500 text-center mb-4">
                        {diaria ? "meta diaria" : "meta semanal"} · {c.unidad}
                      </div>
                      <SelectorHorizontal
                        value={valor}
                        onChange={(v) => setMetas((m) => ({ ...m, [id]: v }))}
                        min={rango.min}
                        max={rango.max}
                        step={rango.step}
                        unidad={c.unidad}
                        color={c.color}
                      />
                      {diaria && (
                        <div className="text-xs text-base-500 text-center mt-1">
                          = <span className="text-base-200 font-medium">{semanal}</span> a la semana
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-1.5">
                      {seleccionados.map((_, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full transition-colors"
                          style={{ background: i === metaIndex ? c.color : "#292C2A" }}
                        />
                      ))}
                    </div>

                    <div className="pt-2 border-t border-base-700">
                      <div className="text-sm font-medium text-base-200 mb-1.5">Tu meta grande de {formatoMes(mes)}</div>
                      <textarea
                        rows={2}
                        value={metaGrande}
                        onChange={(e) => setMetaGrande(e.target.value)}
                        placeholder="Ej. Entrenar 4 veces por semana y leer 100 páginas"
                        className="w-full bg-base-850 border border-base-700 rounded-xl px-3 py-2 text-base sm:text-sm text-base-100 placeholder:text-base-500 focus:outline-none focus:border-kaizen-400 focus:ring-2 focus:ring-kaizen-400/40"
                      />
                      <div className="text-xs text-base-500 mt-1">Al cerrar el mes te preguntamos si la cumpliste o no.</div>
                    </div>
                  </div>
                );
              })()}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <div className="text-sm font-medium text-base-200 mb-1">Configuración financiera (opcional)</div>
                  <div className="text-xs text-base-500">
                    Para comparar cuánto gastas contra cuánto ganas. Puedes hacerlo después desde Finanzas o Configuración.
                  </div>
                </div>

                <Field label="Ingreso mensual (opcional)">
                  <Input
                    type="number"
                    min={0}
                    value={ingresoMensual || ""}
                    onChange={(e) => setIngresoMensualLocal(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </Field>

                <div>
                  <div className="text-xs font-medium text-base-300 mb-2">Tarjetas de crédito (hasta {MAX_TARJETAS})</div>
                  {tarjetasNuevas.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {tarjetasNuevas.map((t) => (
                        <div key={t.key} className="flex items-center justify-between rounded-lg bg-base-850 border border-base-700 px-3 py-2 text-sm">
                          <span className="text-base-200">
                            {t.nombre} <span className="text-base-500">· corte día {t.diaCorte}</span>
                          </span>
                          <button
                            onClick={() => setTarjetasNuevas((arr) => arr.filter((x) => x.key !== t.key))}
                            className="text-base-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {tarjetasNuevas.length >= espacioTarjetas ? (
                    <div className="text-xs text-base-500">
                      {espacioTarjetas === 0 ? "Ya tienes el máximo de tarjetas registradas." : "Llegaste al máximo de tarjetas para este paso."}
                    </div>
                  ) : formTarjetaAbierto ? (
                    <div className="rounded-lg border border-base-700 bg-base-850 p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Nombre">
                          <Input value={nombreTarjeta} onChange={(e) => setNombreTarjeta(e.target.value)} placeholder="Ej. Platino BBVA" />
                        </Field>
                        <Field label="Día de corte" hint="Aquí pones el día del mes en que corta tu tarjeta.">
                          <InputDiaDelMes value={diaCorteTarjeta} onChange={setDiaCorteTarjeta} />
                        </Field>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={agregarTarjetaDraft}>
                          Guardar tarjeta
                        </Button>
                        <Button variant="ghost" onClick={() => setFormTarjetaAbierto(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="ghost" onClick={() => setFormTarjetaAbierto(true)} className="inline-flex items-center gap-1.5">
                      <Plus className="w-4 h-4" /> Agregar tarjeta
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          <ScrollFade side="top" visible={arribaOculto} />
          <ScrollFade side="bottom" visible={abajoOculto} />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-base-700 shrink-0">
          {step === 1 && (
            <>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setStep(2);
                  setMetaIndex(0);
                }}
                disabled={seleccionados.length === 0}
              >
                Siguiente
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="ghost" onClick={irAAnteriorMeta}>
                Atrás
              </Button>
              <Button onClick={irASiguienteMeta}>Siguiente</Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(2);
                  setMetaIndex(Math.max(0, seleccionados.length - 1));
                }}
              >
                Atrás
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={finalizar}>
                  Configurar después
                </Button>
                <Button onClick={finalizar}>Guardar plan y empezar</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
