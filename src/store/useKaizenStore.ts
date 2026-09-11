import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AreaId,
  CategoriaPresupuesto,
  Desafio,
  Evento,
  Gasto,
  KaizenState,
  RecompensaCatalogo,
  ReconocimientoCatalogo,
} from "@/types";
import { areaDesdeCatalogo, estadoInicial, temporadaDefault } from "@/config/defaultConfig";
import { plantillaPorId } from "@/config/areaCatalog";
import { claveDatos, getPerfilActivo } from "@/store/profiles";
import { generarId } from "@/lib/id";
import { diaDelMes, diasDelMes, finSemana, hoyISO, inicioSemana, mesDe, sumarDias } from "@/lib/dates";
import { calcularCierreMensual, calcularCierreSemanal, mesesPendientesDeCierre, semanasPendientes } from "@/lib/cierre";
import { calcularAsignaciones } from "@/lib/formulas";
import { evaluarReconocimientos } from "@/lib/achievements";

const storageAdapter = {
  getItem: (_name: string) => {
    const id = getPerfilActivo();
    if (!id) return null;
    return localStorage.getItem(claveDatos(id));
  },
  setItem: (_name: string, value: string) => {
    const id = getPerfilActivo();
    if (!id) return;
    localStorage.setItem(claveDatos(id), value);
  },
  removeItem: (_name: string) => {
    const id = getPerfilActivo();
    if (!id) return;
    localStorage.removeItem(claveDatos(id));
  },
};

interface Acciones {
  setNombreUsuario: (nombre: string) => void;
  setTituloActivo: (id: string | null) => void;

  registrarDia: (fecha: string, valores: Record<AreaId, number>, observacion: string) => void;
  editarRegistro: (id: string, valores: Record<AreaId, number>, observacion: string) => void;
  eliminarRegistro: (id: string) => void;

  setPresupuestoMes: (mes: string, dineroUtil: number, categorias: CategoriaPresupuesto[]) => void;
  clonarPresupuesto: (mesOrigen: string, mesDestino: string) => void;
  setModoAtipico: (mes: string, activo: boolean, nota: string) => void;
  agregarGasto: (gasto: Omit<Gasto, "id">) => void;
  eliminarGasto: (id: string) => void;

  cerrarSemana: (inicio: string, bonosIds: string[], proteger: boolean) => void;
  procesarCierresMensualesPendientes: () => void;

  canjearRecompensa: (recompensaId: string) => { ok: boolean; motivo?: string };

  actualizarPesos: (pesos: Record<AreaId, number>) => void;
  actualizarAreaConfig: (areaId: AreaId, cambios: Partial<{ metaDiaria: number | null; metaSemanalBase: number; topeMetaSemanal: number }>) => void;
  actualizarConfigEconomia: (cambios: Partial<KaizenState["config"]["economia"]>) => void;
  actualizarConfigImperio: (cambios: Partial<KaizenState["config"]["imperio"]>) => void;
  actualizarTextos: (cambios: Partial<KaizenState["config"]["textos"]>) => void;
  setCatalogoRecompensas: (catalogo: RecompensaCatalogo[]) => void;
  setCatalogoReconocimientos: (catalogo: ReconocimientoCatalogo[]) => void;
  setBonos: (bonos: KaizenState["config"]["bonos"]) => void;

  aplicarPlanMensual: (input: {
    mes: string;
    habitos: { id: string; peso: number; metaMensual: number }[];
    dineroUtil: number;
    gastosFijos: { nombre: string; monto: number }[];
    ahorro: number;
  }) => void;

  crearDesafio: (desafio: Omit<Desafio, "id" | "completado">) => void;
  completarDesafio: (id: string) => void;
  eliminarDesafio: (id: string) => void;
  setRetoFinal: (descripcion: string) => void;
  completarRetoFinal: () => void;
  crearEvento: (evento: Omit<Evento, "id">) => { ok: boolean; motivo?: string };
  finalizarEvento: (id: string) => void;
  cerrarTemporada: (nombre: string, narrativa: string, semanas: number) => void;

  cargarEstado: (estado: KaizenState) => void;
  reiniciarConNombre: (nombre: string) => void;
}

export type KaizenStore = KaizenState & Acciones;

export const useKaizenStore = create<KaizenStore>()(
  persist(
    (set, get) => ({
      ...estadoInicial(""),

      setNombreUsuario: (nombre) => set((s) => ({ usuario: { ...s.usuario, nombre } })),
      setTituloActivo: (id) => set((s) => ({ usuario: { ...s.usuario, tituloActivo: id } })),

      registrarDia: (fecha, valores, observacion) =>
        set((s) => ({
          registrosDiarios: [
            ...s.registrosDiarios.filter((r) => r.fecha !== fecha),
            { id: generarId("r"), fecha, valores, observacion, creadoEn: new Date().toISOString() },
          ],
        })),

      editarRegistro: (id, valores, observacion) =>
        set((s) => ({
          registrosDiarios: s.registrosDiarios.map((r) => (r.id === id ? { ...r, valores, observacion } : r)),
        })),

      eliminarRegistro: (id) => set((s) => ({ registrosDiarios: s.registrosDiarios.filter((r) => r.id !== id) })),

      setPresupuestoMes: (mes, dineroUtil, categorias) =>
        set((s) => {
          const existe = s.finanzas.presupuestos.some((p) => p.mes === mes);
          const presupuestos = existe
            ? s.finanzas.presupuestos.map((p) => (p.mes === mes ? { ...p, dineroUtil, categorias } : p))
            : [...s.finanzas.presupuestos, { mes, dineroUtil, categorias, modoAtipico: false }];
          return { finanzas: { ...s.finanzas, presupuestos } };
        }),

      clonarPresupuesto: (mesOrigen, mesDestino) =>
        set((s) => {
          const origen = s.finanzas.presupuestos.find((p) => p.mes === mesOrigen);
          if (!origen) return {};
          const yaExiste = s.finanzas.presupuestos.some((p) => p.mes === mesDestino);
          if (yaExiste) return {};
          const clon = {
            mes: mesDestino,
            dineroUtil: origen.dineroUtil,
            categorias: origen.categorias.map((c) => ({ ...c, id: generarId("cat") })),
            modoAtipico: false,
          };
          return { finanzas: { ...s.finanzas, presupuestos: [...s.finanzas.presupuestos, clon] } };
        }),

      setModoAtipico: (mes, activo, nota) =>
        set((s) => ({
          finanzas: {
            ...s.finanzas,
            presupuestos: s.finanzas.presupuestos.map((p) =>
              p.mes === mes ? { ...p, modoAtipico: activo, notaAtipico: nota } : p
            ),
          },
        })),

      agregarGasto: (gasto) =>
        set((s) => ({
          finanzas: { ...s.finanzas, gastos: [...s.finanzas.gastos, { ...gasto, id: generarId("g") }] },
        })),

      eliminarGasto: (id) =>
        set((s) => ({ finanzas: { ...s.finanzas, gastos: s.finanzas.gastos.filter((g) => g.id !== id) } })),

      cerrarSemana: (inicio, bonosIds, proteger) => {
        const s = get();
        if (proteger && s.usuario.protecciones <= 0) return;
        const fin = finSemana(inicio);
        const { cierre, areas, usuario } = calcularCierreSemanal(s, inicio, fin, bonosIds, proteger);
        const nivelesMaximos = { ...s.historial.nivelesMaximos };
        for (const a of areas) nivelesMaximos[a.id] = Math.max(nivelesMaximos[a.id] ?? 1, a.nivel);
        set({
          cierresSemanales: [...s.cierresSemanales, cierre],
          areas,
          usuario,
          historial: { ...s.historial, nivelesMaximos },
        });
        get().procesarCierresMensualesPendientes();
        const nuevos = evaluarReconocimientos(get());
        if (nuevos.length > 0) {
          set((st) => ({
            historial: {
              ...st.historial,
              reconocimientos: [
                ...st.historial.reconocimientos,
                ...nuevos.map((id) => ({ id, fecha: hoyISO() })),
              ],
            },
          }));
        }
      },

      procesarCierresMensualesPendientes: () => {
        const mesActual = mesDe(hoyISO());
        let s = get();
        const pendientes = mesesPendientesDeCierre(s, mesActual);
        for (const mes of pendientes) {
          const { resumen, saldoBanco, proteccionGanada, bumpDineroUtilMesSiguiente } = calcularCierreMensual(s, mes);
          const mesSig = resumen.mes;
          const [y, m] = mesSig.split("-").map(Number);
          const dNext = new Date(y, m, 1);
          const mesSiguiente = `${dNext.getFullYear()}-${String(dNext.getMonth() + 1).padStart(2, "0")}`;
          set((st) => ({
            finanzas: {
              ...st.finanzas,
              resumenesMensuales: [...st.finanzas.resumenesMensuales, resumen],
              bancoRecompensas: { ...st.finanzas.bancoRecompensas, saldo: saldoBanco },
              presupuestos:
                bumpDineroUtilMesSiguiente > 0
                  ? st.finanzas.presupuestos.map((p) =>
                      p.mes === mesSiguiente ? { ...p, dineroUtil: p.dineroUtil + bumpDineroUtilMesSiguiente } : p
                    )
                  : st.finanzas.presupuestos,
            },
            usuario: proteccionGanada
              ? {
                  ...st.usuario,
                  protecciones: Math.min(
                    st.config.economia.proteccionesMaxAcumulables,
                    st.usuario.protecciones + 1
                  ),
                }
              : st.usuario,
          }));
          s = get();
        }
      },

      canjearRecompensa: (recompensaId) => {
        const s = get();
        const recompensa = s.config.catalogoRecompensas.find((r) => r.id === recompensaId);
        if (!recompensa || !recompensa.activa) return { ok: false, motivo: "Recompensa no disponible." };
        if (s.usuario.creditos < recompensa.costoCreditos) return { ok: false, motivo: "Créditos insuficientes." };
        if (s.finanzas.bancoRecompensas.saldo < recompensa.costoMXN) return { ok: false, motivo: "Saldo insuficiente en el Banco de Recompensas." };
        if (recompensa.limitePorMes !== null) {
          const esteMes = mesDe(hoyISO());
          const canjesEsteMes = s.canjes.filter((c) => c.recompensaId === recompensaId && mesDe(c.fecha) === esteMes).length;
          if (canjesEsteMes >= recompensa.limitePorMes) return { ok: false, motivo: "Límite de canjes del mes alcanzado." };
        }
        set((st) => ({
          usuario: { ...st.usuario, creditos: st.usuario.creditos - recompensa.costoCreditos },
          finanzas: {
            ...st.finanzas,
            bancoRecompensas: { ...st.finanzas.bancoRecompensas, saldo: st.finanzas.bancoRecompensas.saldo - recompensa.costoMXN },
          },
          canjes: [
            ...st.canjes,
            { id: generarId("cj"), recompensaId, nombre: recompensa.nombre, fecha: hoyISO(), costoCreditos: recompensa.costoCreditos, costoMXN: recompensa.costoMXN },
          ],
        }));
        return { ok: true };
      },

      actualizarPesos: (pesos) =>
        set((s) => ({ areas: s.areas.map((a) => ({ ...a, peso: pesos[a.id] ?? a.peso })) })),

      actualizarAreaConfig: (areaId, cambios) =>
        set((s) => ({ areas: s.areas.map((a) => (a.id === areaId ? { ...a, ...cambios } : a)) })),

      actualizarConfigEconomia: (cambios) =>
        set((s) => ({ config: { ...s.config, economia: { ...s.config.economia, ...cambios } } })),

      actualizarConfigImperio: (cambios) =>
        set((s) => ({ config: { ...s.config, imperio: { ...s.config.imperio, ...cambios } } })),

      actualizarTextos: (cambios) =>
        set((s) => ({ config: { ...s.config, textos: { ...s.config.textos, ...cambios } } })),

      setCatalogoRecompensas: (catalogo) => set((s) => ({ config: { ...s.config, catalogoRecompensas: catalogo } })),
      setCatalogoReconocimientos: (catalogo) => set((s) => ({ config: { ...s.config, catalogoReconocimientos: catalogo } })),
      setBonos: (bonos) => set((s) => ({ config: { ...s.config, bonos } })),

      aplicarPlanMensual: ({ mes, habitos, dineroUtil, gastosFijos, ahorro }) => {
        const s = get();
        const semanas = diasDelMes(mes) / 7;

        const areas = habitos.map(({ id, peso, metaMensual }) => {
          const plantilla = plantillaPorId(id);
          const existente = s.areas.find((a) => a.id === id);
          const metaSemanalBase = Math.round((metaMensual / semanas) * 100) / 100;
          if (!plantilla) {
            // hábito ya activo que no está en el catálogo (no debería pasar, pero por seguridad)
            return existente ? { ...existente, peso, metaSemanalBase } : areaDesdeCatalogo(id, peso);
          }
          const factor = plantilla.metaSemanalSugerida > 0 ? metaSemanalBase / plantilla.metaSemanalSugerida : 1;
          const metaDiaria =
            plantilla.metaDiariaSugerida === null ? null : Math.round(plantilla.metaDiariaSugerida * factor * 100) / 100;
          const topeMetaSemanal = Math.max(
            metaSemanalBase,
            Math.round(plantilla.topeMetaSemanalSugerida * factor * 100) / 100
          );
          return {
            id: plantilla.id,
            nombre: plantilla.nombre,
            dominio: plantilla.dominio,
            metrica: plantilla.metrica,
            unidad: plantilla.unidad,
            metaDiaria,
            metaSemanalBase,
            topeMetaSemanal,
            peso,
            color: plantilla.color,
            vinculoFinanciero: plantilla.vinculoFinanciero,
            nivel: existente?.nivel ?? 1,
            semanasConsecutivas: existente?.semanasConsecutivas ?? 0,
          };
        });

        const categorias: CategoriaPresupuesto[] = [
          ...gastosFijos
            .filter((g) => g.nombre.trim() && g.monto > 0)
            .map((g) => ({ id: generarId("cat"), nombre: g.nombre.trim(), tipo: "gasto" as const, modo: "fijo" as const, valor: g.monto })),
          ...(ahorro > 0
            ? [{ id: generarId("cat"), nombre: "Ahorro", tipo: "ahorro" as const, modo: "fijo" as const, valor: ahorro }]
            : []),
          { id: generarId("cat"), nombre: "Recompensas (el juego)", tipo: "recompensas" as const, modo: "resto" as const, valor: 0 },
        ];

        const yaExistePresupuesto = s.finanzas.presupuestos.some((p) => p.mes === mes);
        const presupuestos = yaExistePresupuesto
          ? s.finanzas.presupuestos.map((p) => (p.mes === mes ? { ...p, dineroUtil, categorias } : p))
          : [...s.finanzas.presupuestos, { mes, dineroUtil, categorias, modoAtipico: false }];

        set({
          areas,
          finanzas: { ...s.finanzas, presupuestos },
          planesMensuales: s.planesMensuales.includes(mes) ? s.planesMensuales : [...s.planesMensuales, mes],
        });
      },

      crearDesafio: (desafio) =>
        set((s) => ({
          temporadaActual: {
            ...s.temporadaActual,
            desafios: [...s.temporadaActual.desafios, { ...desafio, id: generarId("d"), completado: false }],
          },
        })),

      completarDesafio: (id) => {
        set((s) => ({
          temporadaActual: {
            ...s.temporadaActual,
            desafios: s.temporadaActual.desafios.map((d) =>
              d.id === id ? { ...d, completado: true, fechaCompletado: hoyISO() } : d
            ),
          },
        }));
      },

      eliminarDesafio: (id) =>
        set((s) => ({
          temporadaActual: { ...s.temporadaActual, desafios: s.temporadaActual.desafios.filter((d) => d.id !== id) },
        })),

      setRetoFinal: (descripcion) =>
        set((s) => ({ temporadaActual: { ...s.temporadaActual, retoFinal: { descripcion, completado: false } } })),

      completarRetoFinal: () =>
        set((s) => ({
          temporadaActual: {
            ...s.temporadaActual,
            retoFinal: { ...s.temporadaActual.retoFinal, completado: true, fechaCompletado: hoyISO() },
          },
        })),

      crearEvento: (evento) => {
        const s = get();
        const hoy = hoyISO();
        const activo = s.temporadaActual.eventos.find((e) => e.inicio <= hoy && hoy <= e.fin);
        if (activo) return { ok: false, motivo: "Ya hay un evento activo. Solo puede haber uno a la vez." };
        set((st) => ({
          temporadaActual: { ...st.temporadaActual, eventos: [...st.temporadaActual.eventos, { ...evento, id: generarId("ev") }] },
        }));
        return { ok: true };
      },

      finalizarEvento: (id) =>
        set((s) => ({
          temporadaActual: {
            ...s.temporadaActual,
            eventos: s.temporadaActual.eventos.map((e) => (e.id === id ? { ...e, fin: hoyISO() } : e)),
          },
        })),

      cerrarTemporada: (nombre, narrativa, semanas) => {
        const s = get();
        const cumplimientoPromedioPorArea = {} as Record<AreaId, number>;
        const cierresTemporada = s.cierresSemanales.filter(
          (c) => c.semanaInicio >= s.temporadaActual.inicio && c.semanaFin <= s.temporadaActual.fin
        );
        for (const a of s.areas) {
          const valores = cierresTemporada.map((c) => c.cumplimientoPorArea[a.id] ?? 0);
          cumplimientoPromedioPorArea[a.id] = valores.length ? valores.reduce((x, y) => x + y, 0) / valores.length : 0;
        }
        const presupuestado = s.finanzas.presupuestos
          .filter((p) => p.mes >= s.temporadaActual.inicio.slice(0, 7) && p.mes <= s.temporadaActual.fin.slice(0, 7))
          .reduce((acc, p) => acc + p.dineroUtil, 0);
        const gastado = s.finanzas.resumenesMensuales
          .filter((r) => r.mes >= s.temporadaActual.inicio.slice(0, 7) && r.mes <= s.temporadaActual.fin.slice(0, 7))
          .reduce((acc, r) => acc + r.totalGastado, 0);

        const historialTemporada = {
          id: s.temporadaActual.id,
          nombre: s.temporadaActual.nombre,
          inicio: s.temporadaActual.inicio,
          fin: hoyISO(),
          cumplimientoPromedioPorArea,
          ppTotales: s.usuario.ppTotales,
          gastadoVsPresupuestado: { gastado, presupuestado },
          reconocimientosObtenidos: s.historial.reconocimientos.length,
          retoFinalCompletado: s.temporadaActual.retoFinal.completado,
        };

        const nueva = temporadaDefault();
        set((st) => ({
          temporadaActual: {
            ...nueva,
            id: generarId("T"),
            nombre,
            narrativa,
            fin: sumarDias(nueva.inicio, semanas * 7 - 1),
          },
          historial: { ...st.historial, temporadas: [...st.historial.temporadas, historialTemporada] },
        }));
        const nuevos = evaluarReconocimientos(get());
        if (nuevos.length > 0) {
          set((st) => ({
            historial: {
              ...st.historial,
              reconocimientos: [...st.historial.reconocimientos, ...nuevos.map((id) => ({ id, fecha: hoyISO() }))],
            },
          }));
        }
      },

      cargarEstado: (estado) => set(estado),
      reiniciarConNombre: (nombre) => set(estadoInicial(nombre)),
    }),
    {
      name: "kaizen",
      storage: createJSONStorage(() => storageAdapter),
    }
  )
);

export function presupuestoDelMes(state: KaizenState, mes: string) {
  return state.finanzas.presupuestos.find((p) => p.mes === mes);
}

export function asignacionesDelMes(state: KaizenState, mes: string) {
  const p = presupuestoDelMes(state, mes);
  return p ? calcularAsignaciones(p) : new Map<string, number>();
}

export { inicioSemana, finSemana, diasDelMes, diaDelMes, semanasPendientes };
