import React, { useEffect, useState } from "react";
import { CalendarRange, Flame, Target } from "lucide-react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, ProgressBar, Stat, Badge, Button, EmptyState, Textarea, useCountUp } from "@/components/ui/Primitives";
import { RadarChart } from "@/components/RadarChart";
import { PlanMensualWizard } from "@/components/planeacion/PlanMensualWizard";
import { iconoDeHabito } from "@/config/habitIcons";
import { cumplimientoGlobalSemanal, cumplimientoSemanalArea } from "@/lib/formulas";
import { rachaDiariaVigente } from "@/lib/achievements";
import { COLOR_SECCION, colorPorNivel } from "@/lib/color";
import { finSemana, hoyISO, inicioSemana, mesDe, formatoLargo, formatoMes } from "@/lib/dates";
import { semanasPendientes } from "@/lib/cierre";
import { Coachmarks } from "@/components/onboarding/Coachmarks";
import { coachmarksYaVistos, marcarCoachmarksVistos } from "@/lib/coachmarks";
import { getPerfilActivo } from "@/store/profiles";
import { Trophy } from "lucide-react";

function TarjetaRegistroDiario({ irA }: { irA: (tab: string) => void }) {
  const state = useKaizenStore();
  const hoy = hoyISO();
  const registroHoy = state.registrosDiarios.find((r) => r.fecha === hoy);
  const inicio = inicioSemana(hoy);
  const fin = finSemana(hoy);

  const cumplimientoPorArea = Object.fromEntries(
    state.areas.map((a) => [a.id, cumplimientoSemanalArea(a, state.config, state.registrosDiarios, inicio, fin)])
  ) as Record<string, number>;
  const cumplimientoGlobal = cumplimientoGlobalSemanal(cumplimientoPorArea, state.areas);
  const racha = rachaDiariaVigente(state);
  const rachaMostrada = useCountUp(racha);

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
            const color = colorPorNivel(a.color, a.nivel);
            return (
              <div
                key={a.id}
                title={a.nombre}
                className="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors"
                style={{
                  background: hecho ? `${color}26` : "transparent",
                  borderColor: hecho ? `${color}55` : "#292C2A",
                }}
              >
                <Icono className="w-4 h-4" style={{ color: hecho ? color : undefined }} />
              </div>
            );
          })}
        </div>
      )}
      <div className="flex items-center gap-6">
        <Stat label="Esta semana" value={`${Math.round(cumplimientoGlobal * 100)}%`} hint="cumplimiento global" />
        <div data-coach="coach-racha">
          <Stat
            size="lg"
            label="Racha diaria"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Flame className={`w-6 h-6 text-amber-400 ${racha > 0 ? "animate-flicker" : ""}`} /> {rachaMostrada}
              </span>
            }
          />
        </div>
      </div>
    </Card>
  );
}

function TarjetaGastosMensuales({ irA }: { irA: (tab: string) => void }) {
  const state = useKaizenStore();
  const { finanzas } = state;
  const hoy = hoyISO();
  const mesActual = mesDe(hoy);
  const gastosDelMes = finanzas.gastos.filter((g) => mesDe(g.fecha) === mesActual);
  const totalMes = gastosDelMes.reduce((acc, g) => acc + g.monto, 0);
  const totalEfectivo = gastosDelMes.filter((g) => g.metodo === "efectivo").reduce((acc, g) => acc + g.monto, 0);
  const totalTarjeta = gastosDelMes.filter((g) => g.metodo === "tarjeta").reduce((acc, g) => acc + g.monto, 0);
  const ingreso = finanzas.ingresosMensuales.find((i) => i.mes === mesActual)?.monto ?? 0;
  const pctIngreso = ingreso > 0 ? totalMes / ingreso : null;

  return (
    <Card>
      <SectionTitle
        title="Gastos del mes"
        accent={COLOR_SECCION.finanzas}
        action={
          <Button variant="secondary" onClick={() => irA("finanzas")}>
            Ver finanzas
          </Button>
        }
      />
      {gastosDelMes.length > 0 ? (
        <>
          <Stat label="Total gastado" value={`$${totalMes.toLocaleString()}`} hint={formatoMes(mesActual)} />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Stat label="Efectivo" value={`$${totalEfectivo.toLocaleString()}`} />
            <Stat label="Tarjeta" value={`$${totalTarjeta.toLocaleString()}`} />
          </div>
          {pctIngreso !== null && (
            <div className="mt-4 pt-4 border-t border-base-700">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-base-400">Llevas gastado del ingreso del mes</span>
                <span className="font-medium text-base-200">{Math.round(pctIngreso * 100)}%</span>
              </div>
              <ProgressBar value={pctIngreso} colorClass={pctIngreso > 1 ? "bg-rose-500" : "bg-finanzas-500"} />
            </div>
          )}
        </>
      ) : (
        <EmptyState text="Registra tu primer gasto del mes y aquí verás en qué se te va el dinero." />
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
            <div className="w-9 h-9 rounded-xl bg-kaizen-500/10 border border-kaizen-500/20 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-kaizen-400" />
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
          {!editando && <EmptyState text="¿Qué quieres poder decir que lograste al terminar el mes? Escríbelo abajo." />}
          {(editando || !metaActual?.descripcion) && (
            <>
              <Textarea
                rows={2}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Ej. Entrenar 4 veces por semana y leer 100 páginas"
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

/**
 * Estado de "primer día": aparece solo antes del primer registro real y
 * desaparece en cuanto existe uno — nada de banderas nuevas en el modelo,
 * se deriva de `registrosDiarios` directamente.
 */
function SpotlightPrimerDia({ irA }: { irA: (tab: string) => void }) {
  const state = useKaizenStore();
  if (state.areas.length === 0) return null;
  const nombres = state.areas.map((a) => a.nombre).join(", ");

  return (
    <Card className="border-kaizen-500/30 bg-kaizen-500/[0.05]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-kaizen-400 font-medium mb-1">Da tu primer paso hoy</div>
          <div className="text-sm text-base-200">Ya elegiste {nombres}. Regístralos hoy — el primer día es el que empieza todo.</div>
        </div>
        <Button onClick={() => irA("registro")} className="shrink-0">
          Registrar ahora
        </Button>
      </div>
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
    <Card className="border border-kaizen-500/20 bg-kaizen-500/[0.05]">
      <div className="text-sm text-base-200 mb-3">
        ¿Cumpliste tu meta de {formatoMes(pendiente.mes)}? <span className="text-base-300">"{pendiente.descripcion}"</span>
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
  const [mostrarCoach, setMostrarCoach] = useState(false);
  const mesPlaneado = state.planesMensuales.includes(mesDe(hoy));
  const esPerfilNuevo = state.planesMensuales.length === 0;

  // Primera vez que entra este perfil: lo llevamos derecho al asistente de planeación.
  useEffect(() => {
    if (esPerfilNuevo) setWizardAbierto(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inicio = inicioSemana(hoy);
  const pendientes = semanasPendientes(state, inicio);
  const tituloDelUsuario = state.config.catalogoReconocimientos.find((c) => c.id === usuario.tituloActivo)?.nombre ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hola, {usuario.nombre || "de nuevo"}</h1>
          <p className="text-sm text-base-400 mt-0.5 flex items-center gap-2">
            {formatoLargo(hoy)}
            {tituloDelUsuario && (
              <span className="inline-flex items-center gap-1 text-gold-400">
                <Trophy className="w-3 h-3" /> {tituloDelUsuario}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setWizardAbierto(true)} className="inline-flex items-center gap-1.5">
            <CalendarRange className="w-4 h-4" /> Planear {mesPlaneado ? "de nuevo" : "el mes"}
          </Button>
          <Button dataCoach="coach-registrar-dia" onClick={() => irA("registro")}>
            Registrar el día
          </Button>
        </div>
      </div>

      {mesPlaneado && state.registrosDiarios.length === 0 && <SpotlightPrimerDia irA={irA} />}

      {!mesPlaneado && (
        <Card className="border border-kaizen-500/20 bg-kaizen-500/[0.05]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-base-200">
              Aún no planeas {formatoMes(mesDe(hoy))}: elige tus hábitos y ponles una meta.
            </div>
            <Button onClick={() => setWizardAbierto(true)}>Planear ahora</Button>
          </div>
        </Card>
      )}

      {pendientes.length > 0 && (
        <Card className="border border-gold-500/20 bg-gold-500/[0.05]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gold-400">
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
              color: colorPorNivel(a.color, a.nivel),
            }))}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TarjetaGastosMensuales irA={irA} />
        <TarjetaMetaGrande />
      </div>

      {wizardAbierto && (
        <PlanMensualWizard
          onClose={() => {
            setWizardAbierto(false);
            if (esPerfilNuevo) {
              const perfilId = getPerfilActivo();
              if (perfilId && !coachmarksYaVistos(perfilId)) {
                marcarCoachmarksVistos(perfilId);
                setMostrarCoach(true);
              }
            }
          }}
        />
      )}

      {mostrarCoach && <Coachmarks onTerminar={() => setMostrarCoach(false)} />}
    </div>
  );
}
