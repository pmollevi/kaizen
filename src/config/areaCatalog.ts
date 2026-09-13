// Catálogo de hábitos disponibles para el asistente de planeación mensual.
// El usuario activa los que quiera cada mes; el resto queda disponible pero inactivo.

export interface PlantillaArea {
  id: string;
  nombre: string;
  dominio: string;
  metrica: string;
  /** Una línea explicando qué se registra aquí — visible en el wizard y en las tarjetas de Hábitos. */
  descripcion: string;
  unidad: string;
  tipoMeta: "horas" | "binaria" | "conteo3" | "paginas" | "minutos" | "veces";
  metaDiariaSugerida: number | null;
  metaSemanalSugerida: number;
  topeMetaSemanalSugerida: number;
  color: string;
}

export const CATALOGO_AREAS: PlantillaArea[] = [
  {
    id: "intelecto",
    nombre: "Intelecto",
    dominio: "Academia / Estudio",
    metrica: "Horas de estudio",
    descripcion: "Registra las horas que dedicas a estudiar o aprender algo nuevo.",
    unidad: "h",
    tipoMeta: "horas",
    metaDiariaSugerida: 4,
    metaSemanalSugerida: 28,
    topeMetaSemanalSugerida: 42,
    color: "#6B7A8F",
  },
  {
    id: "imperio",
    nombre: "Imperio",
    dominio: "Negocio / Trabajo",
    metrica: "Horas de negocio",
    descripcion: "Registra las horas que le dedicas a tu negocio o trabajo enfocado.",
    unidad: "h",
    tipoMeta: "horas",
    metaDiariaSugerida: 1.5,
    metaSemanalSugerida: 10,
    topeMetaSemanalSugerida: 16,
    color: "#A97C50",
  },
  {
    id: "fuerza",
    nombre: "Fuerza",
    dominio: "Ejercicio",
    metrica: "Días entrenados",
    descripcion: "Marca si entrenaste hoy — fuerza, cardio o el deporte que practiques.",
    unidad: "días",
    tipoMeta: "binaria",
    metaDiariaSugerida: null,
    metaSemanalSugerida: 5,
    topeMetaSemanalSugerida: 5,
    color: "#B5624A",
  },
  {
    id: "vitalidad",
    nombre: "Vitalidad",
    dominio: "Alimentación",
    metrica: "Comidas correctas",
    descripcion: "Cuenta cuántas comidas de hoy fueron realmente saludables.",
    unidad: "comidas",
    tipoMeta: "conteo3",
    metaDiariaSugerida: 3,
    metaSemanalSugerida: 21,
    topeMetaSemanalSugerida: 21,
    color: "#5E8C5A",
  },
  {
    id: "energia",
    nombre: "Energía",
    dominio: "Sueño",
    metrica: "Horas dormidas",
    descripcion: "Registra cuántas horas dormiste esta noche.",
    unidad: "h",
    tipoMeta: "horas",
    metaDiariaSugerida: 7.5,
    metaSemanalSugerida: 52.5,
    topeMetaSemanalSugerida: 56,
    color: "#7E6C9E",
  },
  {
    id: "sabiduria",
    nombre: "Sabiduría",
    dominio: "Lectura",
    metrica: "Páginas leídas",
    descripcion: "Anota cuántas páginas leíste hoy, de cualquier libro.",
    unidad: "pág",
    tipoMeta: "paginas",
    metaDiariaSugerida: 15,
    metaSemanalSugerida: 105,
    topeMetaSemanalSugerida: 160,
    color: "#4F7C7A",
  },
  {
    id: "serenidad",
    nombre: "Serenidad",
    dominio: "Meditación",
    metrica: "Minutos meditados",
    descripcion: "Registra los minutos que meditaste o dedicaste a estar en calma.",
    unidad: "min",
    tipoMeta: "minutos",
    metaDiariaSugerida: 10,
    metaSemanalSugerida: 70,
    topeMetaSemanalSugerida: 140,
    color: "#8FA084",
  },
  {
    id: "vinculos",
    nombre: "Vínculos",
    dominio: "Relaciones",
    metrica: "Momentos de calidad en familia/pareja/amigos",
    descripcion: "Registra si tuviste un momento real de conexión con alguien importante para ti.",
    unidad: "veces",
    tipoMeta: "veces",
    metaDiariaSugerida: null,
    metaSemanalSugerida: 4,
    topeMetaSemanalSugerida: 7,
    color: "#A9667A",
  },
  {
    id: "creatividad",
    nombre: "Creatividad",
    dominio: "Hobby / Arte",
    metrica: "Minutos en un hobby o proyecto creativo",
    descripcion: "Anota los minutos que dedicaste a tu hobby o proyecto creativo.",
    unidad: "min",
    tipoMeta: "minutos",
    metaDiariaSugerida: 20,
    metaSemanalSugerida: 140,
    topeMetaSemanalSugerida: 280,
    color: "#A79BC0",
  },
  {
    id: "gratitud",
    nombre: "Gratitud",
    dominio: "Bienestar emocional",
    metrica: "Registros de gratitud o diario",
    descripcion: "Anota algo bueno que te pasó hoy o alguien a quien agradeces.",
    unidad: "registros",
    tipoMeta: "binaria",
    metaDiariaSugerida: null,
    metaSemanalSugerida: 5,
    topeMetaSemanalSugerida: 7,
    color: "#C9AA5C",
  },
];

export function plantillaPorId(id: string): PlantillaArea | undefined {
  return CATALOGO_AREAS.find((p) => p.id === id);
}
