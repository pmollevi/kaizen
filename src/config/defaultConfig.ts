import type {
  AreaConfig,
  Config,
  Finanzas,
  Historial,
  KaizenState,
  MetaMensual,
  Temporada,
  Usuario,
} from "@/types";
import { hoyISO, sumarDias } from "@/lib/dates";
import { CATALOGO_AREAS, plantillaPorId } from "@/config/areaCatalog";

export function areaDesdeCatalogo(id: string, peso: number): AreaConfig {
  const p = plantillaPorId(id);
  if (!p) throw new Error(`Hábito de catálogo desconocido: ${id}`);
  return {
    id: p.id,
    nombre: p.nombre,
    dominio: p.dominio,
    metrica: p.metrica,
    unidad: p.unidad,
    metaDiaria: p.metaDiariaSugerida,
    metaSemanalBase: p.metaSemanalSugerida,
    topeMetaSemanal: p.topeMetaSemanalSugerida,
    peso,
    color: p.color,
    nivel: 1,
    semanasConsecutivas: 0,
  };
}

// Selección inicial: los 6 hábitos clásicos, con los pesos originales.
const PESOS_DEFAULT: Record<string, number> = {
  intelecto: 0.35,
  imperio: 0.15,
  fuerza: 0.1,
  vitalidad: 0.2,
  energia: 0.15,
  sabiduria: 0.05,
};

export const AREAS_DEFAULT: AreaConfig[] = CATALOGO_AREAS.filter((p) => p.id in PESOS_DEFAULT).map((p) =>
  areaDesdeCatalogo(p.id, PESOS_DEFAULT[p.id])
);

export const USUARIO_DEFAULT: Usuario = {
  nombre: "",
  nivelGlobal: 1,
  ppTotales: 0,
  protecciones: 0,
  diasRachaCanjeados: 0,
  diasProtegidos: [],
  tituloActivo: null,
};

export const FINANZAS_DEFAULT: Finanzas = {
  categorias: [
    { id: "cat_comida", nombre: "Comida" },
    { id: "cat_transporte", nombre: "Transporte" },
    { id: "cat_vivienda", nombre: "Vivienda" },
    { id: "cat_salud", nombre: "Salud" },
    { id: "cat_ocio", nombre: "Ocio" },
    { id: "cat_otros", nombre: "Otros" },
  ],
  tarjetas: [],
  gastos: [],
  resumenesMensuales: [],
  resumenesTarjeta: [],
  ingresosMensuales: [],
};

export function temporadaDefault(): Temporada {
  const inicio = hoyISO();
  return {
    id: "T1",
    nombre: "Temporada 1",
    narrativa: "El inicio del camino. Cada semana cuenta, ninguna se borra.",
    inicio,
    fin: sumarDias(inicio, 7 * 12 - 1),
    retoFinal: { descripcion: "", completado: false },
    desafios: [],
    eventos: [],
    cerrada: false,
  };
}

export const METAS_MENSUALES_DEFAULT: MetaMensual[] = [];

export const HISTORIAL_DEFAULT: Historial = {
  temporadas: [],
  records: [],
  reconocimientos: [],
  nivelesMaximos: {
    intelecto: 1,
    imperio: 1,
    fuerza: 1,
    vitalidad: 1,
    energia: 1,
    sabiduria: 1,
  },
};

export const CONFIG_DEFAULT: Config = {
  textos: {
    nombreSistema: "Origo",
    atributos: "Áreas de desarrollo",
    xp: "Puntos de Progreso",
    escudos: "Protecciones",
    jefeTemporada: "Reto final de temporada",
    misiones: "Desafíos",
    logros: "Reconocimientos",
    salonFama: "Historial Permanente",
    radar: "Radar de desarrollo",
  },
  economia: {
    ppBase: 1000,
    curvaBase: 800,
    curvaExponente: 1.2,
    umbralNivelArea: 0.85,
    semanasParaNivelArea: 4,
    incrementoPorEtapa: 0.1,
    nivelesPorEtapa: 5,
    proteccionesMaxAcumulables: 3,
    umbralProteccionMensual: 0.85,
    ventanaProteccionHoras: 48,
    diasPorProteccion: 21, // 21 días de racha protegen una semana completa
    diasRegistroRetroactivo: 3,
  },
  bonos: [
    { id: "b_examen", nombre: "Examen aprobado", valorPP: 150 },
    { id: "b_calif", nombre: "Calificación sobre el umbral", valorPP: 100 },
    { id: "b_record", nombre: "Récord personal en gimnasio", valorPP: 80 },
    { id: "b_proyecto", nombre: "Proyecto entregado", valorPP: 150 },
    { id: "b_desafio", nombre: "Desafío completado", valorPP: 100 },
  ],
  catalogoReconocimientos: [
    {
      id: "ach_racha_4",
      nombre: "Constancia de hierro",
      descripcion: "4 semanas consecutivas sobre el 85% de cumplimiento global.",
      rareza: "Raro",
      categoria: "constancia",
      secreto: false,
    },
    {
      id: "ach_nivel_10",
      nombre: "Doble dígito",
      descripcion: "Alcanza el nivel 10 global.",
      rareza: "Épico",
      categoria: "volumen",
      secreto: false,
    },
    {
      id: "ach_gastos_90",
      nombre: "Bitácora completa",
      descripcion: "Registra 90 días consecutivos de gastos.",
      rareza: "Épico",
      categoria: "constancia",
      secreto: false,
    },
    {
      id: "ach_temporada_1",
      nombre: "Primera temporada",
      descripcion: "Completa tu primera temporada.",
      rareza: "Legendario",
      categoria: "temporada",
      secreto: false,
    },
    {
      id: "ach_secreto_1",
      nombre: "???",
      descripcion: "Cumple todos tus hábitos activos el mismo día, 7 días seguidos.",
      rareza: "Épico",
      categoria: "constancia",
      secreto: true,
    },
    {
      id: "ach_racha_7d",
      nombre: "Constante",
      descripcion: "7 días seguidos cumpliendo todos tus hábitos activos.",
      rareza: "Común",
      categoria: "constancia",
      secreto: false,
    },
    {
      id: "ach_racha_30d",
      nombre: "Disciplinado",
      descripcion: "30 días seguidos cumpliendo todos tus hábitos activos.",
      rareza: "Raro",
      categoria: "constancia",
      secreto: false,
    },
    {
      id: "ach_racha_90d",
      nombre: "Inquebrantable",
      descripcion: "90 días seguidos cumpliendo todos tus hábitos activos.",
      rareza: "Épico",
      categoria: "constancia",
      secreto: false,
    },
    {
      id: "ach_racha_365d",
      nombre: "Maestro Origo",
      descripcion: "365 días seguidos cumpliendo todos tus hábitos activos.",
      rareza: "Legendario",
      categoria: "constancia",
      secreto: false,
    },
  ],
};

export function estadoInicial(nombreUsuario: string): KaizenState {
  return {
    sistema: { nombre: "Origo", version: 2 },
    usuario: { ...USUARIO_DEFAULT, nombre: nombreUsuario },
    areas: AREAS_DEFAULT.map((a) => ({ ...a })),
    registrosDiarios: [],
    finanzas: {
      ...FINANZAS_DEFAULT,
      categorias: FINANZAS_DEFAULT.categorias.map((c) => ({ ...c })),
      tarjetas: [],
    },
    cierresSemanales: [],
    temporadaActual: temporadaDefault(),
    historial: {
      ...HISTORIAL_DEFAULT,
      nivelesMaximos: { ...HISTORIAL_DEFAULT.nivelesMaximos },
    },
    config: JSON.parse(JSON.stringify(CONFIG_DEFAULT)),
    planesMensuales: [],
    metasMensuales: [...METAS_MENSUALES_DEFAULT],
  };
}
