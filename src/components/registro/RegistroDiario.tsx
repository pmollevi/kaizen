import React, { useMemo, useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Field, Input, Textarea, Button, Badge } from "@/components/ui/Primitives";
import { formatoLargo, hoyISO, sumarDias } from "@/lib/dates";
import type { AreaId, Gasto } from "@/types";
import { plantillaPorId } from "@/config/areaCatalog";
import { Plus, Trash2 } from "lucide-react";

function valoresVacios(areas: { id: AreaId }[]): Record<AreaId, number> {
  return Object.fromEntries(areas.map((a) => [a.id, 0]));
}

export function RegistroDiarioView() {
  const state = useKaizenStore();
  const registrarDia = useKaizenStore((s) => s.registrarDia);
  const agregarGasto = useKaizenStore((s) => s.agregarGasto);
  const eliminarGasto = useKaizenStore((s) => s.eliminarGasto);

  const hoy = hoyISO();
  const limiteAtras = sumarDias(hoy, -state.config.economia.diasRegistroRetroactivo);
  const [fecha, setFecha] = useState(hoy);

  const registroExistente = state.registrosDiarios.find((r) => r.fecha === fecha);
  const [valores, setValores] = useState<Record<AreaId, number>>(
    registroExistente?.valores ?? valoresVacios(state.areas)
  );
  const [observacion, setObservacion] = useState(registroExistente?.observacion ?? "");

  const cambiarFecha = (nueva: string) => {
    setFecha(nueva);
    const r = state.registrosDiarios.find((x) => x.fecha === nueva);
    setValores(r?.valores ?? valoresVacios(state.areas));
    setObservacion(r?.observacion ?? "");
  };

  const guardar = () => {
    registrarDia(fecha, valores, observacion.slice(0, 200));
  };

  const gastosDelDia = state.finanzas.gastos.filter((g) => g.fecha === fecha);
  const [montoGasto, setMontoGasto] = useState("");
  const [categoriaGasto, setCategoriaGasto] = useState("");
  const [palabraGasto, setPalabraGasto] = useState("");
  const presupuestoMes = state.finanzas.presupuestos.find((p) => p.mes === fecha.slice(0, 7));

  const agregarGastoDelDia = () => {
    const monto = parseFloat(montoGasto);
    if (!monto || monto <= 0 || !categoriaGasto || !palabraGasto.trim()) return;
    agregarGasto({ fecha, monto, categoriaId: categoriaGasto, palabraClave: palabraGasto.trim() } as Omit<Gasto, "id">);
    setMontoGasto("");
    setPalabraGasto("");
  };

  const ultimos7 = useMemo(() => {
    const dias: string[] = [];
    for (let i = 0; i < 7; i++) dias.push(sumarDias(hoy, -i));
    return dias;
  }, [hoy]);

  return (
    <div className="space-y-6">
      <SectionTitle title="Registro diario" subtitle="Menos de 5 minutos. Sin números de progreso a la vista." />

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {ultimos7.map((d) => {
          const tieneRegistro = state.registrosDiarios.some((r) => r.fecha === d);
          const bloqueado = d < limiteAtras;
          return (
            <button
              key={d}
              disabled={bloqueado}
              onClick={() => cambiarFecha(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors disabled:opacity-30 ${
                d === fecha
                  ? "border-sky-600 bg-sky-600/10 text-sky-400"
                  : "border-base-800 text-base-400 hover:text-base-100"
              }`}
            >
              {d === hoy ? "Hoy" : formatoLargo(d).split(" de ")[0]}
              {tieneRegistro && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 align-middle" />}
            </button>
          );
        })}
      </div>

      <Card>
        {state.areas.length === 0 ? (
          <div className="text-sm text-base-500">
            Aún no tienes hábitos activos. Ve a Configuración → "Planear el mes" para elegirlos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {state.areas.map((area) => {
              const plantilla = plantillaPorId(area.id);
              const tipo = plantilla?.tipoMeta ?? "horas";
              const label = `${area.nombre} — ${area.metrica}`;
              if (tipo === "binaria") {
                return (
                  <Field key={area.id} label={label}>
                    <div className="flex gap-2">
                      <Button
                        variant={valores[area.id] === 1 ? "primary" : "secondary"}
                        onClick={() => setValores((v) => ({ ...v, [area.id]: 1 }))}
                      >
                        Sí
                      </Button>
                      <Button
                        variant={valores[area.id] === 0 ? "primary" : "secondary"}
                        onClick={() => setValores((v) => ({ ...v, [area.id]: 0 }))}
                      >
                        No
                      </Button>
                    </div>
                  </Field>
                );
              }
              if (tipo === "conteo3") {
                return (
                  <Field key={area.id} label={label}>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3].map((n) => (
                        <button
                          key={n}
                          onClick={() => setValores((v) => ({ ...v, [area.id]: n }))}
                          className={`w-10 h-10 rounded-lg text-sm font-medium border transition-colors ${
                            valores[area.id] === n
                              ? "border-sky-600 bg-sky-600/10 text-sky-400"
                              : "border-base-800 text-base-400"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </Field>
                );
              }
              return (
                <Field key={area.id} label={label}>
                  <Input
                    type="number"
                    min={0}
                    step={tipo === "horas" ? 0.25 : 1}
                    inputMode="decimal"
                    value={valores[area.id] || ""}
                    onChange={(e) => setValores((v) => ({ ...v, [area.id]: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </Field>
              );
            })}
          </div>
        )}

        <div className="mt-5">
          <Field label="Observación breve" hint={`${observacion.length}/200`}>
            <Textarea
              maxLength={200}
              rows={2}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="¿Algo que valga la pena recordar de hoy?"
            />
          </Field>
        </div>

        <div className="mt-6 border-t border-base-800 pt-5">
          <div className="text-xs uppercase tracking-wide text-base-400 mb-3">Gastos del día</div>
          {gastosDelDia.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {gastosDelDia.map((g) => (
                <li key={g.id} className="flex items-center justify-between text-sm bg-base-850 rounded-lg px-3 py-2">
                  <span className="text-base-300">{g.palabraClave}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${g.monto.toLocaleString()}</span>
                    <button onClick={() => eliminarGasto(g.id)} className="text-base-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {presupuestoMes ? (
            <div className="flex flex-wrap gap-2">
              <Input
                className="w-28"
                type="number"
                inputMode="decimal"
                placeholder="Monto"
                value={montoGasto}
                onChange={(e) => setMontoGasto(e.target.value)}
              />
              <select
                className="bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm"
                value={categoriaGasto}
                onChange={(e) => setCategoriaGasto(e.target.value)}
              >
                <option value="">Categoría</option>
                {presupuestoMes.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <Input
                className="w-36"
                placeholder="Palabra clave"
                value={palabraGasto}
                onChange={(e) => setPalabraGasto(e.target.value)}
              />
              <Button variant="secondary" onClick={agregarGastoDelDia} className="inline-flex items-center gap-1">
                <Plus className="w-4 h-4" /> Agregar
              </Button>
            </div>
          ) : (
            <div className="text-sm text-base-500">Configura el presupuesto de este mes en Finanzas para registrar gastos.</div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {fecha < limiteAtras ? (
            <Badge tone="red">Fuera de la ventana de registro retroactivo</Badge>
          ) : (
            <span className="text-xs text-base-500">Puedes registrar hasta {state.config.economia.diasRegistroRetroactivo} días atrás.</span>
          )}
          <Button onClick={guardar} disabled={fecha < limiteAtras}>
            {registroExistente ? "Actualizar registro" : "Guardar registro"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
