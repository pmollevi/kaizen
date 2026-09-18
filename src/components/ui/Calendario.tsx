import React, { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { ProgressBar, EmptyState } from "@/components/ui/Primitives";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { iconoDeHabito } from "@/config/habitIcons";
import { colorPorNivel } from "@/lib/color";
import { cumplimientoDiario, distribucionCategorias } from "@/lib/formulas";
import { diaDelMes, diasDelMes, formatoLargo, formatoMes, hoyISO, mesAnterior, mesDe, mesSiguiente, parseISO } from "@/lib/dates";
import { GraficaCategoriasPastel } from "@/components/finanzas/charts/FinanzasCharts";

/** Detalle completo de un día: gastos (con gráfica de pastel) y hábitos registrados. */
function DiaDetalleModal({ fecha, onCerrar }: { fecha: string; onCerrar: () => void }) {
  const state = useKaizenStore();
  useBodyScrollLock(true);

  const registro = state.registrosDiarios.find((r) => r.fecha === fecha);
  const gastosDelDia = state.finanzas.gastos.filter((g) => g.fecha === fecha);
  const totalDia = gastosDelDia.reduce((acc, g) => acc + g.monto, 0);
  const categoriasDelDia = distribucionCategorias(gastosDelDia, state.finanzas.categorias, fecha, fecha);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60" onClick={onCerrar}>
      <div
        className="bg-base-900 border border-base-700 rounded-2xl shadow-soft max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold capitalize">{formatoLargo(fecha)}</h3>
          <button onClick={onCerrar} className="text-base-400 hover:text-base-100" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <div className="text-xs uppercase tracking-wide text-finanzas-400 font-medium mb-2">Gastos del día</div>
            {gastosDelDia.length === 0 ? (
              <EmptyState text="Sin gastos registrados este día." />
            ) : (
              <>
                <div className="text-2xl font-semibold text-base-100 mb-3">${totalDia.toLocaleString()}</div>
                <GraficaCategoriasPastel datos={categoriasDelDia} />
              </>
            )}
          </div>

          <div className="pt-5 border-t border-base-700">
            <div className="text-xs uppercase tracking-wide text-habitos-400 font-medium mb-2">Hábitos registrados</div>
            {!registro || state.areas.length === 0 ? (
              <EmptyState text="Sin registro de hábitos este día." />
            ) : (
              <div className="space-y-3">
                {state.areas.map((a) => {
                  const Icono = iconoDeHabito(a.id);
                  const valor = registro.valores[a.id] ?? 0;
                  const cumplimiento = cumplimientoDiario(a, state.config, valor);
                  const color = colorPorNivel(a.color, a.nivel);
                  return (
                    <div key={a.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}26` }}>
                        <Icono className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-base-200 truncate">{a.nombre}</span>
                          <span className="text-base-400 shrink-0">{valor}</span>
                        </div>
                        {cumplimiento !== null && <ProgressBar value={cumplimiento} color={color} />}
                        {a.id === "gratitud" && registro.notaGratitud && (
                          <p className="text-xs text-base-400 italic mt-1">"{registro.notaGratitud}"</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {registro.observacion && <p className="text-sm text-base-400 italic pt-1">"{registro.observacion}"</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

/** Calendario completo del mes: cada día muestra dos puntitos (hábitos / finanzas) y al tocarlo abre su detalle. */
function CalendarioMensualModal({
  mesInicial,
  onCerrar,
}: {
  mesInicial: string;
  onCerrar: () => void;
}) {
  const state = useKaizenStore();
  const [mes, setMes] = useState(mesInicial);
  const [diaDetalle, setDiaDetalle] = useState<string | null>(null);
  useBodyScrollLock(true);
  const hoy = hoyISO();

  const diasConHabitos = useMemo(() => new Set(state.registrosDiarios.map((r) => r.fecha)), [state.registrosDiarios]);
  const diasConGasto = useMemo(() => new Set(state.finanzas.gastos.map((g) => g.fecha)), [state.finanzas.gastos]);

  const totalDias = diasDelMes(mes);
  const dowPrimerDia = parseISO(`${mes}-01`).getDay();
  const offsetInicial = dowPrimerDia === 0 ? 6 : dowPrimerDia - 1;

  const celdas: (string | null)[] = [];
  for (let i = 0; i < offsetInicial; i++) celdas.push(null);
  for (let d = 1; d <= totalDias; d++) celdas.push(`${mes}-${String(d).padStart(2, "0")}`);

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60" onClick={onCerrar}>
        <div
          className="bg-base-900 border border-base-700 rounded-2xl shadow-soft max-w-sm w-full p-5 animate-pop"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setMes(mesAnterior(mes))}
              aria-label="Mes anterior"
              className="w-8 h-8 rounded-lg text-base-400 hover:text-base-100 hover:bg-base-850 flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-semibold capitalize">{formatoMes(mes)}</h3>
            <button
              onClick={() => setMes(mesSiguiente(mes))}
              aria-label="Mes siguiente"
              className="w-8 h-8 rounded-lg text-base-400 hover:text-base-100 hover:bg-base-850 flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-base-500 mb-1.5 uppercase tracking-wide">
            {DIAS_SEMANA.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {celdas.map((fecha, i) => {
              if (!fecha) return <div key={`vacio-${i}`} />;
              const esHoy = fecha === hoy;
              const tieneHabitos = diasConHabitos.has(fecha);
              const tieneGasto = diasConGasto.has(fecha);
              return (
                <button
                  key={fecha}
                  onClick={() => setDiaDetalle(fecha)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                    esHoy ? "bg-kaizen-500/15 text-kaizen-300 border border-kaizen-500/40" : "text-base-300 hover:bg-base-850"
                  }`}
                >
                  <span>{diaDelMes(fecha)}</span>
                  <span className="flex items-center gap-0.5">
                    <span className={`w-1 h-1 rounded-full ${tieneHabitos ? "bg-habitos-400" : "bg-base-700"}`} />
                    <span className={`w-1 h-1 rounded-full ${tieneGasto ? "bg-finanzas-400" : "bg-base-700"}`} />
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-base-700 text-[11px] text-base-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-habitos-400" /> Hábitos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-finanzas-400" /> Finanzas
            </span>
          </div>
        </div>
      </div>
      {diaDetalle && <DiaDetalleModal fecha={diaDetalle} onCerrar={() => setDiaDetalle(null)} />}
    </>
  );
}

/**
 * Fila delgada: días recientes + botón de calendario. El botón siempre queda
 * fijo a la derecha, fuera del área con scroll horizontal, para que nunca se
 * desplace fuera de vista junto con los chips de día.
 *
 * `alElegirDia`: qué pasa al tocar un chip de día (ej. cambiar la fecha activa
 * de un formulario). Tocar un día del calendario completo, en cambio, siempre
 * abre su detalle (gráfico de gastos y hábitos) — eso no cambia según el uso.
 */
export function SelectorDiasYCalendario({
  dias,
  fechaActiva,
  alElegirDia,
  deshabilitarAntes,
}: {
  dias: string[];
  fechaActiva: string;
  alElegirDia: (fecha: string) => void;
  deshabilitarAntes?: string;
}) {
  const state = useKaizenStore();
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const hoy = hoyISO();
  const diasConHabitos = useMemo(() => new Set(state.registrosDiarios.map((r) => r.fecha)), [state.registrosDiarios]);

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar flex-1 min-w-0 py-1 px-0.5">
          {dias.map((d) => {
            const bloqueado = deshabilitarAntes ? d < deshabilitarAntes : false;
            return (
              <button
                key={d}
                disabled={bloqueado}
                onClick={() => alElegirDia(d)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all disabled:opacity-30 ${
                  d === fechaActiva
                    ? "border-habitos-500/50 bg-habitos-500/10 text-habitos-300 scale-105"
                    : "border-base-700 text-base-400 hover:text-base-100"
                }`}
              >
                {d === hoy ? "Hoy" : formatoLargo(d).split(" de ")[0]}
                {diasConHabitos.has(d) && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 align-middle" />}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setCalendarioAbierto(true)}
          aria-label="Abrir calendario del mes"
          className="shrink-0 w-9 h-9 rounded-full border border-base-700 text-base-400 hover:text-base-100 hover:bg-base-850 flex items-center justify-center transition-colors"
        >
          <CalendarDays className="w-4 h-4" />
        </button>
      </div>

      {calendarioAbierto && (
        <CalendarioMensualModal mesInicial={mesDe(fechaActiva || hoy)} onCerrar={() => setCalendarioAbierto(false)} />
      )}
    </>
  );
}

/** Igual que `SelectorDiasYCalendario`, pero tocar un chip también abre el detalle del día en vez de solo seleccionarlo — para usarse fuera de un formulario (ej. el Panel). */
export function SelectorDiasConDetalle({ dias, fechaActiva }: { dias: string[]; fechaActiva: string }) {
  const [diaDetalle, setDiaDetalle] = useState<string | null>(null);
  return (
    <>
      <SelectorDiasYCalendario dias={dias} fechaActiva={fechaActiva} alElegirDia={setDiaDetalle} />
      {diaDetalle && <DiaDetalleModal fecha={diaDetalle} onCerrar={() => setDiaDetalle(null)} />}
    </>
  );
}
