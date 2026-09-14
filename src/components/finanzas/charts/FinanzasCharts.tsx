import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Paleta cíclica para categorías (mismos acentos vivos que ya usa el resto de
// la app — ver tailwind.config.js) en vez de inventar una paleta nueva.
const PALETA_CATEGORIAS = ["#4FC3F7", "#FFD84D", "#FF9600", "#3DDC5A", "#9D6BFF", "#FF6FB8", "#2BD4C4", "#FF5C5C", "#C77DFF", "#4D8DFF"];

const ESTILO_TOOLTIP = {
  background: "#1C1E1D",
  border: "1px solid #292C2A",
  borderRadius: 10,
  fontSize: 12,
  color: "#F2F1EC",
  padding: "6px 10px",
};

function formatoMoneda(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

/** Distribución de gasto por categoría — barras horizontales, una por categoría. */
export function GraficaCategorias({ datos }: { datos: { nombre: string; monto: number }[] }) {
  if (datos.length === 0) return null;
  const alto = Math.max(120, datos.length * 34);
  return (
    <div style={{ width: "100%", height: alto }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#292C2A" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#858982", fontSize: 11 }} tickFormatter={(v) => formatoMoneda(v)} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="nombre"
            tick={{ fill: "#C7C9BE", fontSize: 12 }}
            width={90}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={ESTILO_TOOLTIP}
            labelStyle={{ color: "#F2F1EC" }}
            formatter={(v) => [formatoMoneda(Number(v)), "Gastado"]}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="monto" radius={[0, 6, 6, 0]} maxBarSize={20}>
            {datos.map((_, i) => (
              <Cell key={i} fill={PALETA_CATEGORIAS[i % PALETA_CATEGORIAS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Distribución de gasto por categoría en gráfica de pastel, con leyenda de montos y porcentajes. */
export function GraficaCategoriasPastel({ datos }: { datos: { nombre: string; monto: number }[] }) {
  const total = datos.reduce((acc, d) => acc + d.monto, 0);
  if (datos.length === 0 || total <= 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="shrink-0">
        <PieChart width={140} height={140}>
          <Pie data={datos} dataKey="monto" nameKey="nombre" innerRadius={0} outerRadius={65} paddingAngle={1} stroke="none">
            {datos.map((d, i) => (
              <Cell key={d.nombre} fill={PALETA_CATEGORIAS[i % PALETA_CATEGORIAS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={ESTILO_TOOLTIP} formatter={(v, n) => [formatoMoneda(Number(v)), n]} />
        </PieChart>
      </div>
      <div className="space-y-1.5 min-w-0 flex-1">
        {datos.map((d, i) => (
          <div key={d.nombre} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PALETA_CATEGORIAS[i % PALETA_CATEGORIAS.length] }} />
            <span className="text-base-300 truncate">{d.nombre}</span>
            <span className="text-base-500 shrink-0 ml-auto">
              {formatoMoneda(d.monto)} · {Math.round((d.monto / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Efectivo vs tarjeta: dona simple con los dos montos. */
export function GraficaMetodoPago({ efectivo, tarjeta }: { efectivo: number; tarjeta: number }) {
  const total = efectivo + tarjeta;
  if (total <= 0) return null;
  const datos = [
    { nombre: "Efectivo", valor: efectivo, color: "#3DDC5A" },
    { nombre: "Tarjeta", valor: tarjeta, color: "#4FC3F7" },
  ].filter((d) => d.valor > 0);

  return (
    <div className="flex items-center gap-4">
      {/* Tamaño fijo conocido de antemano: PieChart directo en vez de
          ResponsiveContainer, que en un contenedor flex chico a veces mide 0
          en el primer render y deja la dona diminuta hasta el próximo resize. */}
      <div className="shrink-0">
        <PieChart width={108} height={108}>
          <Pie data={datos} dataKey="valor" nameKey="nombre" innerRadius={32} outerRadius={50} paddingAngle={2} stroke="none">
            {datos.map((d) => (
              <Cell key={d.nombre} fill={d.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={ESTILO_TOOLTIP} formatter={(v) => [formatoMoneda(Number(v)), ""]} />
        </PieChart>
      </div>
      <div className="space-y-1.5">
        {datos.map((d) => (
          <div key={d.nombre} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-base-300">{d.nombre}</span>
            <span className="text-base-500">
              {formatoMoneda(d.valor)} · {Math.round((d.valor / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Progreso semanal de cumplimiento de hábitos dentro de un rango (mes, temporada...). */
export function GraficaProgresoHabitos({ semanas }: { semanas: { etiqueta: string; cumplimiento: number }[] }) {
  if (semanas.length === 0) return null;
  const datos = semanas.map((s) => ({ ...s, porcentaje: Math.round(s.cumplimiento * 100) }));
  return (
    <div style={{ width: "100%", height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#292C2A" vertical={false} />
          <XAxis dataKey="etiqueta" tick={{ fill: "#858982", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "#858982", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip contentStyle={ESTILO_TOOLTIP} formatter={(v) => [`${Number(v)}%`, "Cumplimiento"]} cursor={{ stroke: "#292C2A" }} />
          <Line type="monotone" dataKey="porcentaje" stroke="#2FA347" strokeWidth={2.5} dot={{ fill: "#2FA347", r: 3.5 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
