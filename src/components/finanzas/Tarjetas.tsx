import React, { Suspense, lazy, useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Field, Input, InputDiaDelMes, Button, Badge, EmptyState } from "@/components/ui/Primitives";
import { COLOR_SECCION } from "@/lib/color";
import { distribucionCategorias } from "@/lib/formulas";
import { Plus, Trash2, CreditCard } from "lucide-react";
import { OriIcon } from "@/components/ui/OriIcon";
import { tarjetaProximaACortar } from "@/lib/ori";

// La librería de gráficas solo se necesita aquí — separada en su propio chunk.
const GraficaCategoriasPastel = lazy(() =>
  import("@/components/finanzas/charts/FinanzasCharts").then((m) => ({ default: m.GraficaCategoriasPastel }))
);

const MAX_TARJETAS = 3;

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
        <Field label="Día de corte" hint="Aquí pones el día del mes en que corta tu tarjeta.">
          <InputDiaDelMes value={diaCorte} onChange={setDiaCorte} />
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

export function TarjetasTab() {
  const state = useKaizenStore();
  const eliminarTarjeta = useKaizenStore((s) => s.eliminarTarjeta);
  const [formAbierto, setFormAbierto] = useState(false);

  return (
    <Card className="border-finanzas-500/35 bg-finanzas-500/[0.08]">
      <SectionTitle
        title="Tarjetas"
        accent={COLOR_SECCION.finanzas}
        subtitle={`Hasta ${MAX_TARJETAS} tarjetas. Al cortar cada una, recibes su resumen de gasto automático.`}
        action={
          state.finanzas.tarjetas.length < MAX_TARJETAS && !formAbierto ? (
            <Button variant="ghost" onClick={() => setFormAbierto(true)} className="inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Agregar tarjeta
            </Button>
          ) : undefined
        }
      />
      <div className="space-y-2.5">
        {state.finanzas.tarjetas.map((t) => {
          const gastosDeTarjeta = state.finanzas.gastos.filter((g) => g.tarjetaId === t.id);
          const totalTarjeta = gastosDeTarjeta.reduce((acc, g) => acc + g.monto, 0);
          const categoriasDeTarjeta = distribucionCategorias(gastosDeTarjeta, state.finanzas.categorias, "0000-01-01", "9999-12-31");
          return (
            <div key={t.id} className="rounded-xl border border-finanzas-500/40 bg-finanzas-500/[0.08] px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-finanzas-500/15 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-finanzas-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-200">{t.nombre}</div>
                    <div className="text-xs text-base-500">Corte el día {t.diaCorte}</div>
                  </div>
                  {tarjetaProximaACortar(t) && <OriIcon mode="finanzas" state="protegido" title={`${t.nombre}: corte próximo`} />}
                </div>
                <button onClick={() => eliminarTarjeta(t.id)} className="text-base-500 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-finanzas-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] uppercase tracking-wide text-base-500">Gastos por categoría en esta tarjeta</div>
                  <div className="text-sm font-semibold text-base-100">${totalTarjeta.toLocaleString()}</div>
                </div>
                {categoriasDeTarjeta.length === 0 ? (
                  <EmptyState text="Sin gastos registrados con esta tarjeta." />
                ) : (
                  <Suspense fallback={<div className="text-xs text-base-500 py-2">Cargando gráfica…</div>}>
                    <GraficaCategoriasPastel datos={categoriasDeTarjeta} />
                  </Suspense>
                )}
              </div>
            </div>
          );
        })}
        {state.finanzas.tarjetas.length === 0 && !formAbierto && <EmptyState text="Aún no registras ninguna tarjeta." />}
        {formAbierto && <FormTarjeta onCancelar={() => setFormAbierto(false)} />}
      </div>
    </Card>
  );
}
