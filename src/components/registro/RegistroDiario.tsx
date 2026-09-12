import React, { useMemo, useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Field, Input, Textarea, Button, Badge, ProgressBar, Stat } from "@/components/ui/Primitives";
import { finSemana, formatoLargo, hoyISO, inicioSemana, sumarDias } from "@/lib/dates";
import type { AreaId, Gasto } from "@/types";
import { plantillaPorId } from "@/config/areaCatalog";
import { iconoDeHabito } from "@/config/habitIcons";
import { cumplimientoSemanalArea, nivelDesdePP } from "@/lib/formulas";
import { rachaDiariaVigente } from "@/lib/achievements";
import { CheckCircle2, Flame, Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";

function valoresVacios(areas: { id: AreaId }[]): Record<AreaId, number> {
  return Object.fromEntries(areas.map((a) => [a.id, 0]));
}

const PASO_POR_TIPO: Record<string, number> = {
  horas: 0.5,
  paginas: 5,
  minutos: 5,
  veces: 1,
};

const FRASES_EXITO = [
  "Buen trabajo hoy.",
  "Un día más, un paso más.",
  "Así se construye la racha.",
  "Kaizen: mejora sostenida, no perfección.",
];

function HabitoCard({
  area,
  valor,
  onCambiar,
}: {
  area: { id: AreaId; nombre: string; metrica: string; color: string };
  valor: number;
  onCambiar: (v: number) => void;
}) {
  const plantilla = plantillaPorId(area.id);
  const tipo = plantilla?.tipoMeta ?? "horas";
  const paso = PASO_POR_TIPO[tipo] ?? 1;
  const contestado = tipo !== "binaria" && tipo !== "conteo3" && valor > 0;
  const Icono = iconoDeHabito(area.id);

  return (
    <div
      className="rounded-2xl p-4 border transition-all duration-300"
      style={{
        borderColor: contestado ? `${area.color}66` : "rgba(255,255,255,0.06)",
        background: contestado ? `${area.color}14` : "rgba(255,255,255,0.02)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${area.color}26` }}
        >
          <Icono className="w-4 h-4" style={{ color: area.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-base-100 truncate">{area.nombre}</div>
          <div className="text-xs text-base-500 truncate">{area.metrica}</div>
        </div>
        {contestado && <CheckCircle2 className="w-4 h-4 shrink-0 animate-pop" style={{ color: area.color }} />}
      </div>

      {tipo === "binaria" && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onCambiar(1)}
            className={`h-11 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
              valor === 1 ? "text-white" : "bg-white/[0.04] text-base-400"
            }`}
            style={valor === 1 ? { background: area.color } : undefined}
          >
            Sí
          </button>
          <button
            onClick={() => onCambiar(0)}
            className={`h-11 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
              valor === 0 ? "bg-base-700 text-base-100" : "bg-white/[0.04] text-base-400"
            }`}
          >
            No
          </button>
        </div>
      )}

      {tipo === "conteo3" && (
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => onCambiar(n)}
              className={`h-11 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                valor === n ? "text-white" : "bg-white/[0.04] text-base-400"
              }`}
              style={valor === n ? { background: area.color } : undefined}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {(tipo === "horas" || tipo === "paginas" || tipo === "minutos" || tipo === "veces") && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onCambiar(Math.max(0, Math.round((valor - paso) * 100) / 100))}
            className="w-11 h-11 rounded-xl bg-white/[0.04] text-base-300 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-xl font-semibold tabular-nums">{valor || 0}</span>
          </div>
          <button
            onClick={() => onCambiar(Math.round((valor + paso) * 100) / 100)}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white active:scale-90 transition-transform"
            style={{ background: area.color }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
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
  const [confirmacion, setConfirmacion] = useState<string | null>(null);

  const cambiarFecha = (nueva: string) => {
    setFecha(nueva);
    const r = state.registrosDiarios.find((x) => x.fecha === nueva);
    setValores(r?.valores ?? valoresVacios(state.areas));
    setObservacion(r?.observacion ?? "");
  };

  const guardar = () => {
    registrarDia(fecha, valores, observacion.slice(0, 200));
    setConfirmacion(FRASES_EXITO[Math.floor(Math.random() * FRASES_EXITO.length)]);
    setTimeout(() => setConfirmacion(null), 2600);
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

  const nivel = nivelDesdePP(state.usuario.ppTotales, state.config);
  const inicio = inicioSemana(hoy);
  const fin = finSemana(hoy);
  const presupuestoMesActual = state.finanzas.presupuestos.find((p) => p.mes === hoy.slice(0, 7));

  return (
    <div className="space-y-6 relative">
      <SectionTitle title="Hábitos" subtitle="Menos de 5 minutos. Sin números de progreso a la vista." />

      <Card>
        <SectionTitle title="Progreso" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <Stat label="Nivel global" value={nivel.nivel} hint={`faltan ${nivel.faltante} PP`} />
          <Stat label="PP totales" value={state.usuario.ppTotales.toLocaleString()} />
          <Stat
            label="Racha diaria"
            value={
              <span className="inline-flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-400" /> {rachaDiariaVigente(state)}
              </span>
            }
          />
          <Stat
            label="Protecciones"
            value={
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-sky-400" /> {state.usuario.protecciones}
              </span>
            }
          />
        </div>
        <ProgressBar value={nivel.progresoPct} colorClass="bg-sky-500" height="h-2.5" />
        <div className="flex items-center justify-between text-xs text-base-500 mt-1.5 mb-5">
          <span>Nivel {nivel.nivel}</span>
          <span>Nivel {nivel.nivel + 1}</span>
        </div>
        <div className="space-y-3">
          {state.areas.map((a) => {
            const Icono = iconoDeHabito(a.id);
            const cumplimiento = cumplimientoSemanalArea(
              a,
              state.config,
              state.registrosDiarios,
              inicio,
              fin,
              state.finanzas.gastos,
              presupuestoMesActual
            );
            return (
              <div key={a.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-base-200 inline-flex items-center gap-1.5">
                    <Icono className="w-3.5 h-3.5" style={{ color: a.color }} />
                    {a.nombre} · Nv. {a.nivel}
                  </span>
                  <span className="text-base-500">
                    racha {a.semanasConsecutivas}/{state.config.economia.semanasParaNivelArea}
                  </span>
                </div>
                <ProgressBar value={cumplimiento} color={a.color} />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {ultimos7.map((d) => {
          const tieneRegistro = state.registrosDiarios.some((r) => r.fecha === d);
          const bloqueado = d < limiteAtras;
          return (
            <button
              key={d}
              disabled={bloqueado}
              onClick={() => cambiarFecha(d)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all disabled:opacity-30 ${
                d === fecha
                  ? "border-sky-500 bg-sky-500/15 text-sky-300 scale-105"
                  : "border-white/10 text-base-400 hover:text-base-100"
              }`}
            >
              {d === hoy ? "Hoy" : formatoLargo(d).split(" de ")[0]}
              {tieneRegistro && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 align-middle" />}
            </button>
          );
        })}
      </div>

      {state.areas.length === 0 ? (
        <Card>
          <div className="text-sm text-base-500">
            Aún no tienes hábitos activos. Ve al Panel → "Planear el mes" para elegirlos.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {state.areas.map((area) => (
            <HabitoCard
              key={area.id}
              area={area}
              valor={valores[area.id] ?? 0}
              onCambiar={(v) => setValores((prev) => ({ ...prev, [area.id]: v }))}
            />
          ))}
        </div>
      )}

      <Card>
        <Field label="Observación breve" hint={`${observacion.length}/200`}>
          <Textarea
            maxLength={200}
            rows={2}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="¿Algo que valga la pena recordar de hoy?"
          />
        </Field>

        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="text-xs uppercase tracking-wide text-base-400 mb-3">Gastos del día</div>
          {gastosDelDia.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {gastosDelDia.map((g) => (
                <li key={g.id} className="flex items-center justify-between text-sm bg-white/[0.04] rounded-xl px-3 py-2">
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
                className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm"
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

      {confirmacion && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-40 animate-pop">
          <div className="bg-sky-500 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_12px_28px_-8px_rgba(59,130,246,0.7)] border border-white/10">
            {confirmacion}
          </div>
        </div>
      )}
    </div>
  );
}
