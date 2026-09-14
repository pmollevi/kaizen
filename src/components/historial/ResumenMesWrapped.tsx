import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Button } from "@/components/ui/Primitives";
import { mejorRachaEnMes } from "@/lib/achievements";
import { formatoMes, hoyISO, mesAnterior, mesDe } from "@/lib/dates";
import { Copy, Check } from "lucide-react";

// Flourish abstracto de línea (trazo ascendente tipo tinta) — nunca mascota ni
// ilustración cartoon, solo un gesto gráfico ligado al concepto de progreso.
function TrazoAscendente() {
  return (
    <svg viewBox="0 0 160 60" className="absolute right-4 top-4 w-28 h-11 opacity-[0.14]" aria-hidden="true">
      <polyline
        points="2,54 30,44 55,48 80,26 105,32 130,10 158,4"
        fill="none"
        stroke="#D4BC7C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * El único lugar del sistema donde es intencional salirse del tono sobrio:
 * un resumen puntual, de un mes ya cerrado, pensado para leerse de un vistazo
 * y compartirse — no la experiencia por defecto del resto de la app.
 */
export function ResumenMesWrapped() {
  const state = useKaizenStore();
  const mes = mesAnterior(mesDe(hoyISO()));
  const cierresDelMes = state.cierresSemanales.filter((c) => mesDe(c.semanaFin) === mes);
  const [copiado, setCopiado] = useState(false);

  if (cierresDelMes.length === 0) return null;

  const ppDelMes = cierresDelMes.reduce((acc, c) => acc + c.ppGanados, 0);
  const cumplimientoPromedio = cierresDelMes.reduce((acc, c) => acc + c.cumplimientoGlobal, 0) / cierresDelMes.length;
  const nivelesSubidos = cierresDelMes.reduce((acc, c) => acc + c.nivelesAreaSubidos.length, 0);
  const mejorRacha = mejorRachaEnMes(state, mes);
  const logrosDelMes = state.historial.reconocimientos
    .filter((r) => mesDe(r.fecha) === mes)
    .map((r) => state.config.catalogoReconocimientos.find((c) => c.id === r.id))
    .filter((c): c is NonNullable<typeof c> => !!c && !c.secreto);

  const copiarResumen = () => {
    const texto = [
      `Origo — Resumen de ${formatoMes(mes)}`,
      `${ppDelMes.toLocaleString()} PP ganados · ${Math.round(cumplimientoPromedio * 100)}% de cumplimiento promedio`,
      `Mejor racha del mes: ${mejorRacha} ${mejorRacha === 1 ? "día" : "días"}`,
      nivelesSubidos > 0 ? `${nivelesSubidos} ${nivelesSubidos === 1 ? "área subió" : "áreas subieron"} de nivel` : null,
      logrosDelMes.length > 0 ? `Logros: ${logrosDelMes.map((l) => l.nombre).join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard?.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2200);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold-500/30 bg-gradient-to-br from-base-900 to-base-850 p-6 shadow-card">
      <TrazoAscendente />
      <div className="relative">
        <div className="text-xs uppercase tracking-wider text-gold-400 font-medium mb-1">Resumen de {formatoMes(mes)}</div>
        <div className="text-3xl font-semibold tracking-tight text-base-100">{ppDelMes.toLocaleString()} PP</div>
        <div className="text-sm text-base-400 mt-0.5">{Math.round(cumplimientoPromedio * 100)}% de cumplimiento promedio</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-base-700/60">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-base-500 font-medium">Mejor racha</div>
            <div className="text-xl font-semibold text-base-100 mt-1">
              {mejorRacha} {mejorRacha === 1 ? "día" : "días"}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-base-500 font-medium">Niveles subidos</div>
            <div className="text-xl font-semibold text-base-100 mt-1">{nivelesSubidos}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-base-500 font-medium">Logros</div>
            <div className="text-xl font-semibold text-base-100 mt-1">{logrosDelMes.length}</div>
          </div>
        </div>

        {logrosDelMes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {logrosDelMes.map((l) => (
              <span key={l.id} className="px-2.5 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-400 border border-gold-500/20">
                {l.nombre}
              </span>
            ))}
          </div>
        )}

        <Button variant="secondary" onClick={copiarResumen} className="mt-5 inline-flex items-center gap-1.5">
          {copiado ? <Check className="w-4 h-4 text-kaizen-400" /> : <Copy className="w-4 h-4" />}
          {copiado ? "Copiado" : "Copiar resumen"}
        </Button>
      </div>
    </div>
  );
}
