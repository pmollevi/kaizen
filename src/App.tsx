import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  Gauge,
  Gift,
  LayoutDashboard,
  ListChecks,
  Medal,
  Settings,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { crearPerfil, getPerfilActivo, listarPerfiles, setPerfilActivo, type Perfil } from "@/store/profiles";
import { Button, Card, Input } from "@/components/ui/Primitives";
import { PanelPrincipal } from "@/components/panel/PanelPrincipal";
import { RegistroDiarioView } from "@/components/registro/RegistroDiario";
import { FinanzasView } from "@/components/finanzas/Finanzas";
import { CierreSemanalView } from "@/components/cierre/CierreSemanal";
import { TemporadaView } from "@/components/temporada/Temporada";
import { RecompensasView } from "@/components/recompensas/Recompensas";
import { ReconocimientosView } from "@/components/reconocimientos/Reconocimientos";
import { HistorialView } from "@/components/historial/Historial";
import { ConfiguracionView } from "@/components/config/Configuracion";

type TabId = "panel" | "registro" | "finanzas" | "cierre" | "temporada" | "recompensas" | "reconocimientos" | "historial" | "config";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "panel", label: "Panel", icon: LayoutDashboard },
  { id: "registro", label: "Registro diario", icon: ListChecks },
  { id: "finanzas", label: "Finanzas", icon: Wallet },
  { id: "cierre", label: "Cierre semanal", icon: CalendarClock },
  { id: "temporada", label: "Temporada", icon: Gauge },
  { id: "recompensas", label: "Recompensas", icon: Gift },
  { id: "reconocimientos", label: "Reconocimientos", icon: Medal },
  { id: "historial", label: "Historial", icon: Trophy },
  { id: "config", label: "Configuración", icon: Settings },
];

function ProfileGate({ onEntrar }: { onEntrar: () => void }) {
  const [perfiles, setPerfiles] = useState<Perfil[]>(listarPerfiles());
  const [nombre, setNombre] = useState("");
  const reiniciar = useKaizenStore((s) => s.reiniciarConNombre);

  const crear = () => {
    if (!nombre.trim()) return;
    const perfil = crearPerfil(nombre.trim());
    setPerfilActivo(perfil.id);
    reiniciar(nombre.trim());
    onEntrar();
  };

  const entrarComo = (p: Perfil) => {
    setPerfilActivo(p.id);
    reiniciar(p.nombre);
    useKaizenStore.persist.rehydrate();
    onEntrar();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-5">
          <div className="text-lg font-semibold tracking-tight">Kaizen</div>
          <div className="text-sm text-base-400 mt-1">Sistema de mejora continua — elige o crea tu perfil.</div>
        </div>

        {perfiles.length > 0 && (
          <div className="space-y-2 mb-5">
            {perfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => entrarComo(p)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-base-850 hover:bg-base-800 text-sm font-medium transition-colors"
              >
                {p.nombre}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Input placeholder="Nombre del nuevo perfil" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Button className="w-full" onClick={crear}>
            Crear perfil
          </Button>
        </div>
        <p className="text-xs text-base-500 mt-4">
          Tus datos se guardan solo en este navegador (localStorage). Exporta desde Configuración para respaldarlos.
        </p>
      </Card>
    </div>
  );
}

export default function App() {
  const [perfilId, setPerfilId] = useState<string | null>(getPerfilActivo());
  const [tab, setTab] = useState<TabId>("panel");
  const usuario = useKaizenStore((s) => s.usuario);
  const nombreSistema = useKaizenStore((s) => s.config.textos.nombreSistema);
  const procesarCierres = useKaizenStore((s) => s.procesarCierresMensualesPendientes);

  useEffect(() => {
    if (perfilId) procesarCierres();
  }, [perfilId]);

  const perfilActual = useMemo(() => listarPerfiles().find((p) => p.id === perfilId), [perfilId]);

  if (!perfilId) {
    return <ProfileGate onEntrar={() => setPerfilId(getPerfilActivo())} />;
  }

  return (
    <div className="min-h-screen bg-base-950 text-base-100 flex">
      <aside className="w-56 shrink-0 border-r border-base-800 flex flex-col">
        <div className="px-4 py-5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span className="font-semibold tracking-tight">{nombreSistema}</span>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const activo = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activo ? "bg-sky-600/15 text-sky-400" : "text-base-400 hover:text-base-100 hover:bg-base-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-base-800">
          <div className="text-sm font-medium truncate">{perfilActual?.nombre ?? usuario.nombre}</div>
          <div className="text-xs text-base-500 mt-0.5 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Nivel {usuario.nivelGlobal}
          </div>
          <button
            className="text-xs text-base-500 hover:text-base-300 mt-2"
            onClick={() => {
              setPerfilActivo(null);
              setPerfilId(null);
            }}
          >
            Cambiar de perfil
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-6 py-6 max-w-6xl mx-auto w-full">
        {tab === "panel" && <PanelPrincipal irA={(t) => setTab(t as TabId)} />}
        {tab === "registro" && <RegistroDiarioView />}
        {tab === "finanzas" && <FinanzasView />}
        {tab === "cierre" && <CierreSemanalView />}
        {tab === "temporada" && <TemporadaView />}
        {tab === "recompensas" && <RecompensasView />}
        {tab === "reconocimientos" && <ReconocimientosView />}
        {tab === "historial" && <HistorialView />}
        {tab === "config" && <ConfiguracionView />}
      </main>
    </div>
  );
}
