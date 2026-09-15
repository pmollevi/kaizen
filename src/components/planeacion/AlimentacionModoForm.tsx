import React, { useState } from "react";
import { Field, Input } from "@/components/ui/Primitives";
import { caloriasSugeridasPorDia } from "@/lib/nutricion";
import type { ConfigAlimentacion, ModoAlimentacion, SexoBiologico } from "@/types";

const MODOS: { id: ModoAlimentacion; label: string; ayuda: string }[] = [
  { id: "dieta", label: "Días cumpliendo mi dieta", ayuda: "Simple: marcas sí/no cada día." },
  { id: "calorias", label: "Conteo de calorías", ayuda: "Detallado: registras cada comida con sus calorías." },
];

/**
 * Elección del modo de Alimentación + (si aplica) los datos para estimar el
 * gasto calórico diario. Se usa tanto en el asistente de planeación mensual
 * (al configurar el hábito, antes de la meta) como en Configuración (para
 * cambiar el modo después). No decide nada por sí solo: reporta cambios al
 * padre vía `onChange`/`onMetaKcal`, que son quienes de verdad guardan.
 */
export function AlimentacionModoForm({
  alimentacion,
  metaDiariaActual,
  onChange,
  onMetaKcal,
}: {
  alimentacion: ConfigAlimentacion;
  /** Meta diaria (kcal) ya guardada, si existe — para prellenar el campo editable. */
  metaDiariaActual?: number | null;
  onChange: (nuevo: ConfigAlimentacion) => void;
  onMetaKcal: (kcal: number) => void;
}) {
  const [talla, setTalla] = useState(alimentacion.tallaCm ? String(alimentacion.tallaCm) : "");
  const [peso, setPeso] = useState(alimentacion.pesoKg ? String(alimentacion.pesoKg) : "");
  const [edad, setEdad] = useState(alimentacion.edad ? String(alimentacion.edad) : "");
  const [sexo, setSexo] = useState<SexoBiologico>(alimentacion.sexo ?? "m");
  const [kcalTexto, setKcalTexto] = useState(metaDiariaActual ? String(metaDiariaActual) : "");
  const [kcalManual, setKcalManual] = useState(false);

  const recalcular = (t: string, p: string, e: string, s: SexoBiologico) => {
    const tN = parseFloat(t);
    const pN = parseFloat(p);
    const eN = parseFloat(e);
    if (!kcalManual && tN > 0 && pN > 0 && eN > 0) {
      const sugerido = caloriasSugeridasPorDia(pN, tN, eN, s);
      setKcalTexto(String(sugerido));
      onMetaKcal(sugerido);
    }
    onChange({
      modo: "calorias",
      tallaCm: tN || undefined,
      pesoKg: pN || undefined,
      edad: eN || undefined,
      sexo: s,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {MODOS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange({ ...alimentacion, modo: m.id })}
            className={`text-left rounded-xl border px-3 py-2.5 transition-all active:scale-[0.98] ${
              alimentacion.modo === m.id ? "border-habitos-500/40 bg-habitos-500/10" : "border-base-700 hover:border-base-600"
            }`}
          >
            <div className={`text-sm font-medium ${alimentacion.modo === m.id ? "text-habitos-400" : "text-base-200"}`}>
              {m.label}
            </div>
            <div className="text-xs text-base-500 mt-0.5">{m.ayuda}</div>
          </button>
        ))}
      </div>

      {alimentacion.modo === "calorias" && (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-base-500">
            Con esto estimamos cuántas calorías al día te convienen (fórmula Mifflin-St Jeor, actividad ligera por
            default) — es una sugerencia, siempre puedes ajustarla abajo.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Estatura (cm)">
              <Input
                type="number"
                inputMode="decimal"
                value={talla}
                onChange={(e) => {
                  setTalla(e.target.value);
                  recalcular(e.target.value, peso, edad, sexo);
                }}
                placeholder="170"
              />
            </Field>
            <Field label="Peso (kg)">
              <Input
                type="number"
                inputMode="decimal"
                value={peso}
                onChange={(e) => {
                  setPeso(e.target.value);
                  recalcular(talla, e.target.value, edad, sexo);
                }}
                placeholder="70"
              />
            </Field>
            <Field label="Edad">
              <Input
                type="number"
                inputMode="numeric"
                value={edad}
                onChange={(e) => {
                  setEdad(e.target.value);
                  recalcular(talla, peso, e.target.value, sexo);
                }}
                placeholder="30"
              />
            </Field>
            <Field label="Sexo">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSexo("m");
                    recalcular(talla, peso, edad, "m");
                  }}
                  className={`h-9 rounded-lg text-sm font-medium border transition-all ${
                    sexo === "m" ? "border-habitos-500/40 bg-habitos-500/10 text-habitos-400" : "border-base-700 text-base-400"
                  }`}
                >
                  Hombre
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSexo("f");
                    recalcular(talla, peso, edad, "f");
                  }}
                  className={`h-9 rounded-lg text-sm font-medium border transition-all ${
                    sexo === "f" ? "border-habitos-500/40 bg-habitos-500/10 text-habitos-400" : "border-base-700 text-base-400"
                  }`}
                >
                  Mujer
                </button>
              </div>
            </Field>
          </div>
          <Field label="Meta diaria (kcal)" hint="Calculada a partir de tus datos — puedes escribir la tuya si prefieres otra.">
            <Input
              type="number"
              inputMode="numeric"
              value={kcalTexto}
              onChange={(e) => {
                setKcalTexto(e.target.value);
                setKcalManual(true);
                const k = parseFloat(e.target.value);
                if (k > 0) onMetaKcal(k);
              }}
              placeholder="2200"
            />
          </Field>
        </div>
      )}
    </div>
  );
}
