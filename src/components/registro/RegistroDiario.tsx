import React, { useEffect, useMemo, useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Field, Input, Textarea, Button, Badge, ProgressBar, Stat, InfoTip, useCountUp } from "@/components/ui/Primitives";
import { finSemana, hoyISO, inicioSemana, sumarDias } from "@/lib/dates";
import type { AreaId, Gasto } from "@/types";
import { plantillaPorId } from "@/config/areaCatalog";
import { iconoDeHabito } from "@/config/habitIcons";
import { cumplimientoSemanalArea, nivelDesdePP } from "@/lib/formulas";
import { HITOS_RACHA, rachaDiariaVigente } from "@/lib/achievements";
import { COLOR_SECCION, colorPorNivel } from "@/lib/color";
import { celebrarHito } from "@/lib/notificaciones";
import { SelectorDiasYCalendario } from "@/components/ui/Calendario";
import { CheckCircle2, Flame, Minus, Plus, ShieldCheck, Trash2, Trophy } from "lucide-react";

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
  "Origo: constancia, no perfección.",
];

function HabitoCard({
  area,
  valor,
  onCambiar,
}: {
  area: { id: AreaId; nombre: string; metrica: string; color: string; nivel: number };
  valor: number;
  onCambiar: (v: number) => void;
}) {
  const plantilla = plantillaPorId(area.id);
  const tipo = plantilla?.tipoMeta ?? "horas";
  const paso = PASO_POR_TIPO[tipo] ?? 1;
  const contestado = tipo !== "binaria" && tipo !== "conteo3" && valor > 0;
  const Icono = iconoDeHabito(area.id);
  const color = colorPorNivel(area.color, area.nivel);
  const valorMostrado = useCountUp(valor);

  // Rebote corto y sutil (120ms) al marcar/ajustar el hábito — feedback
  // instantáneo sin distraer ni interrumpir el resto de la interacción.
  const [flash, setFlash] = useState(false);
  const marcar = (v: number) => {
    onCambiar(v);
    setFlash(true);
    setTimeout(() => setFlash(false), 120);
  };

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-300 ${flash ? "animate-tap" : ""}`}
      style={{
        borderColor: contestado ? `${color}88` : `${color}4a`,
        background: contestado ? `${color}26` : `${color}16`,
      }}
    >
      <div className="flex items-start gap-2.5 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}26` }}
        >
          <Icono className="w-4 h-4" style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-base-100 truncate">{area.nombre}</div>
          <div className="text-sm text-base-400 leading-snug mt-0.5 whitespace-pre-line break-words">
            {plantilla?.descripcion ?? area.metrica}
          </div>
        </div>
        {contestado && <CheckCircle2 className="w-4 h-4 shrink-0 animate-pop mt-0.5" style={{ color }} />}
      </div>

      {tipo === "binaria" && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => marcar(1)}
            className={`h-11 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
              valor === 1 ? "text-base-100" : "bg-base-850 text-base-400"
            }`}
            style={valor === 1 ? { background: color } : undefined}
          >
            Sí
          </button>
          <button
            onClick={() => marcar(0)}
            className={`h-11 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
              valor === 0 ? "bg-base-700 text-base-100" : "bg-base-850 text-base-400"
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
              onClick={() => marcar(n)}
              className={`h-11 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                valor === n ? "text-base-100" : "bg-base-850 text-base-400"
              }`}
              style={valor === n ? { background: color } : undefined}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {(tipo === "horas" || tipo === "paginas" || tipo === "minutos" || tipo === "veces") && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => marcar(Math.max(0, Math.round((valor - paso) * 100) / 100))}
            className="w-11 h-11 rounded-xl bg-base-850 text-base-300 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-xl font-semibold tabular-nums">{valorMostrado || 0}</span>
          </div>
          <button
            onClick={() => marcar(Math.round((valor + paso) * 100) / 100)}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white active:scale-90 transition-transform"
            style={{ background: color }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function RegistroDiarioView({
  autoScrollAlFormulario = false,
  onAutoScrollConsumido,
}: {
  autoScrollAlFormulario?: boolean;
  onAutoScrollConsumido?: () => void;
}) {
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
  const [hitoCelebrado, setHitoCelebrado] = useState<(typeof HITOS_RACHA)[number] | null>(null);

  const cambiarFecha = (nueva: string) => {
    setFecha(nueva);
    const r = state.registrosDiarios.find((x) => x.fecha === nueva);
    setValores(r?.valores ?? valoresVacios(state.areas));
    setObservacion(r?.observacion ?? "");
  };

  const guardar = () => {
    const antes = new Set(useKaizenStore.getState().historial.reconocimientos.map((r) => r.id));
    registrarDia(fecha, valores, observacion.slice(0, 200));
    const despues = useKaizenStore.getState().historial.reconocimientos;
    const hito = HITOS_RACHA.find((h) => !antes.has(h.id) && despues.some((r) => r.id === h.id));
    if (hito) {
      setHitoCelebrado(hito);
      celebrarHito(hito.titulo, `Racha de ${hito.dias} días — nuevo título activo.`);
      setTimeout(() => setHitoCelebrado(null), 3400);
    } else {
      setConfirmacion(FRASES_EXITO[Math.floor(Math.random() * FRASES_EXITO.length)]);
      setTimeout(() => setConfirmacion(null), 2600);
    }
  };

  const gastosDelDia = state.finanzas.gastos.filter((g) => g.fecha === fecha);
  const [montoGasto, setMontoGasto] = useState("");
  const [categoriaGasto, setCategoriaGasto] = useState("");
  const [palabraGasto, setPalabraGasto] = useState("");

  const agregarGastoDelDia = () => {
    const monto = parseFloat(montoGasto);
    if (!monto || monto <= 0 || !categoriaGasto || !palabraGasto.trim()) return;
    agregarGasto({ fecha, monto, categoriaId: categoriaGasto, palabraClave: palabraGasto.trim(), metodo: "efectivo" } as Omit<Gasto, "id">);
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
  const racha = rachaDiariaVigente(state);
  const rachaMostrada = useCountUp(racha);
  const ppMostrados = useCountUp(state.usuario.ppTotales);

  // Solo cuando se llega aquí desde el botón "Registrar el día" del Panel
  // (autoScrollAlFormulario) se hace scroll directo al formulario — entrar a
  // Hábitos por el menú/nav debe abrir arriba, como cualquier otra pestaña.
  useEffect(() => {
    if (!autoScrollAlFormulario) return;
    const t = setTimeout(() => {
      document.getElementById("registro-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      onAutoScrollConsumido?.();
    }, 80);
    return () => clearTimeout(t);
  }, [autoScrollAlFormulario]);

  return (
    <div className="space-y-6 relative">
      <SectionTitle title="Hábitos" subtitle="Menos de 5 minutos. Sin números de progreso a la vista." accent={COLOR_SECCION.habitos} />

      <Card className="border-habitos-500/35 bg-habitos-500/[0.08]">
        <SectionTitle title="Progreso" accent={COLOR_SECCION.habitos} />
        <div className="flex items-center gap-3 sm:gap-4 mb-5 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 px-4 py-3">
          <Flame className={`w-8 h-8 sm:w-9 sm:h-9 text-amber-400 shrink-0 ${racha > 0 ? "animate-flicker" : ""}`} />
          <div>
            <div className="text-4xl sm:text-5xl font-bold tabular-nums text-base-100 leading-none">{rachaMostrada}</div>
            <div className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold mt-1">
              {racha === 1 ? "día de racha" : "días de racha"}
            </div>
            {racha === 0 && state.registrosDiarios.length > 0 && (
              <div className="text-xs text-base-500 mt-1">Se pausó, no se borró. Hoy es buen día para reiniciarla.</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <Stat label="Nivel global" value={nivel.nivel} hint={`${Math.round(nivel.progresoPct * 100)}% al siguiente nivel`} />
          <Stat
            label={
              <span className="inline-flex items-center gap-1">
                PP totales <InfoTip text="Puntos de Progreso: subes de nivel acumulándolos cada semana según tu cumplimiento." />
              </span>
            }
            value={ppMostrados.toLocaleString()}
          />
          <Stat
            label={
              <span className="inline-flex items-center gap-1">
                Protecciones <InfoTip text="Escudos que cubren una semana floja sin romper tu racha. Se ganan acumulando días seguidos de constancia." />
              </span>
            }
            value={
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-kaizen-400" /> {state.usuario.protecciones}
              </span>
            }
          />
        </div>
        <ProgressBar value={nivel.progresoPct} colorClass="bg-kaizen-500" height="h-1.5" />
        <div className="flex items-center justify-between text-xs text-base-500 mt-1.5 mb-5">
          <span>Nivel {nivel.nivel}</span>
          <span>Nivel {nivel.nivel + 1}</span>
        </div>
        <div className="space-y-3">
          {state.areas.map((a) => {
            const Icono = iconoDeHabito(a.id);
            const cumplimiento = cumplimientoSemanalArea(a, state.config, state.registrosDiarios, inicio, fin);
            const color = colorPorNivel(a.color, a.nivel);
            return (
              <div key={a.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-base-200 inline-flex items-center gap-1.5">
                    <Icono className="w-3.5 h-3.5" style={{ color }} />
                    {a.nombre} · Nv. {a.nivel}
                  </span>
                  <span className="text-base-500">
                    racha {a.semanasConsecutivas}/{state.config.economia.semanasParaNivelArea}
                  </span>
                </div>
                <ProgressBar value={cumplimiento} color={color} />
              </div>
            );
          })}
        </div>
      </Card>

      <div id="registro-form" className="scroll-mt-4">
        <SelectorDiasYCalendario dias={ultimos7} fechaActiva={fecha} alElegirDia={cambiarFecha} deshabilitarAntes={limiteAtras} />
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

        <div className="mt-6 border-t border-base-700 pt-5">
          <div className="text-xs uppercase tracking-wide text-base-400 mb-3">Gastos del día</div>
          {gastosDelDia.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {gastosDelDia.map((g) => (
                <li key={g.id} className="flex items-center justify-between text-sm bg-base-850 rounded-xl px-3 py-2">
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
          {state.finanzas.categorias.length > 0 ? (
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
                className="bg-base-850 border border-base-700 rounded-xl px-3 py-2 text-base sm:text-sm"
                value={categoriaGasto}
                onChange={(e) => setCategoriaGasto(e.target.value)}
              >
                <option value="">Categoría</option>
                {state.finanzas.categorias.map((c) => (
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
            <div className="text-sm text-base-500">Agrega una categoría de gasto en Finanzas para registrar gastos.</div>
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
          <div className="relative overflow-hidden bg-base-900 text-base-100 text-sm font-medium px-5 py-3 rounded-2xl shadow-soft border border-habitos-500/40 min-w-[200px] text-center">
            <span className="relative z-10">{confirmacion}</span>
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-habitos-500 animate-toast-fill" />
          </div>
        </div>
      )}

      {hitoCelebrado && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-40 animate-pop">
          <div className="flex items-center gap-2.5 bg-base-900 text-base-100 text-sm px-5 py-3 rounded-2xl shadow-soft border border-gold-500/40">
            <Trophy className="w-4 h-4 text-gold-400 shrink-0" />
            <span>
              <span className="font-semibold text-gold-400">{hitoCelebrado.titulo}.</span> Racha de {hitoCelebrado.dias} días — nuevo título activo.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
