import React, { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";

/**
 * Para contenido scrolleable dentro de un contenedor de altura fija (modales,
 * hojas): expone si hay más contenido arriba/abajo para poder pintar un fade
 * de "hay más" — el scrollbar nativo por sí solo es fácil de pasar por alto.
 */
export function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [arribaOculto, setArribaOculto] = useState(false);
  const [abajoOculto, setAbajoOculto] = useState(false);

  const revisar = () => {
    const el = ref.current;
    if (!el) return;
    setArribaOculto(el.scrollTop > 1);
    setAbajoOculto(el.scrollHeight - el.scrollTop - el.clientHeight > 1);
  };

  useEffect(() => {
    revisar();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(revisar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, arribaOculto, abajoOculto, onScroll: revisar };
}

export function ScrollFade({ visible, side }: { visible: boolean; side: "top" | "bottom" }) {
  if (!visible) return null;
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 h-10 z-10 ${
        side === "top" ? "top-0 bg-gradient-to-b" : "bottom-0 bg-gradient-to-t"
      } from-base-900 to-transparent`}
    />
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-base-900 border border-base-700 p-5 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
  accent,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Color de identidad de sección (ver DESIGN.md), solo para el título de página. */
  accent?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight" style={{ color: accent ?? undefined }}>
          <span className={accent ? "" : "text-base-100"}>{title}</span>
        </h2>
        {subtitle && <p className="text-sm text-base-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({
  value,
  colorClass,
  color,
  height = "h-1",
}: {
  value: number; // 0-1
  colorClass?: string; // clase tailwind (ej. "bg-kaizen-500")
  color?: string; // color hex, para colores dinámicos por hábito
  height?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`w-full ${height} rounded-full bg-base-800 overflow-hidden`}>
      <div
        className={`h-full ${colorClass ?? "bg-kaizen-500"} transition-all duration-500 rounded-full`}
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  size = "default",
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: string;
  /** "lg" resalta el número que más motiva (ej. racha diaria) por encima del resto de stats. */
  size?: "default" | "lg";
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-base-500 font-medium">{label}</div>
      <div className={`font-semibold text-base-100 mt-1 tracking-tight ${size === "lg" ? "text-4xl" : "text-2xl"}`}>{value}</div>
      {hint && <div className="text-xs text-base-500 mt-0.5">{hint}</div>}
    </div>
  );
}

/**
 * Anima un número hacia su nuevo valor en vez de saltar seco — corto (default
 * 300ms) para que se sienta como feedback instantáneo, no una espera.
 */
export function useCountUp(valor: number, duracionMs = 300): number {
  const [mostrado, setMostrado] = useState(valor);
  const anteriorRef = useRef(valor);

  useEffect(() => {
    const desde = anteriorRef.current;
    const hasta = valor;
    if (desde === hasta) return;
    const inicio = performance.now();
    let raf = 0;
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracionMs);
      const suavizado = 1 - Math.pow(1 - t, 3); // ease-out cúbico
      setMostrado(Math.round(desde + (hasta - desde) * suavizado));
      if (t < 1) {
        raf = requestAnimationFrame(paso);
      } else {
        anteriorRef.current = hasta;
      }
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor, duracionMs]);

  return mostrado;
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "yellow" | "red" | "blue";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-base-800 text-base-300 border-base-700",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    yellow: "bg-gold-500/10 text-gold-400 border-gold-500/20",
    red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    blue: "bg-kaizen-500/10 text-kaizen-400 border-kaizen-500/20",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${tones[tone]}`}>{children}</span>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className = "",
  dataCoach,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  /** Ancla para las burbujas guía (ver Coachmarks.tsx) — no cambia el look del botón. */
  dataCoach?: string;
}) {
  const variants: Record<string, string> = {
    primary: "bg-kaizen-500 hover:bg-kaizen-600 text-base-100",
    secondary: "bg-base-850 hover:bg-base-800 text-base-100 border border-base-700",
    ghost: "bg-transparent hover:bg-base-850 text-base-300",
    danger: "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/20",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      data-coach={dataCoach}
      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// Evita que el "w-full" base pelee por especificidad con un ancho custom (w-28, flex-1, etc.)
// pasado por className: si el caller ya define un ancho, no forzamos w-full.
const TIENE_ANCHO_PROPIO = /(^|\s)(w-|flex-1|flex-auto|flex-none|grow|shrink)/;
function anchoBase(className: string): string {
  return TIENE_ANCHO_PROPIO.test(className) ? "" : "w-full";
}

const CAMPO_BASE =
  "bg-base-850 border border-base-700 rounded-xl px-3 py-2 text-sm text-base-100 transition-colors focus:outline-none focus:border-kaizen-400 focus:bg-base-800 focus:ring-2 focus:ring-kaizen-400/40";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`${anchoBase(className)} ${CAMPO_BASE} placeholder:text-base-500 ${className}`}
    />
  );
}

export function Select({
  children,
  className = "",
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={`${anchoBase(className)} ${CAMPO_BASE} ${className}`}>
      {children}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`${anchoBase(className)} ${CAMPO_BASE} placeholder:text-base-500 ${className}`}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-base-400 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-base-500 mt-1">{hint}</span>}
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-base-900 border border-base-700 rounded-2xl shadow-soft max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="text-base-400 hover:text-base-100 text-lg leading-none">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-6">
      <div className="text-sm text-base-500">{text}</div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/** Ícono "?" discreto: aclara jerga (PP, Protecciones...) al tocarlo, sin depender de hover. */
export function InfoTip({ text }: { text: string }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        onBlur={() => setAbierto(false)}
        aria-label="Más información"
        className="w-3.5 h-3.5 rounded-full border border-base-600 text-base-500 text-[9px] leading-none flex items-center justify-center hover:border-kaizen-400 hover:text-kaizen-400 focus:outline-none focus:border-kaizen-400 focus:text-kaizen-400 transition-colors"
      >
        ?
      </button>
      {abierto && (
        <span
          role="tooltip"
          className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-1.5 w-48 rounded-lg bg-base-850 border border-base-700 px-2.5 py-2 text-xs font-normal normal-case tracking-normal text-base-300 shadow-soft"
        >
          {text}
        </span>
      )}
    </span>
  );
}

export function StepperPorcentaje({
  value,
  onChange,
  min = 0,
  max = 100,
  paso = 5,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  paso?: number;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-label="Disminuir"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - paso))}
        className="w-7 h-7 rounded-lg bg-base-850 hover:bg-base-800 text-base-300 flex items-center justify-center shrink-0 active:scale-90 transition-transform disabled:opacity-30 disabled:active:scale-100"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-11 text-center text-sm font-semibold tabular-nums text-base-100">{value}%</span>
      <button
        type="button"
        aria-label="Aumentar"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + paso))}
        className="w-7 h-7 rounded-lg bg-kaizen-500 hover:bg-kaizen-600 text-base-100 flex items-center justify-center shrink-0 active:scale-90 transition-transform disabled:opacity-30 disabled:active:scale-100"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
