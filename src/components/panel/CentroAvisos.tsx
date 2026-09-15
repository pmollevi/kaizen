import React, { useEffect, useMemo, useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Button } from "@/components/ui/Primitives";
import { calcularAvisos, marcarDescartado, obtenerDescartados, type Aviso } from "@/lib/avisos";
import { notificarSiEnSegundoPlano } from "@/lib/notificaciones";
import { getPerfilActivo } from "@/store/profiles";
import { X, Flame, CreditCard } from "lucide-react";
import { OriIcon } from "@/components/ui/OriIcon";

const ESTILO_TONO: Record<Aviso["tono"], string> = {
  urgente: "border-amber-500/30 bg-amber-500/[0.06]",
  info: "border-finanzas-500/40 bg-finanzas-500/[0.09]",
  logro: "border-gold-500/40 bg-gold-500/[0.09]",
};

const ICONO_TONO: Record<Aviso["tono"], React.ElementType> = {
  urgente: Flame,
  info: CreditCard,
  logro: Flame,
};

/** Banner de avisos calculados en el momento — racha en riesgo, tarjetas por cortar. */
export function CentroAvisos({ irA }: { irA: (tab: string) => void }) {
  const state = useKaizenStore();
  const perfilId = getPerfilActivo();
  const avisos = useMemo(() => calcularAvisos(state), [state]);
  const [descartados, setDescartados] = useState<string[]>(() => (perfilId ? obtenerDescartados(perfilId) : []));

  const visibles = avisos.filter((a) => !descartados.includes(a.id));
  const idsVisibles = visibles.map((a) => a.id).join(",");

  useEffect(() => {
    for (const a of visibles) notificarSiEnSegundoPlano("Origo", a.texto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsVisibles]);

  if (visibles.length === 0) return null;

  const descartar = (id: string) => {
    if (perfilId) marcarDescartado(perfilId, id);
    setDescartados((d) => [...d, id]);
  };

  return (
    <div className="space-y-2">
      {visibles.map((a) => {
        const Icono = ICONO_TONO[a.tono];
        return (
          <div
            key={a.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border px-4 py-3 animate-pop ${ESTILO_TONO[a.tono]}`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              {a.id.startsWith("corte-") ? (
                <OriIcon mode="finanzas" state="protegido" size="sm" className="shrink-0 -my-2" title="Hay que pagar: corte próximo" />
              ) : (
                <Icono className="w-4 h-4 shrink-0 text-base-300 mt-0.5" />
              )}
              <span className="text-sm text-base-200">{a.texto}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {a.accion && (
                <Button variant="secondary" onClick={() => irA(a.accion!.ir)}>
                  {a.accion.label}
                </Button>
              )}
              <button onClick={() => descartar(a.id)} aria-label="Descartar aviso" className="text-base-500 hover:text-base-300 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
