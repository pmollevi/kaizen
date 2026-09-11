import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-base-900 shadow-card p-5 ${className}`}>{children}</div>;
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
  colorClass = "bg-area-intelecto",
  height = "h-2",
}: {
  value: number; // 0-1
  colorClass?: string;
  height?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`w-full ${height} rounded-full bg-base-800 overflow-hidden`}>
      <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-base-400">{label}</div>
      <div className="text-2xl font-semibold text-base-100 mt-1">{value}</div>
      {hint && <div className="text-xs text-base-400 mt-0.5">{hint}</div>}
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
    neutral: "bg-base-800 text-base-300",
    green: "bg-emerald-950 text-emerald-400",
    yellow: "bg-amber-950 text-amber-400",
    red: "bg-rose-950 text-rose-400",
    blue: "bg-sky-950 text-sky-400",
  };
  return <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${tones[tone]}`}>{children}</span>;
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
    primary: "bg-sky-600 hover:bg-sky-500 text-white",
    secondary: "bg-base-800 hover:bg-base-700 text-base-100",
    ghost: "bg-transparent hover:bg-base-800 text-base-300",
    danger: "bg-rose-900 hover:bg-rose-800 text-rose-100",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 placeholder:text-base-500 focus:outline-none focus:ring-2 focus:ring-sky-600 ${className}`}
    />
  );
}

export function Select({
  children,
  className = "",
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={`w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 focus:outline-none focus:ring-2 focus:ring-sky-600 ${className}`}
    >
      {children}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 placeholder:text-base-500 focus:outline-none focus:ring-2 focus:ring-sky-600 ${className}`}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-base-300 mb-1.5">{label}</span>
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
        className="bg-base-900 rounded-xl shadow-card max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
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
