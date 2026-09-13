import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Field, Input, Button, Badge, EmptyState } from "@/components/ui/Primitives";
import { ResumenesTarjeta } from "@/components/finanzas/ResumenTarjeta";
import { hoyISO, formatoMes, mesDe } from "@/lib/dates";
import { Plus, Trash2, CreditCard } from "lucide-react";

const MAX_TARJETAS = 3;

function IngresoMensualSection() {
  const state = useKaizenStore();
  const setIngresoMensual = useKaizenStore((s) => s.setIngresoMensual);
  const mesActual = mesDe(hoyISO());
  const actual = state.finanzas.ingresosMensuales.find((i) => i.mes === mesActual)?.monto ?? 0;
  const [monto, setMonto] = useState(actual);
  const [guardado, setGuardado] = useState(false);

  const guardar = () => {
    setIngresoMensual(mesActual, monto);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 1800);
  };

  return (
    <Card>
      <SectionTitle
        title="Ingreso mensual"
        subtitle={`Para comparar gasto vs. ingreso de ${formatoMes(mesActual)}. Se reinicia cada mes, es opcional.`}
      />
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Field label="Ingreso de este mes">
            <Input type="number" min={0} value={monto || ""} onChange={(e) => setMonto(parseFloat(e.target.value) || 0)} placeholder="0" />
          </Field>
        </div>
        <Button variant="secondary" onClick={guardar}>
          {guardado ? "Guardado" : "Guardar"}
        </Button>
      </div>
    </Card>
  );
}

function FormTarjeta({ onCancelar }: { onCancelar: () => void }) {
  const agregarTarjeta = useKaizenStore((s) => s.agregarTarjeta);
  const [nombre, setNombre] = useState("");
  const [diaCorte, setDiaCorte] = useState(1);
  const [error, setError] = useState("");

  const guardar = () => {
    const res = agregarTarjeta({ nombre, diaCorte });
    if (!res.ok) {
      setError(res.motivo ?? "No se pudo agregar la tarjeta.");
      return;
    }
    onCancelar();
  };

  return (
    <div className="rounded-xl border border-base-700 bg-base-850 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nombre de la tarjeta">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Platino BBVA" />
        </Field>
        <Field label="Día de corte">
          <Input type="number" min={1} max={31} value={diaCorte} onChange={(e) => setDiaCorte(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))} />
        </Field>
      </div>
      {error && <Badge tone="red">{error}</Badge>}
      <div className="flex items-center gap-2">
        <Button onClick={guardar}>Guardar tarjeta</Button>
        <Button variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

function TarjetasSection() {
  const state = useKaizenStore();
  const eliminarTarjeta = useKaizenStore((s) => s.eliminarTarjeta);
  const [formAbierto, setFormAbierto] = useState(false);

  return (
    <Card>
      <SectionTitle
        title="Tarjetas"
        subtitle={`Hasta ${MAX_TARJETAS} tarjetas. Registrar una te da un resumen automático de gasto cada vez que cierra su corte — la fecha de corte es el día del mes en que tu banco cierra el ciclo de esa tarjeta.`}
        action={
          state.finanzas.tarjetas.length < MAX_TARJETAS && !formAbierto ? (
            <Button variant="ghost" onClick={() => setFormAbierto(true)} className="inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Agregar tarjeta
            </Button>
          ) : undefined
        }
      />
      <div className="space-y-2.5">
        {state.finanzas.tarjetas.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-xl border border-base-700 bg-base-850 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-base-800 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-base-300" />
              </div>
              <div>
                <div className="text-sm font-medium text-base-200">{t.nombre}</div>
                <div className="text-xs text-base-500">Corte el día {t.diaCorte}</div>
              </div>
            </div>
            <button onClick={() => eliminarTarjeta(t.id)} className="text-base-500 hover:text-rose-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {state.finanzas.tarjetas.length === 0 && !formAbierto && <EmptyState text="Aún no registras ninguna tarjeta." />}
        {formAbierto && <FormTarjeta onCancelar={() => setFormAbierto(false)} />}
      </div>
    </Card>
  );
}

function CategoriasSection() {
  const state = useKaizenStore();
  const agregarCategoriaGasto = useKaizenStore((s) => s.agregarCategoriaGasto);
  const eliminarCategoriaGasto = useKaizenStore((s) => s.eliminarCategoriaGasto);
  const [nombre, setNombre] = useState("");

  const agregar = () => {
    if (!nombre.trim()) return;
    agregarCategoriaGasto(nombre);
    setNombre("");
  };

  return (
    <Card>
      <SectionTitle title="Categorías de gasto" />
      <div className="flex flex-wrap gap-2 mb-4">
        {state.finanzas.categorias.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-base-850 border border-base-700 text-sm text-base-200">
            {c.nombre}
            <button onClick={() => eliminarCategoriaGasto(c.id)} className="text-base-500 hover:text-rose-400 p-0.5">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
        {state.finanzas.categorias.length === 0 && <EmptyState text="Aún no hay categorías." />}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Nueva categoría"
          className="max-w-xs"
        />
        <Button variant="secondary" onClick={agregar} className="inline-flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Agregar
        </Button>
      </div>
    </Card>
  );
}

export function TarjetasTab() {
  return (
    <div className="space-y-5">
      <IngresoMensualSection />
      <TarjetasSection />
      <CategoriasSection />
      <ResumenesTarjeta />
    </div>
  );
}
