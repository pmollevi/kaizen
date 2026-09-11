import React from "react";

export interface RadarPoint {
  label: string;
  value: number; // 0-1
  color: string; // hex
}

export function RadarChart({ puntos, size = 260 }: { puntos: RadarPoint[]; size?: number }) {
  const centro = size / 2;
  const radio = size / 2 - 36;
  const n = puntos.length;
  const angulo = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const coord = (i: number, r: number) => ({
    x: centro + r * radio * Math.cos(angulo(i)),
    y: centro + r * radio * Math.sin(angulo(i)),
  });

  const anillos = [0.25, 0.5, 0.75, 1];
  const puntosPoligono = puntos.map((p, i) => coord(i, Math.max(0.04, p.value)));
  const pathPoligono = puntosPoligono.map((c) => `${c.x},${c.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height={size} className="overflow-visible">
      {anillos.map((a) => {
        const pts = puntos.map((_, i) => coord(i, a));
        return (
          <polygon
            key={a}
            points={pts.map((c) => `${c.x},${c.y}`).join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-base-700"
            strokeWidth={1}
          />
        );
      })}
      {puntos.map((_, i) => {
        const c = coord(i, 1);
        return (
          <line key={i} x1={centro} y1={centro} x2={c.x} y2={c.y} stroke="currentColor" className="text-base-700" strokeWidth={1} />
        );
      })}
      <polygon points={pathPoligono} fill="#5b8def33" stroke="#5b8def" strokeWidth={2} />
      {puntosPoligono.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={3.5} fill={puntos[i].color} />
      ))}
      {puntos.map((p, i) => {
        const c = coord(i, 1.24);
        return (
          <text
            key={p.label}
            x={c.x}
            y={c.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-base-300 text-[11px] font-medium"
          >
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}
