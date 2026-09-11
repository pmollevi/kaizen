import React from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Badge, EmptyState } from "@/components/ui/Primitives";
import { formatoLargo } from "@/lib/dates";
import { Lock, Star } from "lucide-react";

const rarezaTone: Record<string, "neutral" | "blue" | "green" | "yellow"> = {
  Común: "neutral",
  Raro: "blue",
  Épico: "green",
  Legendario: "yellow",
};

export function ReconocimientosView() {
  const state = useKaizenStore();
  const desbloqueados = new Map(state.historial.reconocimientos.map((r) => [r.id, r.fecha]));
  const tituloActivo = state.usuario.tituloActivo;
  const setTituloActivo = useKaizenStore((s) => s.setTituloActivo);

  return (
    <div className="space-y-5">
      <SectionTitle title={state.config.textos.logros} subtitle="Los secretos solo se revelan al desbloquearse." />

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {state.config.catalogoReconocimientos.map((r) => {
            const desbloqueado = desbloqueados.has(r.id);
            const oculto = r.secreto && !desbloqueado;
            return (
              <div
                key={r.id}
                className={`rounded-lg p-4 border ${desbloqueado ? "bg-white/[0.04] border-white/10" : "bg-base-900 border-white/10 opacity-60"}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-medium flex items-center gap-1.5">
                    {desbloqueado ? <Star className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4 text-base-600" />}
                    {oculto ? "???" : r.nombre}
                  </div>
                  <Badge tone={rarezaTone[r.rareza]}>{r.rareza}</Badge>
                </div>
                <div className="text-sm text-base-400">{oculto ? "Reconocimiento secreto." : r.descripcion}</div>
                {desbloqueado && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-base-500">Desbloqueado el {formatoLargo(desbloqueados.get(r.id)!)}</div>
                    <button
                      onClick={() => setTituloActivo(tituloActivo === r.id ? null : r.id)}
                      className={`text-xs font-medium ${tituloActivo === r.id ? "text-sky-400" : "text-base-500 hover:text-base-300"}`}
                    >
                      {tituloActivo === r.id ? "Título activo" : "Usar como título"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {state.config.catalogoReconocimientos.length === 0 && <EmptyState text="Catálogo vacío." />}
      </Card>
    </div>
  );
}
