// Catálogo de hábitos disponibles para el asistente de planeación mensual.
// El usuario activa los que quiera cada mes; el resto queda disponible pero inactivo.

export interface PlantillaArea {
  id: string;
  nombre: string;
  dominio: string;
  metrica: string;
  unidad: string;
  tipoMeta: "horas" | "binaria" | "conteo3" | "paginas" | "minutos" | "veces";
  metaDiariaSugerida: number | null;
  metaSemanalSugerida: number;
  topeMetaSemanalSugerida: number;
  color: string;
  vinculoFinanciero?: boolean;
}

export const CATALOGO_AREAS: PlantillaArea[] = [
  {
    id: "intelecto",
    nombre: "Intelecto",
    dominio: "Academia / Estudio",
    metrica: "Horas de estudio",
    unidad: "h",
    tipoMeta: "horas",
    metaDiariaSugerida: 4,
    metaSemanalSugerida: 28,
    topeMetaSemanalSugerida: 42,
    color: "#5b8def",
  },
  {
    id: "imperio",
    nombre: "Imperio",
    dominio: "Negocio / Trabajo",
    metrica: "Horas de negocio + cumplimiento financiero",
    unidad: "h",
    tipoMeta: "horas",
    metaDiariaSugerida: 1.5,
    metaSemanalSugerida: 10,
    topeMetaSemanalSugerida: 16,
    color: "#e0a63a",
    vinculoFinanciero: true,
  },
  {
    id: "fuerza",
    nombre: "Fuerza",
    dominio: "Ejercicio",
    metrica: "Días entrenados",
    unidad: "días",
    tipoMeta: "binaria",
    metaDiariaSugerida: null,
    metaSemanalSugerida: 5,
    topeMetaSemanalSugerida: 5,
    color: "#e0544f",
  },
  {
    id: "vitalidad",
    nombre: "Vitalidad",
    dominio: "Alimentación",
    metrica: "Comidas correctas",
    unidad: "comidas",
    tipoMeta: "conteo3",
    metaDiariaSugerida: 3,
    metaSemanalSugerida: 21,
    topeMetaSemanalSugerida: 21,
    color: "#4cb782",
  },
  {
    id: "energia",
    nombre: "Energía",
    dominio: "Sueño",
    metrica: "Horas dormidas",
    unidad: "h",
    tipoMeta: "horas",
    metaDiariaSugerida: 7.5,
    metaSemanalSugerida: 52.5,
    topeMetaSemanalSugerida: 56,
    color: "#9b6fe0",
  },
  {
    id: "sabiduria",
    nombre: "Sabiduría",
    dominio: "Lectura",
    metrica: "Páginas leídas",
    unidad: "pág",
    tipoMeta: "paginas",
    metaDiariaSugerida: 15,
    metaSemanalSugerida: 105,
    topeMetaSemanalSugerida: 160,
    color: "#3ab5c6",
  },
  {
    id: "serenidad",
    nombre: "Serenidad",
    dominio: "Meditación",
    metrica: "Minutos meditados",
    unidad: "min",
    tipoMeta: "minutos",
    metaDiariaSugerida: 10,
    metaSemanalSugerida: 70,
    topeMetaSemanalSugerida: 140,
    color: "#63c7b2",
  },
  {
    id: "vinculos",
    nombre: "Vínculos",
    dominio: "Relaciones",
    metrica: "Momentos de calidad en familia/pareja/amigos",
    unidad: "veces",
    tipoMeta: "veces",
    metaDiariaSugerida: null,
    metaSemanalSugerida: 4,
    topeMetaSemanalSugerida: 7,
    color: "#e06fa8",
  },
  {
    id: "creatividad",
    nombre: "Creatividad",
    dominio: "Hobby / Arte",
    metrica: "Minutos en un hobby o proyecto creativo",
    unidad: "min",
    tipoMeta: "minutos",
    metaDiariaSugerida: 20,
    metaSemanalSugerida: 140,
    topeMetaSemanalSugerida: 280,
    color: "#c68fe0",
  },
  {
    id: "gratitud",
    nombre: "Gratitud",
    dominio: "Bienestar emocional",
    metrica: "Registros de gratitud o diario",
    unidad: "registros",
    tipoMeta: "binaria",
    metaDiariaSugerida: null,
    metaSemanalSugerida: 5,
    topeMetaSemanalSugerida: 7,
    color: "#e0c23a",
  },
];

export function plantillaPorId(id: string): PlantillaArea | undefined {
  return CATALOGO_AREAS.find((p) => p.id === id);
}
