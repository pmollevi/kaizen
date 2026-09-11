import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-white/[0.035] backdrop-blur-xl border border-white/[0.08] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_20px_40px_-28px_rgba(0,0,0,0.7)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 className="text-base font-semibold text-base-100 tracking-tight">{title}</h2>
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
  height = "h-1.5",
}: {
  value: number; // 0-1
  colorClass?: string; // clase tailwind (ej. "bg-sky-500")
  color?: string; // color hex, para colores dinámicos por hábito
  height?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`w-full ${height} rounded-full bg-white/[0.06] overflow-hidden`}>
      <div
        className={`h-full ${colorClass ?? "bg-sky-500"} transition-all duration-500 rounded-full`}
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-base-500 font-medium">{label}</div>
      <div className="text-2xl font-semibold text-base-100 mt-1 tracking-tight">{value}</div>
      {hint && <div className="text-xs text-base-500 mt-0.5">{hint}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "yellow" | "red" | "blue";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/[0.06] text-base-300 border-white/10",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    yellow: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    blue: "bg-sky-500/10 text-sky-400 border-sky-500/20",
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
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-sky-500 hover:bg-sky-400 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_20px_-8px_rgba(59,130,246,0.6)]",
    secondary: "bg-white/[0.06] hover:bg-white/[0.1] text-base-100 border border-white/10",
    ghost: "bg-transparent hover:bg-white/[0.06] text-base-300",
    danger: "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/20",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
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
  "bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-base-100 transition-colors focus:outline-none focus:border-sky-400 focus:bg-white/[0.06] focus:ring-2 focus:ring-sky-400/50";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-base-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 animate-pop"
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

export function EmptyState({ text }: { text: string }) {
  return <div className="text-sm text-base-500 text-center py-6">{text}</div>;
}
