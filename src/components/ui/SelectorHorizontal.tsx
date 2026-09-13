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
export function SelectorHorizontal({ value, onChange, min, max, step, unidad, color = "#7B835C" }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [anchoContenedor, setAnchoContenedor] = useState(280);
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrastrando = useRef(false);
  const programatico = useRef(false);
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
    if (Math.abs(el.scrollLeft - destino) > 1) {
      // Un valor escrito a mano fuera de [min,max] (ver "toca el número") deja el
      // riel clavado en su extremo — este ajuste de scrollLeft dispara un evento
      // "scroll" nativo que, sin esta bandera, se leería como un arrastre real y
      // pisaría el valor exacto con la versión recortada al límite del riel.
      programatico.current = true;
      el.scrollLeft = destino;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min, max, step, anchoContenedor]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const manejarScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (programatico.current) {
      programatico.current = false;
      return;
    }
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

  const abrirEdicion = () => {
    setTextoEditado(formatear(value));
    setEditando(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const confirmarEdicion = () => {
    const n = parseFloat(textoEditado.replace(",", "."));
    if (!Number.isNaN(n) && n >= 0) onChange(Math.round(n * 100) / 100);
    setEditando(false);
  };

  return (
    <div className="select-none">
      <div className="text-center mb-2">
        {editando ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            min={0}
            value={textoEditado}
            onChange={(e) => setTextoEditado(e.target.value)}
            onBlur={confirmarEdicion}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmarEdicion();
              if (e.key === "Escape") setEditando(false);
            }}
            className="w-24 text-center text-2xl font-semibold tabular-nums bg-transparent border-b-2 focus:outline-none"
            style={{ color, borderColor: color }}
          />
        ) : (
          <button
            type="button"
            onClick={abrirEdicion}
            className="text-2xl font-semibold tabular-nums hover:opacity-80 transition-opacity"
            style={{ color }}
            aria-label="Escribir un valor exacto"
            title="Toca para escribir un valor exacto"
          >
            {formatear(value)}
          </button>
        )}
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
          className="no-scrollbar overflow-x-auto cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-kaizen-400/40 rounded-lg"
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
      <div className="text-center text-[11px] text-base-500 mt-1">Desliza para ajustar, o toca el número para escribirlo</div>
    </div>
  );
}
