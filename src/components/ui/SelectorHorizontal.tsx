import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const PX_POR_PASO = 18;

interface Props {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unidad?: string;
  color?: string;
}

function formatear(v: number): string {
  const redondeado = Math.round(v * 100) / 100;
  return Number.isInteger(redondeado) ? String(redondeado) : redondeado.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

// Regla horizontal: el usuario arrastra/hace scroll para ajustar el valor.
// Las marcas se desplazan bajo un indicador fijo al centro, en vez de escribir un número.
export function SelectorHorizontal({ value, onChange, min, max, step, unidad, color = "#0ea5e9" }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [anchoContenedor, setAnchoContenedor] = useState(280);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrastrando = useRef(false);
  // overflow-x:auto no se arrastra con mouse por defecto (solo con touch/trackpad);
  // este estado habilita arrastre manual con el puntero para desktop.
  const arrastreMouse = useRef<{ x: number; scrollLeft: number } | null>(null);

  const cantidadPasos = Math.max(1, Math.round((max - min) / step));
  const indiceDesdeValor = (v: number) => Math.round((Math.min(max, Math.max(min, v)) - min) / step);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const actualizarAncho = () => setAnchoContenedor(el.clientWidth);
    actualizarAncho();
    const ro = new ResizeObserver(actualizarAncho);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || arrastrando.current) return;
    const destino = indiceDesdeValor(value) * PX_POR_PASO;
    if (Math.abs(el.scrollLeft - destino) > 1) el.scrollLeft = destino;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min, max, step, anchoContenedor]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const manejarScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    arrastrando.current = true;
    const idx = Math.max(0, Math.min(cantidadPasos, Math.round(el.scrollLeft / PX_POR_PASO)));
    const nuevoValor = Math.round((min + idx * step) * 100) / 100;
    if (nuevoValor !== value) onChange(nuevoValor);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      arrastrando.current = false;
      el.scrollTo({ left: idx * PX_POR_PASO, behavior: "smooth" });
    }, 120);
  };

  const ajustarPorTeclado = (delta: number) => {
    onChange(Math.round((Math.min(max, Math.max(min, value + delta * step)) * 100)) / 100);
  };

  const iniciarArrastreMouse = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // el touch ya usa scroll nativo
    const el = scrollRef.current;
    if (!el) return;
    arrastreMouse.current = { x: e.clientX, scrollLeft: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  };

  const moverArrastreMouse = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    const inicio = arrastreMouse.current;
    if (!el || !inicio) return;
    el.scrollLeft = inicio.scrollLeft - (e.clientX - inicio.x);
  };

  const terminarArrastreMouse = (e: React.PointerEvent<HTMLDivElement>) => {
    arrastreMouse.current = null;
    scrollRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="select-none">
      <div className="text-center mb-2">
        <span className="text-2xl font-semibold tabular-nums" style={{ color }}>
          {formatear(value)}
        </span>
        {unidad && <span className="text-sm text-base-400 ml-1">{unidad}</span>}
      </div>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={manejarScroll}
          tabIndex={0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") ajustarPorTeclado(1);
            if (e.key === "ArrowLeft") ajustarPorTeclado(-1);
          }}
          onPointerDown={iniciarArrastreMouse}
          onPointerMove={moverArrastreMouse}
          onPointerUp={terminarArrastreMouse}
          onPointerCancel={terminarArrastreMouse}
          className="no-scrollbar overflow-x-auto cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 rounded-lg"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {/* inline-flex (no flex): un flex de bloque se encoge al ancho del padre y
              trunca scrollWidth; inline-flex crece al contenido real de las marcas. */}
          <div className="inline-flex items-end h-10">
            {/* Espaciadores en vez de padding: el padding final de un contenedor con
                scroll no siempre se incluye en scrollWidth (se pierde el rango de arrastre). */}
            <div className="shrink-0" style={{ width: anchoContenedor / 2 }} />
            {Array.from({ length: cantidadPasos + 1 }, (_, i) => {
              const esMayor = i % 5 === 0;
              return (
                <div
                  key={i}
                  className="shrink-0 flex flex-col items-center justify-end"
                  style={{ width: PX_POR_PASO, scrollSnapAlign: "center" }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: esMayor ? 2 : 1,
                      height: esMayor ? 22 : 12,
                      background: esMayor ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.14)",
                    }}
                  />
                </div>
              );
            })}
            <div className="shrink-0" style={{ width: anchoContenedor / 2 }} />
          </div>
        </div>
        <div
          className="pointer-events-none absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 rounded-full"
          style={{ background: color }}
        />
      </div>
      <div className="text-center text-[11px] text-base-500 mt-1">Desliza para ajustar</div>
    </div>
  );
}
