import React from "react";

// Ori, la mascota de Origo: el aro incompleto del logo se convierte en su
// cuerpo. El corte del aro se cierra mientras sostienes tu racha (reposo →
// gap; celebrando → aro completo) y se "rompe" en pedazos cuando la racha se
// pierde (enojado). Ver diseño de referencia (Artifact "Ori").

export type OriMode = "habito" | "finanzas";
export type OriState = "reposo" | "celebrando" | "enojado" | "protegido";
export type OriSize = "sm" | "lg";

const TAMANO_PX: Record<OriSize, number> = { sm: 46, lg: 150 };

// Gap del aro en reposo/protegido: un arco casi completo con un pequeño corte
// (352/440 de circunferencia visible). Enojado usa un patrón de 3 segmentos
// para leerse como un aro "roto". Celebrando no lleva dasharray: aro cerrado.
const RING_GAP = { strokeDasharray: "352 88", strokeDashoffset: "-42" };
const RING_ROTO = { strokeDasharray: "46 10 46 10 46 10", strokeDashoffset: "-20" };

const RING_GRADIENTE: Record<OriMode, Record<OriState, string>> = {
  habito: {
    reposo: "ori-ringGrad",
    protegido: "ori-ringGrad",
    enojado: "ori-ringGradDim",
    celebrando: "ori-ringGradBright",
  },
  finanzas: {
    reposo: "ori-ringGradFin",
    protegido: "ori-ringGradFin",
    enojado: "ori-ringGradWarn",
    celebrando: "ori-ringGradBright",
  },
};

// Pupilas del rostro "contento" (reposo/protegido): verde en hábitos, azul en finanzas.
const PUPILA_CONTENTO: Record<OriMode, string> = { habito: "#c7d795", finanzas: "#a9c4cf" };
// Rostro "preocupado" (enojado): más apagado en hábitos, más vivo/alerta en finanzas.
const CARA_PREOCUPADO: Record<OriMode, { sclera: string; pupila: string }> = {
  habito: { sclera: "#dcd9c8", pupila: "#8f9180" },
  finanzas: { sclera: "#f1ede0", pupila: "#e3a878" },
};

/** Degradados y filtro de Ori, compartidos por todas sus instancias — montar
 * una sola vez a nivel de app (ver App.tsx) para no repetir <defs>. */
export function OriDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id="ori-ringGrad" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#c7d795" />
          <stop offset="55%" stopColor="#8b9a5c" />
          <stop offset="100%" stopColor="#5c6640" />
        </linearGradient>
        <linearGradient id="ori-ringGradBright" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#eef4d6" />
          <stop offset="55%" stopColor="#c7d795" />
          <stop offset="100%" stopColor="#93a463" />
        </linearGradient>
        <linearGradient id="ori-ringGradDim" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#71765a" />
          <stop offset="100%" stopColor="#43462f" />
        </linearGradient>
        <linearGradient id="ori-ringGradFin" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#a9c4cf" />
          <stop offset="55%" stopColor="#6b7f8a" />
          <stop offset="100%" stopColor="#414d55" />
        </linearGradient>
        <linearGradient id="ori-ringGradWarn" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#e3a878" />
          <stop offset="55%" stopColor="#c08653" />
          <stop offset="100%" stopColor="#7a4f2e" />
        </linearGradient>
        <filter id="ori-softGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

/** Cara "contenta" sin insignia — reposo. */
function CaraIdle({ pupila }: { pupila: string }) {
  return (
    <>
      <path d="M75 85 Q82 81 89 84" stroke="#f1ede0" strokeWidth={3.2} fill="none" strokeLinecap="round" />
      <path d="M111 84 Q118 81 125 85" stroke="#f1ede0" strokeWidth={3.2} fill="none" strokeLinecap="round" />
      <circle cx={82} cy={98} r={7} fill="#f1ede0" />
      <circle cx={79.3} cy={95.3} r={2.2} fill={pupila} />
      <circle cx={118} cy={98} r={7} fill="#f1ede0" />
      <circle cx={115.3} cy={95.3} r={2.2} fill={pupila} />
      <path d="M85 122 Q100 130 115 122" stroke="#f1ede0" strokeWidth={4} fill="none" strokeLinecap="round" />
    </>
  );
}

/** Cara "contenta" con espacio para insignia arriba-derecha — protegido. */
function CaraConInsignia({ pupila }: { pupila: string }) {
  return (
    <>
      <path d="M76 86 Q82 83 88 85" stroke="#f1ede0" strokeWidth={3.2} fill="none" strokeLinecap="round" />
      <path d="M112 85 Q118 83 124 86" stroke="#f1ede0" strokeWidth={3.2} fill="none" strokeLinecap="round" />
      <circle cx={82} cy={98} r={7} fill="#f1ede0" />
      <circle cx={79.3} cy={95.3} r={2.2} fill={pupila} />
      <circle cx={118} cy={98} r={7} fill="#f1ede0" />
      <circle cx={115.3} cy={95.3} r={2.2} fill={pupila} />
      <path d="M87 119 Q100 126 113 119" stroke="#f1ede0" strokeWidth={4} fill="none" strokeLinecap="round" />
    </>
  );
}

/** Cara "preocupada" — enojado (racha rota / gasto alto). */
function CaraPreocupada({ sclera, pupila }: { sclera: string; pupila: string }) {
  return (
    <>
      <path d="M73 87 L91 94" stroke={sclera} strokeWidth={3.8} strokeLinecap="round" />
      <path d="M127 87 L109 94" stroke={sclera} strokeWidth={3.8} strokeLinecap="round" />
      <circle cx={82} cy={104} r={6} fill={sclera} />
      <circle cx={79.8} cy={101.8} r={1.7} fill={pupila} />
      <circle cx={118} cy={104} r={6} fill={sclera} />
      <circle cx={115.8} cy={101.8} r={1.7} fill={pupila} />
      <path d="M87 126 Q100 120 113 126" stroke={sclera} strokeWidth={4} fill="none" strokeLinecap="round" />
    </>
  );
}

/** Cara feliz + chispas — celebrando (pantalla grande, solo modo hábito). */
function CaraCelebrando() {
  const chispas = [
    { d: "M150 44 l3 8 8 3 -8 3 -3 8 -3-8 -8-3 8-3z", delay: "0s" },
    { d: "M42 58 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5-6 -6-2.5 6-2.5z", delay: "0s" },
    { d: "M160 128 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5-6 -6-2.5 6-2.5z", delay: "0.25s" },
    { d: "M52 138 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2z", delay: "0.5s" },
  ];
  return (
    <>
      {chispas.map((c, i) => (
        <path
          key={i}
          d={c.d}
          fill="#f1ede0"
          className="motion-safe:animate-ori-twinkle"
          style={{ transformOrigin: "center", animationDelay: c.delay }}
        />
      ))}
      <path d="M74 79 Q82 71 90 78" stroke="#22260f" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M110 78 Q118 71 126 79" stroke="#22260f" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M75 96 Q82 88 89 96" stroke="#22260f" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M111 96 Q118 88 125 96" stroke="#22260f" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M78 114 Q100 136 122 114" stroke="#22260f" strokeWidth={5} fill="none" strokeLinecap="round" />
    </>
  );
}

/** Insignia de escudo (protegido, modo hábito) — se usó una protección. */
function InsigniaEscudo() {
  return (
    <g transform="translate(146,52)" className="motion-safe:animate-ori-shimmer" style={{ transformOrigin: "center" }}>
      <path d="M0 0 L16 5 V18 C16 27 8 33 0 36 C-8 33 -16 27 -16 18 V5 Z" fill="url(#ori-ringGradBright)" />
      <path d="M-6 17 L-1 22 L8 11" stroke="#22260f" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Insignia de tarjeta (protegido, modo finanzas) — corte de tarjeta próximo. */
function InsigniaTarjeta() {
  return (
    <>
      <rect x={130} y={38} width={40} height={34} rx={11} fill="#1c1f13" stroke="#e3a878" strokeWidth={1.4} />
      <rect x={137} y={47} width={26} height={17} rx={2.5} fill="none" stroke="#e3a878" strokeWidth={2} />
      <rect x={137} y={51} width={26} height={4} fill="#e3a878" />
    </>
  );
}

export interface OriIconProps {
  /** Verde (hábitos) o gris-azulado/ámbar (finanzas) — decide el degradado del aro. */
  mode: OriMode;
  /** Decide la cara, el cierre del aro y (en finanzas) si se dibuja el chip de tarjeta. */
  state: OriState;
  /** "sm" = compañero junto a la racha (~46px). "lg" = momento de celebración (~150px, con glow). */
  size?: OriSize;
  className?: string;
  /** Texto accesible; por defecto describe mode+state. */
  title?: string;
}

const TITULO_POR_DEFECTO: Record<OriState, string> = {
  reposo: "Ori: todo en orden",
  celebrando: "Ori celebrando",
  enojado: "Ori preocupado",
  protegido: "Ori protegido",
};

export function OriIcon({ mode, state, size = "sm", className = "", title }: OriIconProps) {
  const px = TAMANO_PX[size];
  const ring = `url(#${RING_GRADIENTE[mode][state]})`;
  const glow = size === "lg" ? "url(#ori-softGlow)" : undefined;

  let ringProps: React.SVGProps<SVGCircleElement> = {};
  let cuerpoClase = "";
  let contenido: React.ReactNode = null;

  if (state === "celebrando") {
    ringProps = {};
    cuerpoClase = "motion-safe:animate-ori-bounce";
    contenido = <CaraCelebrando />;
  } else if (state === "enojado") {
    ringProps = { ...RING_ROTO, transform: "rotate(-90 100 100)" };
    cuerpoClase = "motion-safe:animate-ori-wobble";
    const { sclera, pupila } = CARA_PREOCUPADO[mode];
    contenido = <CaraPreocupada sclera={sclera} pupila={pupila} />;
  } else if (state === "protegido") {
    ringProps = { ...RING_GAP, transform: "rotate(-90 100 100)" };
    cuerpoClase = ""; // sin flotación: la insignia es la que llama la atención
    contenido = (
      <>
        <CaraConInsignia pupila={PUPILA_CONTENTO[mode]} />
        {mode === "habito" ? <InsigniaEscudo /> : <InsigniaTarjeta />}
      </>
    );
  } else {
    ringProps = { ...RING_GAP, transform: "rotate(-90 100 100)" };
    cuerpoClase = "motion-safe:animate-ori-float";
    contenido = <CaraIdle pupila={PUPILA_CONTENTO[mode]} />;
  }

  return (
    <svg
      viewBox="0 0 200 200"
      width={px}
      height={px}
      className={`${cuerpoClase} ${className}`}
      style={{ transformOrigin: "center" }}
      filter={glow}
      role="img"
      aria-label={title ?? TITULO_POR_DEFECTO[state]}
    >
      <circle cx={100} cy={100} r={70} fill="none" stroke={ring} strokeWidth={13} strokeLinecap="round" {...ringProps} />
      {contenido}
    </svg>
  );
}
