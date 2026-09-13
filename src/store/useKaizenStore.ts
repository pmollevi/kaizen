import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AreaId,
  Desafio,
  Evento,
  Gasto,
  KaizenState,
  ReconocimientoCatalogo,
  Tarjeta,
} from "@/types";
import { areaDesdeCatalogo, estadoInicial, temporadaDefault } from "@/config/defaultConfig";
import { plantillaPorId } from "@/config/areaCatalog";
import { claveDatos, getPerfilActivo } from "@/store/profiles";
import { generarId } from "@/lib/id";
import { finSemana, hoyISO, inicioSemana, mesDe, sumarDias } from "@/lib/dates";
import {
  calcularCierreMensual,
  calcularCierreSemanal,
  mesesPendientesDeCierre,
  resumenesTarjetaPendientes,
  semanasPendientes,
} from "@/lib/cierre";
import { HITOS_RACHA, evaluarReconocimientos, rachaDiariaVigente } from "@/lib/achievements";

const MAX_TARJETAS = 3;

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

  agregarGasto: (gasto: Omit<Gasto, "id">) => void;
  eliminarGasto: (id: string) => void;
  agregarCategoriaGasto: (nombre: string) => void;
  eliminarCategoriaGasto: (id: string) => void;
  agregarTarjeta: (tarjeta: Omit<Tarjeta, "id">) => { ok: boolean; motivo?: string };
  editarTarjeta: (id: string, cambios: Partial<Omit<Tarjeta, "id">>) => void;
  eliminarTarjeta: (id: string) => void;
  setIngresoMensual: (mes: string, monto: number) => void;

  cerrarSemana: (inicio: string, bonosIds: string[], proteger: boolean) => void;
  procesarCierresMensualesPendientes: () => void;

  canjearRachaPorProteccion: () => { ok: boolean; motivo?: string };

  actualizarPesos: (pesos: Record<AreaId, number>) => void;
  actualizarAreaConfig: (areaId: AreaId, cambios: Partial<{ metaDiaria: number | null; metaSemanalBase: number; topeMetaSemanal: number }>) => void;
  actualizarConfigEconomia: (cambios: Partial<KaizenState["config"]["economia"]>) => void;
  actualizarTextos: (cambios: Partial<KaizenState["config"]["textos"]>) => void;
  setCatalogoReconocimientos: (catalogo: ReconocimientoCatalogo[]) => void;
  setBonos: (bonos: KaizenState["config"]["bonos"]) => void;

  aplicarPlanMensual: (input: {
    mes: string;
    habitos: { id: string; peso: number; metaSemanal: number }[];
  }) => void;

  setMetaMensual: (mes: string, descripcion: string) => void;
  marcarMetaMensual: (mes: string, cumplida: boolean) => void;

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

      registrarDia: (fecha, valores, observacion) => {
        set((s) => ({
          registrosDiarios: [
            ...s.registrosDiarios.filter((r) => r.fecha !== fecha),
            { id: generarId("r"), fecha, valores, observacion, creadoEn: new Date().toISOString() },
          ],
        }));
        const nuevos = evaluarReconocimientos(get());
        if (nuevos.length > 0) {
          const hito = [...HITOS_RACHA].reverse().find((h) => nuevos.includes(h.id));
          set((st) => ({
            historial: {
              ...st.historial,
              reconocimientos: [...st.historial.reconocimientos, ...nuevos.map((id) => ({ id, fecha: hoyISO() }))],
            },
            usuario: hito ? { ...st.usuario, tituloActivo: hito.id } : st.usuario,
          }));
        }
      },

      editarRegistro: (id, valores, observacion) =>
        set((s) => ({
          registrosDiarios: s.registrosDiarios.map((r) => (r.id === id ? { ...r, valores, observacion } : r)),
        })),

      eliminarRegistro: (id) => set((s) => ({ registrosDiarios: s.registrosDiarios.filter((r) => r.id !== id) })),

      agregarGasto: (gasto) =>
        set((s) => ({
          finanzas: { ...s.finanzas, gastos: [...s.finanzas.gastos, { ...gasto, id: generarId("g") }] },
        })),

      eliminarGasto: (id) =>
        set((s) => ({ finanzas: { ...s.finanzas, gastos: s.finanzas.gastos.filter((g) => g.id !== id) } })),

      agregarCategoriaGasto: (nombre) => {
        if (!nombre.trim()) return;
        set((s) => ({
          finanzas: {
            ...s.finanzas,
            categorias: [...s.finanzas.categorias, { id: generarId("cat"), nombre: nombre.trim() }],
          },
        }));
      },

      eliminarCategoriaGasto: (id) =>
        set((s) => ({
          finanzas: { ...s.finanzas, categorias: s.finanzas.categorias.filter((c) => c.id !== id) },
        })),

      agregarTarjeta: (tarjeta) => {
        const s = get();
        if (s.finanzas.tarjetas.length >= MAX_TARJETAS) {
          return { ok: false, motivo: `Ya tienes ${MAX_TARJETAS} tarjetas registradas.` };
        }
        if (!tarjeta.nombre.trim()) return { ok: false, motivo: "Ponle un nombre a la tarjeta." };
        set((st) => ({
          finanzas: {
            ...st.finanzas,
            tarjetas: [...st.finanzas.tarjetas, { ...tarjeta, id: generarId("tj"), nombre: tarjeta.nombre.trim() }],
          },
        }));
        return { ok: true };
      },

      editarTarjeta: (id, cambios) =>
        set((s) => ({
          finanzas: {
            ...s.finanzas,
            tarjetas: s.finanzas.tarjetas.map((t) => (t.id === id ? { ...t, ...cambios } : t)),
          },
        })),

      eliminarTarjeta: (id) =>
        set((s) => ({ finanzas: { ...s.finanzas, tarjetas: s.finanzas.tarjetas.filter((t) => t.id !== id) } })),

      setIngresoMensual: (mes, monto) =>
        set((s) => {
          const existe = s.finanzas.ingresosMensuales.some((i) => i.mes === mes);
          const ingresosMensuales = existe
            ? s.finanzas.ingresosMensuales.map((i) => (i.mes === mes ? { ...i, monto } : i))
            : [...s.finanzas.ingresosMensuales, { mes, monto }];
          return { finanzas: { ...s.finanzas, ingresosMensuales } };
        }),

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
        const hoy = hoyISO();
        const mesActual = mesDe(hoy);
        let s = get();
        const pendientes = mesesPendientesDeCierre(s, mesActual);
        for (const mes of pendientes) {
          const { resumen, proteccionGanada } = calcularCierreMensual(s, mes);
          set((st) => ({
            finanzas: { ...st.finanzas, resumenesMensuales: [...st.finanzas.resumenesMensuales, resumen] },
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

        const nuevosResumenesTarjeta = resumenesTarjetaPendientes(s, hoy);
        if (nuevosResumenesTarjeta.length > 0) {
          set((st) => ({
            finanzas: {
              ...st.finanzas,
              resumenesTarjeta: [...st.finanzas.resumenesTarjeta, ...nuevosResumenesTarjeta],
            },
          }));
        }
      },

      canjearRachaPorProteccion: () => {
        const s = get();
        const racha = rachaDiariaVigente(s);
        const disponible = Math.max(0, racha - s.usuario.diasRachaCanjeados);
        if (disponible < s.config.economia.diasPorProteccion) {
          return { ok: false, motivo: `Necesitas ${s.config.economia.diasPorProteccion} días de racha seguidos. Llevas ${disponible}.` };
        }
        if (s.usuario.protecciones >= s.config.economia.proteccionesMaxAcumulables) {
          return { ok: false, motivo: "Ya tienes el máximo de protecciones acumuladas." };
        }
        set((st) => ({
          usuario: {
            ...st.usuario,
            diasRachaCanjeados: st.usuario.diasRachaCanjeados + st.config.economia.diasPorProteccion,
            protecciones: Math.min(st.config.economia.proteccionesMaxAcumulables, st.usuario.protecciones + 1),
          },
        }));
        return { ok: true };
      },

      actualizarPesos: (pesos) =>
        set((s) => ({ areas: s.areas.map((a) => ({ ...a, peso: pesos[a.id] ?? a.peso })) })),

      actualizarAreaConfig: (areaId, cambios) =>
        set((s) => ({ areas: s.areas.map((a) => (a.id === areaId ? { ...a, ...cambios } : a)) })),

      actualizarConfigEconomia: (cambios) =>
        set((s) => ({ config: { ...s.config, economia: { ...s.config.economia, ...cambios } } })),

      actualizarTextos: (cambios) =>
        set((s) => ({ config: { ...s.config, textos: { ...s.config.textos, ...cambios } } })),

      setCatalogoReconocimientos: (catalogo) => set((s) => ({ config: { ...s.config, catalogoReconocimientos: catalogo } })),
      setBonos: (bonos) => set((s) => ({ config: { ...s.config, bonos } })),

      aplicarPlanMensual: ({ mes, habitos }) => {
        const s = get();

        const areas = habitos.map(({ id, peso, metaSemanal }) => {
          const plantilla = plantillaPorId(id);
          const existente = s.areas.find((a) => a.id === id);
          const metaSemanalBase = Math.round(metaSemanal * 100) / 100;
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
            nivel: existente?.nivel ?? 1,
            semanasConsecutivas: existente?.semanasConsecutivas ?? 0,
          };
        });

        set({
          areas,
          planesMensuales: s.planesMensuales.includes(mes) ? s.planesMensuales : [...s.planesMensuales, mes],
        });
      },

      setMetaMensual: (mes, descripcion) =>
        set((s) => {
          const existe = s.metasMensuales.some((m) => m.mes === mes);
          const metasMensuales = existe
            ? s.metasMensuales.map((m) => (m.mes === mes ? { ...m, descripcion } : m))
            : [...s.metasMensuales, { mes, descripcion, cumplida: null }];
          return { metasMensuales };
        }),

      marcarMetaMensual: (mes, cumplida) =>
        set((s) => ({
          metasMensuales: s.metasMensuales.map((m) => (m.mes === mes ? { ...m, cumplida } : m)),
        })),

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
        const gastoTotalTemporada = s.finanzas.gastos
          .filter((g) => g.fecha >= s.temporadaActual.inicio && g.fecha <= s.temporadaActual.fin)
          .reduce((acc, g) => acc + g.monto, 0);

        const historialTemporada = {
          id: s.temporadaActual.id,
          nombre: s.temporadaActual.nombre,
          inicio: s.temporadaActual.inicio,
          fin: hoyISO(),
          cumplimientoPromedioPorArea,
          ppTotales: s.usuario.ppTotales,
          gastoTotalTemporada,
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
      // Merge profundo: un perfil guardado antes de que existiera un campo nuevo
      // (usuario, finanzas o config) no debe perderlo por un reemplazo superficial.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<KaizenState>;
        return {
          ...current,
          ...p,
          usuario: { ...current.usuario, ...(p.usuario ?? {}) },
          finanzas: { ...current.finanzas, ...(p.finanzas ?? {}) },
          config: {
            ...current.config,
            ...(p.config ?? {}),
            economia: { ...current.config.economia, ...(p.config?.economia ?? {}) },
            textos: { ...current.config.textos, ...(p.config?.textos ?? {}) },
          },
        };
      },
    }
  )
);

export { inicioSemana, finSemana, semanasPendientes };
export { diasDelMes, diaDelMes } from "@/lib/dates";
