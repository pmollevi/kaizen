import React from "react";
import { ShieldCheck, Coins, Flag, Wallet, Plus } from "lucide-react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, ProgressBar, Stat, Badge, Button, EmptyState } from "@/components/ui/Primitives";
import { RadarChart } from "@/components/RadarChart";
import {
  cumplimientoGlobalSemanal,
  cumplimientoSemanalArea,
  gastadoEnCategoria,
  nivelDesdePP,
  ritmoDiarioPermitido,
  semaforo,
  calcularAsignaciones,
} from "@/lib/formulas";
import { diasDelMes, diaDelMes, diasEntre, finSemana, hoyISO, inicioSemana, mesDe, formatoLargo } from "@/lib/dates";
import { semanasPendientes } from "@/lib/cierre";

const colorHex: Record<string, string> = {
  intelecto: "#5b8def",
  imperio: "#e0a63a",
  fuerza: "#e0544f",
  vitalidad: "#4cb782",
  energia: "#9b6fe0",
  sabiduria: "#3ab5c6",
};
const barColor: Record<string, string> = {
  intelecto: "bg-area-intelecto",
  imperio: "bg-area-imperio",
  fuerza: "bg-area-fuerza",
  vitalidad: "bg-area-vitalidad",
  energia: "bg-area-energia",
  sabiduria: "bg-area-sabiduria",
};

export function PanelPrincipal({ irA }: { irA: (tab: string) => void }) {
  const state = useKaizenStore();
  const { usuario, areas, config, temporadaActual, finanzas } = state;
  const hoy = hoyISO();
  const nivel = nivelDesdePP(usuario.ppTotales, config);

  const inicio = inicioSemana(hoy);
  const fin = finSemana(hoy);
  const presupuestoMesActual = finanzas.presupuestos.find((p) => p.mes === mesDe(hoy));
  const cumplimientoPorArea = Object.fromEntries(
    areas.map((a) => [
      a.id,
      cumplimientoSemanalArea(a, config, state.registrosDiarios, inicio, fin, finanzas.gastos, presupuestoMesActual),
    ])
  ) as Record<string, number>;
  const cumplimientoGlobal = cumplimientoGlobalSemanal(cumplimientoPorArea as any, areas);

  const diasRestantesTemporada = Math.max(0, diasEntre(hoy, temporadaActual.fin));
  const pendientes = semanasPendientes(state, inicio);

  const mesActual = mesDe(hoy);
  const asignaciones = presupuestoMesActual ? calcularAsignaciones(presupuestoMesActual) : new Map<string, number>();
  const totalAsignado = [...asignaciones.values()].reduce((a, b) => a + b, 0);
  const totalGastadoMes = presupuestoMesActual
    ? presupuestoMesActual.categorias
        .filter((c) => c.tipo === "gasto")
        .reduce((acc, c) => acc + gastadoEnCategoria(finanzas.gastos, c.id, mesActual), 0)
    : 0;
  const diasRestantesMes = Math.max(1, diasDelMes(mesActual) - diaDelMes(hoy) + 1);
  const ritmo = ritmoDiarioPermitido(totalAsignado, totalGastadoMes, diasRestantesMes);
  const ultimosGastos = [...finanzas.gastos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, 5);

  const desafiosActivos = temporadaActual.desafios.filter((d) => !d.completado);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Hola, {usuario.nombre || "de nuevo"}</h1>
          <p className="text-sm text-base-400 mt-0.5">{formatoLargo(hoy)}</p>
        </div>
        <Button onClick={() => irA("registro")}>Registrar el día</Button>
      </div>

      {pendientes.length > 0 && (
        <Card className="border border-amber-900 bg-amber-950/40">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bloque de progreso */}
        <Card className="lg:col-span-2">
          <SectionTitle title="Progreso" subtitle={temporadaActual.nombre} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <Stat label="Nivel global" value={nivel.nivel} hint={`faltan ${nivel.faltante} PP`} />
            <Stat label="PP totales" value={usuario.ppTotales.toLocaleString()} />
            <Stat
              label="Créditos"
              value={
                <span className="inline-flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-400" /> {usuario.creditos}
                </span>
              }
            />
            <Stat
              label="Protecciones"
              value={
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-sky-400" /> {usuario.protecciones}
                </span>
              }
            />
          </div>
          <ProgressBar value={nivel.progresoPct} colorClass="bg-sky-500" height="h-2.5" />
          <div className="flex items-center justify-between text-xs text-base-500 mt-1.5">
            <span>Nivel {nivel.nivel}</span>
            <span>Nivel {nivel.nivel + 1}</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-base-300">
              <Flag className="w-4 h-4 text-base-500" />
              {diasRestantesTemporada} días restantes de temporada
            </div>
            <div className="text-sm text-base-300 truncate">
              {temporadaActual.retoFinal.descripcion ? (
                <Badge tone={temporadaActual.retoFinal.completado ? "green" : "blue"}>
                  {temporadaActual.retoFinal.completado ? "Reto final superado" : "Reto final en curso"}
                </Badge>
              ) : (
                <span className="text-base-500">Sin reto final definido</span>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {areas.map((a) => (
              <div key={a.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-base-200">
                    {a.nombre} · Nv. {a.nivel}
                  </span>
                  <span className="text-base-500">
                    racha {a.semanasConsecutivas}/{config.economia.semanasParaNivelArea}
                  </span>
                </div>
                <ProgressBar value={cumplimientoPorArea[a.id] ?? 0} colorClass={barColor[a.id]} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title={config.textos.radar} />
          <RadarChart
            puntos={areas.map((a) => ({
              label: a.nombre,
              value: Math.min(1, (a.nivel - 1) / 19),
              color: colorHex[a.id],
            }))}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bloque financiero */}
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Finanzas del mes"
            subtitle={presupuestoMesActual ? undefined : "Configura tu presupuesto de este mes"}
            action={
              <Button onClick={() => irA("finanzas")} className="inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Registrar gasto
              </Button>
            }
          />
          {presupuestoMesActual ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Stat label="Dinero útil" value={`$${presupuestoMesActual.dineroUtil.toLocaleString()}`} />
                <Stat label="Gastado" value={`$${totalGastadoMes.toLocaleString()}`} />
                <Stat label="Ritmo diario" value={`$${Math.max(0, ritmo).toFixed(0)}`} hint="permitido por día" />
              </div>
              <div className="space-y-3">
                {presupuestoMesActual.categorias.map((c) => {
                  const asignado = asignaciones.get(c.id) ?? 0;
                  const gastado = gastadoEnCategoria(finanzas.gastos, c.id, mesActual);
                  const pct = asignado > 0 ? gastado / asignado : 0;
                  const s = semaforo(pct);
                  return (
                    <div key={c.id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-base-200">{c.nombre}</span>
                        <span className="text-base-500">
                          ${gastado.toLocaleString()} / ${asignado.toLocaleString()}
                        </span>
                      </div>
                      <ProgressBar
                        value={pct}
                        colorClass={s === "rojo" ? "bg-rose-500" : s === "amarillo" ? "bg-amber-500" : "bg-emerald-500"}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <EmptyState text="Aún no defines el presupuesto de este mes." />
          )}
        </Card>

        <Card>
          <SectionTitle title="Banco de Recompensas" />
          <div className="flex items-center gap-2 text-2xl font-semibold mb-1">
            <Wallet className="w-5 h-5 text-emerald-400" />${finanzas.bancoRecompensas.saldo.toLocaleString()}
          </div>
          <div className="text-xs text-base-500 mb-5">tope ${finanzas.bancoRecompensas.tope.toLocaleString()}</div>
          <div className="text-xs uppercase tracking-wide text-base-400 mb-2">Últimos gastos</div>
          {ultimosGastos.length === 0 ? (
            <EmptyState text="Sin gastos registrados." />
          ) : (
            <ul className="space-y-2">
              {ultimosGastos.map((g) => (
                <li key={g.id} className="flex items-center justify-between text-sm">
                  <span className="text-base-300 truncate">{g.palabraClave}</span>
                  <span className="text-base-100 font-medium">${g.monto.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <SectionTitle title="Semana en curso" subtitle={`${formatoLargo(inicio)} – ${formatoLargo(fin)}`} />
        <div className="flex items-center gap-4 mb-5">
          <div className="text-3xl font-semibold">{Math.round(cumplimientoGlobal * 100)}%</div>
          <ProgressBar value={cumplimientoGlobal} colorClass="bg-sky-500" />
        </div>
        <div className="text-xs uppercase tracking-wide text-base-400 mb-2">{config.textos.misiones} activos</div>
        {desafiosActivos.length === 0 ? (
          <EmptyState text="No hay desafíos activos." />
        ) : (
          <ul className="space-y-1.5">
            {desafiosActivos.map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm">
                <span className="text-base-300">{d.nombre}</span>
                <Badge tone="blue">{d.tipo}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
