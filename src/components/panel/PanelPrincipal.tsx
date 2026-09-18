import React, { useEffect, useMemo, useState } from "react";
import { CalendarRange, Flame, ShieldCheck, Target } from "lucide-react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, ProgressBar, Stat, Badge, Button, EmptyState, Input, Textarea, useCountUp } from "@/components/ui/Primitives";
import { RadarChart } from "@/components/RadarChart";
import { PlanMensualWizard } from "@/components/planeacion/PlanMensualWizard";
import { iconoDeHabito } from "@/config/habitIcons";
import { cumplimientoGlobalSemanal, cumplimientoSemanalArea } from "@/lib/formulas";
import { rachaDiariaVigente } from "@/lib/achievements";
import { COLOR_SECCION, colorPorNivel } from "@/lib/color";
import { finSemana, hoyISO, inicioSemana, mesAnterior, mesDe, sumarDias, formatoLargo, formatoMes } from "@/lib/dates";
import { semanasPendientes } from "@/lib/cierre";
import { Coachmarks } from "@/components/onboarding/Coachmarks";
import { CentroAvisos } from "@/components/panel/CentroAvisos";
import { SelectorDiasConDetalle } from "@/components/ui/Calendario";
import { coachmarksYaVistos, marcarCoachmarksVistos } from "@/lib/coachmarks";
import { getPerfilActivo } from "@/store/profiles";
import { Trophy } from "lucide-react";
import { OriIcon } from "@/components/ui/OriIcon";
import { estadoOriFinanzasResumen, estadoOriHabito } from "@/lib/ori";
import { OriBienvenida } from "@/components/onboarding/OriBienvenida";
import { marcarOriBienvenidaVista, oriBienvenidaYaVista } from "@/lib/oriBienvenida";
import { DIAS_PARA_SUGERIR_PAUSA, diasSeguidosSinHabito, marcarPausaDescartada, pausaFueDescartada } from "@/lib/pausas";
import {
  cambiosParaNuevaMeta,
  calcularSugerenciasMeta,
  marcarSugerenciaMetaResuelta,
  sugerenciaMetaResuelta,
} from "@/lib/sugerenciasMeta";

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
    <Card className="lg:col-span-2 border-habitos-500/35 bg-habitos-500/[0.08]">
      <SectionTitle
        title="Registro diario"
        accent={COLOR_SECCION.habitos}
        subtitle={formatoLargo(hoy)}
        action={
          <Button onClick={() => irA("registro")} className="inline-flex items-center gap-1.5">
            {registroHoy ? "Actualizar" : "Registrar el día"}
          </Button>
        }
      />
      {state.areas.filter((a) => !a.pausada).length === 0 ? (
        <EmptyState text="Aún no tienes hábitos activos." />
      ) : (
        <div className="flex flex-wrap gap-2 mb-5">
          {state.areas.filter((a) => !a.pausada).map((a) => {
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
      <div
        data-coach="coach-racha"
        className="flex items-center gap-3 sm:gap-4 mb-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 px-4 py-3"
      >
        <Flame className={`w-8 h-8 sm:w-9 sm:h-9 text-amber-400 shrink-0 ${racha > 0 ? "animate-flicker" : ""}`} />
        <div className="flex-1">
          <div className="text-4xl sm:text-5xl font-bold tabular-nums text-base-100 leading-none">{rachaMostrada}</div>
          <div className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold mt-1">
            {racha === 1 ? "día de racha" : "días de racha"}
          </div>
        </div>
        {state.areas.length > 0 && <OriIcon mode="habito" state={estadoOriHabito(state)} />}
      </div>
      <div className="flex items-center gap-6">
        <Stat label="Esta semana" value={`${Math.round(cumplimientoGlobal * 100)}%`} hint="cumplimiento global" />
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
    <Card className="border-finanzas-500/35 bg-finanzas-500/[0.08]">
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
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-base-400">Llevas gastado del ingreso del mes</span>
                    <span className="font-medium text-base-200">{Math.round(pctIngreso * 100)}%</span>
                  </div>
                  <ProgressBar value={pctIngreso} colorClass={pctIngreso > 1 ? "bg-rose-500" : "bg-finanzas-500"} />
                </div>
                <OriIcon mode="finanzas" state={estadoOriFinanzasResumen(state) ?? "reposo"} />
              </div>
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
    <Card className="border-gold-500/35 bg-gold-500/[0.08]">
      <SectionTitle title="Meta grande del mes" accent={COLOR_SECCION.recompensas} subtitle={formatoMes(mesActual)} />
      {!editando && metaActual?.descripcion ? (
        <>
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-gold-400" />
            </div>
            <p className="text-sm text-base-200 leading-relaxed min-w-0 flex-1 break-words">{metaActual.descripcion}</p>
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
    <Card className="border-kaizen-500/40 bg-kaizen-500/[0.08]">
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

/** Punto 8: hábito con 5+ días seguidos sin registrarse mientras el resto sigue con normalidad — ofrece pausarlo. */
function SugerenciaPausaHabito() {
  const state = useKaizenStore();
  const pausarHabito = useKaizenStore((s) => s.pausarHabito);
  const perfilId = getPerfilActivo();
  const [, forzarRefresco] = useState(0);

  const candidata = state.areas
    .filter((a) => !a.pausada)
    .map((area) => ({ area, dias: diasSeguidosSinHabito(state, area.id) }))
    .filter((c) => c.dias >= DIAS_PARA_SUGERIR_PAUSA && !(perfilId && pausaFueDescartada(perfilId, c.area.id, c.dias)))
    .sort((a, b) => b.dias - a.dias)[0];

  if (!candidata) return null;

  return (
    <Card className="border border-base-700 bg-base-850/60">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-base-200">
          Llevas {candidata.dias} días sin registrar <span className="font-medium">{candidata.area.nombre}</span>, mientras
          sigues con tus otros hábitos. ¿Lo pausamos para que no te pida registro ni rompa tu racha?
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => pausarHabito(candidata.area.id)}>Pausar hábito</Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (perfilId) marcarPausaDescartada(perfilId, candidata.area.id, candidata.dias);
              forzarRefresco((n) => n + 1);
            }}
          >
            Ignorar por ahora
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** Punto 9: al cerrar el mes, sugiere subir o bajar la meta de un hábito según lo logrado — nunca se aplica sin confirmar. */
function SugerenciaMetaMensual() {
  const state = useKaizenStore();
  const actualizarAreaConfig = useKaizenStore((s) => s.actualizarAreaConfig);
  const perfilId = getPerfilActivo();
  const [, forzarRefresco] = useState(0);
  const [edicion, setEdicion] = useState<number | null>(null);

  const mesEvaluado = mesAnterior(mesDe(hoyISO()));
  const sugerencia = calcularSugerenciasMeta(state, mesEvaluado).find(
    (s) => !(perfilId && sugerenciaMetaResuelta(perfilId, s))
  );
  const area = sugerencia ? state.areas.find((a) => a.id === sugerencia.areaId) : undefined;

  if (!sugerencia || !area) return null;
  const valorPropuesto = edicion ?? sugerencia.metaSugerida;

  const resolver = (aplicar: boolean) => {
    if (aplicar) actualizarAreaConfig(area.id, cambiosParaNuevaMeta(area, valorPropuesto));
    if (perfilId) marcarSugerenciaMetaResuelta(perfilId, sugerencia);
    forzarRefresco((n) => n + 1);
  };

  return (
    <Card className="border border-kaizen-500/40 bg-kaizen-500/[0.08]">
      <div className="text-sm text-base-200 mb-3">
        {sugerencia.direccion === "subir"
          ? `En ${area.nombre} superaste tu meta casi todo ${formatoMes(mesEvaluado)} — ¿la subimos para este mes?`
          : `En ${area.nombre} te quedaste corto casi todo ${formatoMes(mesEvaluado)} — ¿la bajamos a algo más alcanzable?`}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-base-500">Meta semanal ({area.metaSemanalBase} actual):</span>
        <Input
          type="number"
          className="w-24"
          value={valorPropuesto}
          onChange={(e) => setEdicion(parseFloat(e.target.value) || 0)}
        />
        <Button onClick={() => resolver(true)}>Aplicar</Button>
        <Button variant="ghost" onClick={() => resolver(false)}>
          Ignorar
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
    <Card className="border border-kaizen-500/40 bg-kaizen-500/[0.08]">
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

/** Contenido que antes vivía en la pestaña "Recompensas" — ahora es la última sección del Panel. */
function SeccionRachaYProtecciones() {
  const state = useKaizenStore();
  const canjear = useKaizenStore((s) => s.canjearRachaPorProteccion);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const racha = rachaDiariaVigente(state);
  const disponible = Math.max(0, racha - state.usuario.diasRachaCanjeados);
  const { diasPorProteccion, proteccionesMaxAcumulables } = state.config.economia;
  const puedeCanjear = disponible >= diasPorProteccion && state.usuario.protecciones < proteccionesMaxAcumulables;

  const intentarCanje = () => {
    const res = canjear();
    setMensaje(res.ok ? "Canjeado: +1 protección" : res.motivo ?? "No se pudo canjear");
    setTimeout(() => setMensaje(null), 3500);
  };

  const cierresRecientes = [...state.cierresSemanales].sort((a, b) => (a.semanaInicio < b.semanaInicio ? 1 : -1)).slice(0, 8);
  const diasProtegidosRecientes = [...state.usuario.diasProtegidos].sort((a, b) => (a < b ? 1 : -1)).slice(0, 6);

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Racha y protecciones"
        subtitle="Tu racha diaria se cambia por protecciones: si un día se te pasa sin registrar, una protección lo cubre sola y tu racha sigue viva."
        accent={COLOR_SECCION.recompensas}
      />

      <Card className="border-amber-500/25 bg-amber-500/[0.06]">
        <div className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-2">Racha diaria actual</div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Flame className={`w-8 h-8 sm:w-9 sm:h-9 text-amber-400 shrink-0 ${racha > 0 ? "animate-flicker" : ""}`} />
          <div className="text-4xl sm:text-5xl font-bold tabular-nums text-base-100 leading-none flex-1">{racha}</div>
          {state.areas.length > 0 && <OriIcon mode="habito" state={estadoOriHabito(state)} />}
        </div>
        <div className="text-xs text-base-500 mt-2">días seguidos cumpliendo todos tus hábitos</div>
      </Card>

      {mensaje && <div className="text-sm px-4 py-2.5 rounded-lg bg-base-850 border border-base-700">{mensaje}</div>}

      <Card className="border-gold-500/35 bg-gold-500/[0.08]">
        <SectionTitle
          title={state.config.textos.escudos}
          accent={COLOR_SECCION.recompensas}
          subtitle={`Cada ${diasPorProteccion} días de racha se cambian por 1 protección. Si falta un día sin registrar, se usa sola y tu racha no se rompe.`}
        />
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-3">
          <span className="text-sm text-base-300">
            {state.usuario.protecciones} / {proteccionesMaxAcumulables} protecciones
          </span>
          <span className="text-sm text-base-500">
            {disponible} / {diasPorProteccion} días hacia la próxima
          </span>
        </div>
        <ProgressBar value={disponible / diasPorProteccion} color="#C5A85B" height="h-1.5" />
        <Button className="mt-4" disabled={!puedeCanjear} onClick={intentarCanje}>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Canjear racha por protección
          </span>
        </Button>
        {diasProtegidosRecientes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-base-700">
            <div className="text-xs text-base-500 mb-1.5">Días cubiertos automáticamente por una protección:</div>
            <div className="flex flex-wrap gap-1.5">
              {diasProtegidosRecientes.map((f) => (
                <Badge key={f} tone="yellow">
                  {formatoLargo(f)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="Cierres recientes" />
        {cierresRecientes.length === 0 ? (
          <EmptyState text="Todavía no hay semanas cerradas." />
        ) : (
          <ul className="divide-y divide-base-700">
            {cierresRecientes.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5 text-sm">
                <span className="text-base-300">
                  {formatoLargo(c.semanaInicio)} – {formatoLargo(c.semanaFin)}
                </span>
                {c.protegida ? (
                  <Badge tone="blue">semana protegida</Badge>
                ) : (
                  <span className="text-base-400">
                    +{c.ppGanados} PP · {Math.round(c.cumplimientoGlobal * 100)}% cumplido
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export function PanelPrincipal({ irA }: { irA: (tab: string) => void }) {
  const state = useKaizenStore();
  const { usuario, areas, config } = state;
  const hoy = hoyISO();
  const [wizardAbierto, setWizardAbierto] = useState(false);
  const [mostrarCoach, setMostrarCoach] = useState(false);
  const [mostrarOriBienvenida, setMostrarOriBienvenida] = useState(false);
  const mesPlaneado = state.planesMensuales.includes(mesDe(hoy));
  const esPerfilNuevo = state.planesMensuales.length === 0;

  // Primera vez que entra este perfil: la presentación de Ori se monta sobre
  // todo lo demás (wizard incluido) para que sea lo primero que se ve.
  useEffect(() => {
    const perfilId = getPerfilActivo();
    if (perfilId && !oriBienvenidaYaVista(perfilId)) setMostrarOriBienvenida(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Primera vez que entra este perfil: lo llevamos derecho al asistente de planeación.
  useEffect(() => {
    if (esPerfilNuevo) setWizardAbierto(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inicio = inicioSemana(hoy);
  const pendientes = semanasPendientes(state, inicio);
  const tituloDelUsuario = state.config.catalogoReconocimientos.find((c) => c.id === usuario.tituloActivo)?.nombre ?? null;

  const ultimos7 = useMemo(() => {
    const dias: string[] = [];
    for (let i = 0; i < 7; i++) dias.push(sumarDias(hoy, -i));
    return dias;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoy]);

  return (
    <div className="space-y-6">
      <SelectorDiasConDetalle dias={ultimos7} fechaActiva={hoy} />

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

      <CentroAvisos irA={irA} />

      {mesPlaneado && state.registrosDiarios.length === 0 && <SpotlightPrimerDia irA={irA} />}

      {!mesPlaneado && (
        <Card className="border border-kaizen-500/40 bg-kaizen-500/[0.08]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-base-200">
              Aún no planeas {formatoMes(mesDe(hoy))}: elige tus hábitos y ponles una meta.
            </div>
            <Button onClick={() => setWizardAbierto(true)}>Planear ahora</Button>
          </div>
        </Card>
      )}

      {pendientes.length > 0 && (
        <Card className="border border-gold-500/40 bg-gold-500/[0.08]">
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
      <SugerenciaPausaHabito />
      <SugerenciaMetaMensual />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TarjetaRegistroDiario irA={irA} />
        <Card className="border-kaizen-500/35 bg-kaizen-500/[0.08]">
          <SectionTitle title={config.textos.radar} accent={COLOR_SECCION.panel} />
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

      <SeccionRachaYProtecciones />

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

      {mostrarOriBienvenida && (
        <OriBienvenida
          onCerrar={() => {
            const perfilId = getPerfilActivo();
            if (perfilId) marcarOriBienvenidaVista(perfilId);
            setMostrarOriBienvenida(false);
          }}
        />
      )}
    </div>
  );
}
