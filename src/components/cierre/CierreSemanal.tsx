import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Button, Badge, ProgressBar, EmptyState, Stat } from "@/components/ui/Primitives";
import { semanasPendientes } from "@/lib/cierre";
import { dentroDeVentanaProteccion } from "@/lib/formulas";
import { rachaDiariaVigente } from "@/lib/achievements";
import { finSemana, formatoLargo, hoyISO, inicioSemana } from "@/lib/dates";
import { ShieldCheck } from "lucide-react";

function FormularioCierre({ inicio, onCerrado }: { inicio: string; onCerrado: () => void }) {
  const state = useKaizenStore();
  const cerrarSemana = useKaizenStore((s) => s.cerrarSemana);
  const fin = finSemana(inicio);
  const [bonosIds, setBonosIds] = useState<string[]>([]);
  const [proteger, setProteger] = useState(false);

  const puedeProteger =
    state.usuario.protecciones > 0 &&
    dentroDeVentanaProteccion(fin, new Date(), state.config.economia.ventanaProteccionHoras);

  const toggleBono = (id: string) => setBonosIds((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));

  return (
    <Card className="border-kaizen-500/40">
      <SectionTitle title={`Cerrar semana`} subtitle={`${formatoLargo(inicio)} – ${formatoLargo(fin)}`} />
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wide text-base-400 mb-2">Bonos por resultados reales</div>
        <div className="flex flex-wrap gap-2">
          {state.config.bonos.map((b) => (
            <button
              key={b.id}
              onClick={() => toggleBono(b.id)}
              disabled={proteger}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 ${
                bonosIds.includes(b.id) ? "border-kaizen-600 bg-kaizen-600/10 text-kaizen-400" : "border-base-700 text-base-400"
              }`}
            >
              {b.nombre} (+{b.valorPP} PP)
            </button>
          ))}
        </div>
      </div>

      {puedeProteger && (
        <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
          <input type="checkbox" checked={proteger} onChange={(e) => setProteger(e.target.checked)} />
          Usar una protección esta semana (no se ganan PP, pero se conserva la racha)
        </label>
      )}

      <Button
        onClick={() => {
          cerrarSemana(inicio, bonosIds, proteger);
          onCerrado();
        }}
      >
        Confirmar cierre
      </Button>
    </Card>
  );
}

function ResultadoCierre({ id }: { id: string }) {
  const state = useKaizenStore();
  const cierre = state.cierresSemanales.find((c) => c.id === id);
  if (!cierre) return null;
  return (
    <Card className="border-emerald-900 bg-emerald-950/20">
      <SectionTitle title="Semana cerrada" subtitle={`${formatoLargo(cierre.semanaInicio)} – ${formatoLargo(cierre.semanaFin)}`} />
      {cierre.protegida ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-gold-500/40 bg-gold-500/[0.09] px-4 py-3 animate-pop">
          <ShieldCheck className="w-5 h-5 text-gold-400 shrink-0" />
          <span className="text-sm text-base-200">
            Tu racha de <span className="font-semibold text-gold-400">{rachaDiariaVigente(state)} días</span> se salvó ✓ — se usó una
            protección, sin PP esta semana.
          </span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Stat label="Cumplimiento global" value={`${Math.round(cierre.cumplimientoGlobal * 100)}%`} />
            <Stat label="PP ganados" value={cierre.ppGanados} />
          </div>
          {cierre.nivelesAreaSubidos.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {cierre.nivelesAreaSubidos.map((id) => (
                <Badge key={id} tone="green">
                  {state.areas.find((a) => a.id === id)?.nombre} subió de nivel
                </Badge>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

export function CierreSemanalView() {
  const state = useKaizenStore();
  const hoy = hoyISO();
  const inicioActual = inicioSemana(hoy);
  const pendientes = semanasPendientes(state, inicioActual);
  const [enProceso, setEnProceso] = useState<string | null>(pendientes[0] ?? null);
  const [ultimoCerrado, setUltimoCerrado] = useState<string | null>(null);

  const historico = [...state.cierresSemanales].sort((a, b) => (a.semanaInicio < b.semanaInicio ? 1 : -1));

  return (
    <div className="space-y-5">
      <SectionTitle title="Cierre semanal" subtitle="Aquí se revelan los PP y los niveles de la semana." />

      {pendientes.length === 0 && !ultimoCerrado && <EmptyState text="No hay semanas pendientes de cierre." />}

      {ultimoCerrado && <ResultadoCierre id={`c_${ultimoCerrado}`} />}

      {enProceso && (
        <FormularioCierre
          inicio={enProceso}
          onCerrado={() => {
            setUltimoCerrado(enProceso);
            const restantes = semanasPendientes(state, inicioActual).filter((s) => s !== enProceso);
            setEnProceso(restantes[0] ?? null);
          }}
        />
      )}

      {pendientes.length > 1 && (
        <div className="text-xs text-base-500">
          {pendientes.length} semanas en la cola. Ciérralas en orden para mantener el historial consistente.
        </div>
      )}

      <Card>
        <SectionTitle title="Historial de cierres" />
        {historico.length === 0 ? (
          <EmptyState text="Aún no hay cierres registrados." />
        ) : (
          <div className="space-y-2">
            {historico.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm bg-base-850 rounded-lg px-3 py-2.5">
                <span className="text-base-300">
                  {formatoLargo(c.semanaInicio)} – {formatoLargo(c.semanaFin)}
                </span>
                <div className="flex items-center gap-3">
                  <ProgressBar value={c.cumplimientoGlobal} colorClass="bg-kaizen-500" height="h-1" />
                  <span className="text-base-400 w-10 text-right">{Math.round(c.cumplimientoGlobal * 100)}%</span>
                  {c.protegida ? <Badge tone="blue">protegida</Badge> : <Badge>+{c.ppGanados} PP</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
