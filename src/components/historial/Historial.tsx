import React from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Badge, EmptyState, Stat } from "@/components/ui/Primitives";
import { ResumenMesWrapped } from "@/components/historial/ResumenMesWrapped";
import { formatoLargo } from "@/lib/dates";

export function HistorialView() {
  const state = useKaizenStore();
  const h = state.historial;
  const legendarios = h.reconocimientos
    .map((r) => ({ ...r, def: state.config.catalogoReconocimientos.find((c) => c.id === r.id) }))
    .filter((r) => r.def?.rareza === "Legendario");

  return (
    <div className="space-y-5">
      <SectionTitle title={state.config.textos.salonFama} subtitle="Nada se borra jamás." />

      <ResumenMesWrapped />

      <Card>
        <SectionTitle title="Temporadas completadas" />
        {h.temporadas.length === 0 ? (
          <EmptyState text="Aún no cierras ninguna temporada." />
        ) : (
          <div className="space-y-3">
            {h.temporadas.map((t) => (
              <div key={t.id} className="bg-white/[0.04] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{t.nombre}</div>
                  <Badge tone={t.retoFinalCompletado ? "green" : "neutral"}>
                    {t.retoFinalCompletado ? "Reto final superado" : "Sin reto final"}
                  </Badge>
                </div>
                <div className="text-xs text-base-500 mb-3">
                  {formatoLargo(t.inicio)} – {formatoLargo(t.fin)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Stat label="PP totales" value={t.ppTotales.toLocaleString()} />
                  <Stat label="Reconocimientos" value={t.reconocimientosObtenidos} />
                  <Stat label="Gastado en la temporada" value={`$${t.gastoTotalTemporada.toLocaleString()}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="Niveles máximos por área" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {state.areas.map((a) => (
            <Stat key={a.id} label={a.nombre} value={h.nivelesMaximos[a.id] ?? a.nivel} />
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Reconocimientos legendarios" />
        {legendarios.length === 0 ? (
          <EmptyState text="Todavía ninguno." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {legendarios.map((r) => (
              <Badge key={r.id} tone="yellow">
                {r.def?.nombre}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="Récords históricos" />
        {h.records.length === 0 ? (
          <EmptyState text="Sin récords registrados." />
        ) : (
          <ul className="divide-y divide-base-800">
            {h.records.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-base-300">{r.descripcion}</span>
                <span className="text-base-500">
                  {r.valor} · {formatoLargo(r.fecha)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
