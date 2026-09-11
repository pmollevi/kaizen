import React, { useState } from "react";
import { SectionTitle } from "@/components/ui/Primitives";
import { PresupuestoTab } from "@/components/finanzas/Presupuesto";
import { GastosTab } from "@/components/finanzas/Gastos";
import { PanelFinancieroTab } from "@/components/finanzas/PanelFinanciero";
import { ResumenMensualTab } from "@/components/finanzas/ResumenMensual";

type SubTab = "presupuesto" | "gastos" | "panel" | "resumen";

const SUBTABS: { id: SubTab; label: string }[] = [
  { id: "presupuesto", label: "Presupuesto" },
  { id: "gastos", label: "Gastos" },
  { id: "panel", label: "Panel" },
  { id: "resumen", label: "Resumen mensual" },
];

export function FinanzasView() {
  const [tab, setTab] = useState<SubTab>("presupuesto");
  return (
    <div className="space-y-5">
      <SectionTitle title="Finanzas" subtitle="Control de gastos real, independiente del resto del sistema." />
      <div className="flex gap-1 border-b border-base-800">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-sky-500 text-sky-400" : "border-transparent text-base-400 hover:text-base-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "presupuesto" && <PresupuestoTab />}
      {tab === "gastos" && <GastosTab />}
      {tab === "panel" && <PanelFinancieroTab />}
      {tab === "resumen" && <ResumenMensualTab />}
    </div>
  );
}
