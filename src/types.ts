// Modelo de datos completo de Origo. Ver docs/spec para el detalle de cada regla.

// Antes era una unión cerrada de 6 valores; ahora cualquier hábito del catálogo
// (o uno futuro) puede activarse, así que el id es un string libre.
export type AreaId = string;

export interface AreaConfig {
  id: AreaId;
  nombre: string;
  dominio: string;
  metrica: string;
  unidad: string;
  metaDiaria: number | null; // null = sin meta diaria (ej. Fuerza)
  metaSemanalBase: number;
  topeMetaSemanal: number; // tope máximo tras progresión por etapas
  peso: number; // 0-1, deben sumar 1 entre todas las áreas activas
  color: string; // color hex, ej. "#4D8DFF"
  nivel: number;
  semanasConsecutivas: number; // contador hacia el siguiente nivel de área
}

export interface RegistroDiario {
  id: string;
  fecha: string; // YYYY-MM-DD
  valores: Record<AreaId, number>;
  observacion: string;
  creadoEn: string; // ISO timestamp, para detectar registro tardío
}

export type MetodoPago = "efectivo" | "tarjeta";

export interface CategoriaGasto {
  id: string;
  nombre: string;
}

export interface Tarjeta {
  id: string;
  nombre: string;
  diaCorte: number; // 1-31
}

export interface Gasto {
  id: string;
  fecha: string; // YYYY-MM-DD
  monto: number;
  categoriaId: string;
  palabraClave: string;
  metodo: MetodoPago;
  tarjetaId?: string; // solo si metodo === "tarjeta"
  nota?: string;
}

export interface DistribucionCategoria {
  categoriaId: string;
  nombre: string;
  monto: number;
  porcentaje: number; // 0-1
}

export interface ResumenTarjeta {
  id: string;
  tarjetaId: string;
  periodoInicio: string;
  periodoFin: string;
  totalGastado: number;
  numeroGastos: number;
  categorias: DistribucionCategoria[];
}

export interface ResumenMensual {
  mes: string;
  totalGastado: number;
  totalEfectivo: number;
  totalTarjeta: number;
  categorias: DistribucionCategoria[];
  topCategorias: DistribucionCategoria[]; // top 3
  gastoPromedioDiario: number;
  diaMasCaro: { fecha: string; monto: number } | null;
  comparativaMesesAnteriores: { mes: string; totalGastado: number }[];
  promedioHistorico: number;
}

export interface IngresoMensual {
  mes: string; // YYYY-MM
  monto: number;
}

export interface Finanzas {
  categorias: CategoriaGasto[];
  tarjetas: Tarjeta[]; // máx 3, garantizado por el store
  gastos: Gasto[];
  resumenesMensuales: ResumenMensual[];
  resumenesTarjeta: ResumenTarjeta[];
  ingresosMensuales: IngresoMensual[]; // opcional; solo para comparar gasto vs. ingreso del mes
}

export interface CierreSemanal {
  id: string;
  semanaInicio: string; // lunes YYYY-MM-DD
  semanaFin: string; // domingo YYYY-MM-DD
  cumplimientoPorArea: Record<AreaId, number>;
  cumplimientoGlobal: number;
  ppBase: number;
  bonosAplicados: { id: string; nombre: string; valorPP: number }[];
  ppGanados: number;
  protegida: boolean;
  nivelesAreaSubidos: AreaId[];
}

export interface ReconocimientoCatalogo {
  id: string;
  nombre: string;
  descripcion: string;
  rareza: "Común" | "Raro" | "Épico" | "Legendario";
  categoria: "constancia" | "volumen" | "records" | "temporada";
  secreto: boolean;
}

export interface ReconocimientoDesbloqueado {
  id: string;
  fecha: string;
}

export interface Desafio {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: "semanal" | "mensual" | "temporada";
  dificultad: "baja" | "media" | "alta";
  fechaLimite: string;
  completado: boolean;
  fechaCompletado?: string;
  ppRecompensa: number;
}

export interface RetoFinal {
  descripcion: string;
  completado: boolean;
  fechaCompletado?: string;
}

export interface Evento {
  id: string;
  nombre: string;
  descripcion: string;
  inicio: string;
  fin: string;
  efecto: string; // texto descriptivo del efecto aplicado
  areaAfectada?: AreaId;
  modificadorPeso?: number;
}

export interface Temporada {
  id: string;
  nombre: string;
  narrativa: string;
  inicio: string;
  fin: string;
  retoFinal: RetoFinal;
  desafios: Desafio[];
  eventos: Evento[];
  cerrada: boolean;
}

export interface TemporadaHistorial {
  id: string;
  nombre: string;
  inicio: string;
  fin: string;
  cumplimientoPromedioPorArea: Record<AreaId, number>;
  ppTotales: number;
  gastoTotalTemporada: number;
  reconocimientosObtenidos: number;
  retoFinalCompletado: boolean;
}

export interface MetaMensual {
  mes: string; // YYYY-MM
  descripcion: string;
  cumplida: boolean | null; // null hasta que el usuario la marque al terminar el mes
}

export interface RecordHistorico {
  id: string;
  areaId: AreaId | null;
  descripcion: string;
  valor: number;
  fecha: string;
}

export interface Historial {
  temporadas: TemporadaHistorial[];
  records: RecordHistorico[];
  reconocimientos: ReconocimientoDesbloqueado[];
  nivelesMaximos: Record<AreaId, number>;
}

export interface Bono {
  id: string;
  nombre: string;
  valorPP: number;
}

export interface ConfigEconomia {
  ppBase: number;
  curvaBase: number;
  curvaExponente: number;
  umbralNivelArea: number; // 0.85
  semanasParaNivelArea: number; // 4
  incrementoPorEtapa: number; // 0.10
  nivelesPorEtapa: number; // 5
  proteccionesMaxAcumulables: number; // 3
  umbralProteccionMensual: number; // 0.85
  ventanaProteccionHoras: number; // 48
  diasPorProteccion: number; // días de racha diaria que se canjean por 1 protección
  diasRegistroRetroactivo: number; // 3
}

export interface Textos {
  nombreSistema: string;
  atributos: string;
  xp: string;
  escudos: string;
  jefeTemporada: string;
  misiones: string;
  logros: string;
  salonFama: string;
  radar: string;
}

export interface Config {
  textos: Textos;
  economia: ConfigEconomia;
  bonos: Bono[];
  catalogoReconocimientos: ReconocimientoCatalogo[];
}

export interface Usuario {
  nombre: string;
  nivelGlobal: number;
  ppTotales: number;
  protecciones: number;
  diasRachaCanjeados: number; // ledger: días de racha ya cambiados por protecciones
  tituloActivo: string | null;
}

export interface KaizenState {
  sistema: { nombre: string; version: number };
  usuario: Usuario;
  areas: AreaConfig[];
  registrosDiarios: RegistroDiario[];
  finanzas: Finanzas;
  cierresSemanales: CierreSemanal[];
  temporadaActual: Temporada;
  historial: Historial;
  config: Config;
  planesMensuales: string[]; // meses (YYYY-MM) para los que ya se completó el asistente de planeación
  metasMensuales: MetaMensual[];
}
