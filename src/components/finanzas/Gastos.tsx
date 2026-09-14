import React from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, EmptyState } from "@/components/ui/Primitives";
import { formatoLargo } from "@/lib/dates";
import { Trash2 } from "lucide-react";

export function GastosTab() {
  const state = useKaizenStore();
  const eliminarGasto = useKaizenStore((s) => s.eliminarGasto);

  const gastosRecientes = [...state.finanzas.gastos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const categoriaNombre = (id: string) => state.finanzas.categorias.find((c) => c.id === id)?.nombre ?? "—";

  return (
    <Card>
      <SectionTitle title="Gastos recientes" subtitle="Usa el botón + de abajo para registrar un gasto nuevo." />
      {gastosRecientes.length === 0 ? (
        <EmptyState text="Sin gastos todavía." />
      ) : (
        <ul className="divide-y divide-base-700">
          {gastosRecientes.map((g) => (
            <li key={g.id} className="flex items-center justify-between py-2.5 text-sm">
              <div className="min-w-0">
                <div className="font-medium text-base-200 truncate">{g.palabraClave}</div>
                <div className="text-xs text-base-500">
                  {formatoLargo(g.fecha)} · {categoriaNombre(g.categoriaId)} · {g.metodo === "tarjeta" ? "tarjeta" : "efectivo"}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-medium">${g.monto.toLocaleString()}</span>
                <button onClick={() => eliminarGasto(g.id)} className="text-base-500 hover:text-rose-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
