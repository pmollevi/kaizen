import React, { useState } from "react";
import { SectionTitle } from "@/components/ui/Primitives";
import { TarjetasTab } from "@/components/finanzas/Tarjetas";
import { GastosTab } from "@/components/finanzas/Gastos";
import { PanelFinancieroTab } from "@/components/finanzas/PanelFinanciero";
import { ResumenMensualTab } from "@/components/finanzas/ResumenMensual";
import { COLOR_SECCION } from "@/lib/color";

type SubTab = "resumen" | "gastos" | "tarjetas" | "mensual";

const SUBTABS: { id: SubTab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "gastos", label: "Gastos" },
  { id: "tarjetas", label: "Tarjetas" },
  { id: "mensual", label: "Resumen mensual" },
];

export function FinanzasView() {
  const [tab, setTab] = useState<SubTab>("resumen");
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Finanzas"
        subtitle="Control de gastos personal, independiente de tus hábitos."
        accent={COLOR_SECCION.finanzas}
      />
      <div className="flex gap-1 border-b border-base-700 overflow-x-auto no-scrollbar">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-3.5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-finanzas-500 text-finanzas-400" : "border-transparent text-base-400 hover:text-base-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "resumen" && <PanelFinancieroTab />}
      {tab === "gastos" && <GastosTab />}
      {tab === "tarjetas" && <TarjetasTab />}
      {tab === "mensual" && <ResumenMensualTab />}
    </div>
  );
}
