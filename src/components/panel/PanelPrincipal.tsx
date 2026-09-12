import React, { useEffect, useState } from "react";
import { CalendarRange, Flame, Target, Wallet } from "lucide-react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, ProgressBar, Stat, Badge, Button, EmptyState, Textarea } from "@/components/ui/Primitives";
import { RadarChart } from "@/components/RadarChart";
import { PlanMensualWizard } from "@/components/planeacion/PlanMensualWizard";
import { iconoDeHabito } from "@/config/habitIcons";
import {
  cumplimientoGlobalSemanal,
  cumplimientoSemanalArea,
  gastadoEnCategoria,
  ritmoDiarioPermitido,
  calcularAsignaciones,
} from "@/lib/formulas";
import { rachaDiariaVigente } from "@/lib/achievements";
import { diasDelMes, diaDelMes, finSemana, hoyISO, inicioSemana, mesDe, formatoLargo, formatoMes } from "@/lib/dates";
import { semanasPendientes } from "@/lib/cierre";

function TarjetaRegistroDiario({ irA }: { irA: (tab: string) => void }) {
  const state = useKaizenStore();
  const hoy = hoyISO();
  const registroHoy = state.registrosDiarios.find((r) => r.fecha === hoy);
  const inicio = inicioSemana(hoy);
  const fin = finSemana(hoy);
  const presupuestoMesActual = state.finanzas.presupuestos.find((p) => p.mes === mesDe(hoy));

  const cumplimientoPorArea = Object.fromEntries(
    state.areas.map((a) => [
      a.id,
      cumplimientoSemanalArea(a, state.config, state.registrosDiarios, inicio, fin, state.finanzas.gastos, presupuestoMesActual),
    ])
  ) as Record<string, number>;
  const cumplimientoGlobal = cumplimientoGlobalSemanal(cumplimientoPorArea as any, state.areas);

  return (
    <Card className="lg:col-span-2">
      <SectionTitle
        title="Registro diario"
        subtitle={formatoLargo(hoy)}
        action={
          <Button onClick={() => irA("registro")} className="inline-flex items-center gap-1.5">
            {registroHoy ? "Actualizar" : "Registrar el día"}
          </Button>
        }
      />
      {state.areas.length === 0 ? (
        <EmptyState text="Aún no tienes hábitos activos." />
      ) : (
        <div className="flex flex-wrap gap-2 mb-5">
          {state.areas.map((a) => {
            const Icono = iconoDeHabito(a.id);
            const hecho = (registroHoy?.valores[a.id] ?? 0) > 0;
            return (
              <div
                key={a.id}
                title={a.nombre}
                className="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors"
                style={{
                  background: hecho ? `${a.color}26` : "rgba(255,255,255,0.03)",
                  borderColor: hecho ? `${a.color}55` : "rgba(255,255,255,0.08)",
                }}
              >
                <Icono className="w-4 h-4" style={{ color: hecho ? a.color : undefined }} />
              </div>
            );
          })}
        </div>
      )}
      <div className="flex items-center gap-6">
        <Stat label="Esta semana" value={`${Math.round(cumplimientoGlobal * 100)}%`} hint="cumplimiento global" />
        <Stat
          label="Racha diaria"
          value={
            <span className="inline-flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-400" /> {rachaDiariaVigente(state)}
            </span>
          }
        />
      </div>
    </Card>
  );
}

function TarjetaGastosMensuales({ irA }: { irA: (tab: string) => void }) {
  const state = useKaizenStore();
  const { finanzas } = state;
  const hoy = hoyISO();
  const mesActual = mesDe(hoy);
  const presupuestoMesActual = finanzas.presupuestos.find((p) => p.mes === mesActual);
  const asignaciones = presupuestoMesActual ? calcularAsignaciones(presupuestoMesActual) : new Map<string, number>();
  const totalAsignado = [...asignaciones.values()].reduce((a, b) => a + b, 0);
  const totalGastadoMes = presupuestoMesActual
    ? presupuestoMesActual.categorias
        .filter((c) => c.tipo === "gasto")
        .reduce((acc, c) => acc + gastadoEnCategoria(finanzas.gastos, c.id, mesActual), 0)
    : 0;
  const diasRestantesMes = Math.max(1, diasDelMes(mesActual) - diaDelMes(hoy) + 1);
  const ritmo = ritmoDiarioPermitido(totalAsignado, totalGastadoMes, diasRestantesMes);
  const pct = totalAsignado > 0 ? totalGastadoMes / totalAsignado : 0;

  return (
    <Card>
      <SectionTitle
        title="Gastos mensuales"
        action={
          <Button variant="secondary" onClick={() => irA("finanzas")}>
            Ver finanzas
          </Button>
        }
      />
      {presupuestoMesActual ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <Stat label="Dinero útil" value={`$${presupuestoMesActual.dineroUtil.toLocaleString()}`} />
            <Stat label="Gastado" value={`$${totalGastadoMes.toLocaleString()}`} />
            <Stat label="Ritmo diario" value={`$${Math.max(0, ritmo).toFixed(0)}`} hint="permitido por día" />
          </div>
          <ProgressBar value={pct} colorClass={pct > 1 ? "bg-rose-500" : "bg-sky-500"} />
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10 text-sm">
            <span className="text-base-300 inline-flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" /> Dinero para lujos
            </span>
            <span className="font-semibold text-base-100">${finanzas.bancoRecompensas.saldo.toLocaleString()}</span>
          </div>
        </>
      ) : (
        <EmptyState text="Aún no defines el presupuesto de este mes." />
      )}
    </Card>
  );
}

function TarjetaMetaGrande() {
  const state = useKaizenStore();
  const setMetaMensual = useKaizenStore((s) => s.setMetaMensual);
  const hoy = hoyISO();
  const mesActual = mesDe(hoy);
  const metaActual = state.metasMensuales.find((m) => m.mes === mesActual);
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(metaActual?.descripcion ?? "");

  const guardar = () => {
    setMetaMensual(mesActual, texto.trim());
    setEditando(false);
  };

  return (
    <Card>
      <SectionTitle title="Meta grande del mes" subtitle={formatoMes(mesActual)} />
      {!editando && metaActual?.descripcion ? (
        <>
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-sm text-base-200 leading-relaxed">{metaActual.descripcion}</p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Badge tone="blue">En curso</Badge>
            <button
              onClick={() => {
                setTexto(metaActual.descripcion);
                setEditando(true);
              }}
              className="text-xs text-base-500 hover:text-base-300"
            >
              Editar
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {!editando && <EmptyState text="Todavía no defines tu meta grande de este mes." />}
          {(editando || !metaActual?.descripcion) && (
            <>
              <Textarea
                rows={2}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Ej. Cerrar el mes sin sobregiro y entrenar 4 veces por semana"
              />
              <Button onClick={guardar} disabled={!texto.trim()}>
                Guardar meta
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

function BannerMetaPendiente() {
  const state = useKaizenStore();
  const marcarMetaMensual = useKaizenStore((s) => s.marcarMetaMensual);
  const mesActual = mesDe(hoyISO());
  const pendiente = [...state.metasMensuales]
    .filter((m) => m.mes < mesActual && m.cumplida === null && m.descripcion.trim())
    .sort((a, b) => (a.mes < b.mes ? 1 : -1))[0];

  if (!pendiente) return null;

  return (
    <Card className="border border-sky-500/20 bg-sky-500/[0.06]">
      <div className="text-sm text-sky-200 mb-3">
        ¿Cumpliste tu meta de {formatoMes(pendiente.mes)}? <span className="text-sky-300/80">"{pendiente.descripcion}"</span>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={() => marcarMetaMensual(pendiente.mes, true)}>Sí, la cumplí</Button>
        <Button variant="secondary" onClick={() => marcarMetaMensual(pendiente.mes, false)}>
          No la cumplí
        </Button>
      </div>
    </Card>
  );
}

export function PanelPrincipal({ irA }: { irA: (tab: string) => void }) {
  const state = useKaizenStore();
  const { usuario, areas, config } = state;
  const hoy = hoyISO();
  const [wizardAbierto, setWizardAbierto] = useState(false);
  const mesPlaneado = state.planesMensuales.includes(mesDe(hoy));
  const esPerfilNuevo = state.planesMensuales.length === 0;

  // Primera vez que entra este perfil: lo llevamos derecho al asistente de planeación.
  useEffect(() => {
    if (esPerfilNuevo) setWizardAbierto(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inicio = inicioSemana(hoy);
  const pendientes = semanasPendientes(state, inicio);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Hola, {usuario.nombre || "de nuevo"}</h1>
          <p className="text-sm text-base-400 mt-0.5">{formatoLargo(hoy)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setWizardAbierto(true)} className="inline-flex items-center gap-1.5">
            <CalendarRange className="w-4 h-4" /> Planear {mesPlaneado ? "de nuevo" : "el mes"}
          </Button>
          <Button onClick={() => irA("registro")}>Registrar el día</Button>
        </div>
      </div>

      {!mesPlaneado && (
        <Card className="border border-sky-500/20 bg-sky-500/[0.06]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-sky-300">
              Aún no planeas {formatoMes(mesDe(hoy))}: elige tus hábitos, sus metas y tu presupuesto del mes.
            </div>
            <Button onClick={() => setWizardAbierto(true)}>Planear ahora</Button>
          </div>
        </Card>
      )}

      {pendientes.length > 0 && (
        <Card className="border border-amber-500/20 bg-amber-500/[0.06]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-300">
              Tienes {pendientes.length} {pendientes.length === 1 ? "semana pendiente" : "semanas pendientes"} de cierre.
            </div>
            <Button variant="secondary" onClick={() => irA("cierre")}>
              Cerrar semana
            </Button>
          </div>
        </Card>
      )}

      <BannerMetaPendiente />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TarjetaRegistroDiario irA={irA} />
        <Card>
          <SectionTitle title={config.textos.radar} />
          <RadarChart
            puntos={areas.map((a) => ({
              label: a.nombre,
              value: Math.min(1, (a.nivel - 1) / 19),
              color: a.color,
            }))}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TarjetaGastosMensuales irA={irA} />
        <TarjetaMetaGrande />
      </div>

      {wizardAbierto && <PlanMensualWizard onClose={() => setWizardAbierto(false)} />}
    </div>
  );
}
