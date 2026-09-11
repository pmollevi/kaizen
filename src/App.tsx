import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  Gauge,
  Gift,
  LayoutDashboard,
  ListChecks,
  Medal,
  Menu,
  Settings,
  Trophy,
  Wallet,
} from "lucide-react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { crearPerfil, getPerfilActivo, listarPerfiles, setPerfilActivo, type Perfil } from "@/store/profiles";
import { plantillaPorId } from "@/config/areaCatalog";
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
  { id: "registro", label: "Registro", icon: ListChecks },
  { id: "finanzas", label: "Finanzas", icon: Wallet },
  { id: "cierre", label: "Cierre semanal", icon: CalendarClock },
  { id: "temporada", label: "Temporada", icon: Gauge },
  { id: "recompensas", label: "Recompensas", icon: Gift },
  { id: "reconocimientos", label: "Reconocimientos", icon: Medal },
  { id: "historial", label: "Historial", icon: Trophy },
  { id: "config", label: "Config.", icon: Settings },
];

// Las 4 pestañas más usadas viven en la barra inferior de celular; el resto va en "Más".
const TABS_MOVIL_PRINCIPAL: TabId[] = ["panel", "registro", "finanzas", "recompensas"];

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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-sky-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-fuchsia-600/20 blur-3xl" />
      </div>
      <Card className="w-full max-w-sm relative animate-fade-up">
        <div className="mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-fuchsia-500 flex items-center justify-center text-xl mb-3 shadow-glow shadow-sky-500/30">
            ✨
          </div>
          <div className="text-lg font-semibold tracking-tight">Kaizen</div>
          <div className="text-sm text-base-400 mt-1">Sistema de mejora continua — elige o crea tu perfil.</div>
        </div>

        {perfiles.length > 0 && (
          <div className="space-y-2 mb-5">
            {perfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => entrarComo(p)}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-base-850 hover:bg-base-800 active:scale-[0.98] text-sm font-medium transition-all"
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

function MenuMovil({
  tabActual,
  onElegir,
  onCerrar,
  onCambiarPerfil,
}: {
  tabActual: TabId;
  onElegir: (t: TabId) => void;
  onCerrar: () => void;
  onCambiarPerfil: () => void;
}) {
  const otras = TABS.filter((t) => !TABS_MOVIL_PRINCIPAL.includes(t.id));
  return (
    <div className="fixed inset-0 z-50 flex items-end md:hidden" onClick={onCerrar}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full bg-base-900 rounded-t-2xl p-4 pb-8 animate-fade-up max-h-[75vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-base-700 mx-auto mb-4" />
        <div className="grid grid-cols-3 gap-2">
          {otras.map((t) => {
            const Icon = t.icon;
            const activo = tabActual === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onElegir(t.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium transition-colors ${
                  activo ? "bg-sky-600/15 text-sky-400" : "bg-base-850 text-base-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                {t.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={onCambiarPerfil}
          className="w-full text-center text-sm text-base-400 mt-5 pt-4 border-t border-base-800"
        >
          Cambiar de perfil
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [perfilId, setPerfilId] = useState<string | null>(getPerfilActivo());
  const [tab, setTab] = useState<TabId>("panel");
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const usuario = useKaizenStore((s) => s.usuario);
  const nombreSistema = useKaizenStore((s) => s.config.textos.nombreSistema);
  const procesarCierres = useKaizenStore((s) => s.procesarCierresMensualesPendientes);

  useEffect(() => {
    if (!perfilId) return;
    procesarCierres();
    // Perfiles creados antes de que los hábitos tuvieran emoji: se los rellenamos una vez.
    useKaizenStore.setState((s) => {
      const faltaAlguno = s.areas.some((a) => !a.emoji);
      if (!faltaAlguno) return s;
      return { areas: s.areas.map((a) => (a.emoji ? a : { ...a, emoji: plantillaPorId(a.id)?.emoji ?? "✨" })) };
    });
  }, [perfilId]);

  const perfilActual = useMemo(() => listarPerfiles().find((p) => p.id === perfilId), [perfilId]);

  if (!perfilId) {
    return <ProfileGate onEntrar={() => setPerfilId(getPerfilActivo())} />;
  }

  const cambiarDePerfil = () => {
    setPerfilActivo(null);
    setPerfilId(null);
  };

  return (
    <div className="min-h-screen bg-base-950 text-base-100 flex">
      {/* Sidebar de escritorio */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-base-800 flex-col">
        <div className="px-4 py-5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-fuchsia-500 flex items-center justify-center text-sm shadow-glow shadow-sky-500/30">
            ✨
          </div>
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
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                  activo
                    ? "bg-gradient-to-r from-sky-600/20 to-fuchsia-600/10 text-sky-300 shadow-glow shadow-sky-500/10"
                    : "text-base-400 hover:text-base-100 hover:bg-base-900"
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
          <button className="text-xs text-base-500 hover:text-base-300 mt-2" onClick={cambiarDePerfil}>
            Cambiar de perfil
          </button>
        </div>
      </aside>

      {/* Barra superior de celular */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 h-14 bg-base-900/90 backdrop-blur border-b border-base-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500 to-fuchsia-500 flex items-center justify-center text-xs">
            ✨
          </div>
          <span className="font-semibold text-sm">{nombreSistema}</span>
        </div>
        <button onClick={() => setMenuMovilAbierto(true)} className="text-base-300 p-1.5">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 min-w-0 px-4 md:px-6 py-6 pt-20 pb-24 md:pt-6 md:pb-6 max-w-6xl mx-auto w-full">
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

      {/* Barra inferior de celular */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch bg-base-900/95 backdrop-blur border-t border-base-800 pb-[env(safe-area-inset-bottom)]">
        {TABS_MOVIL_PRINCIPAL.map((id) => {
          const t = TABS.find((x) => x.id === id)!;
          const Icon = t.icon;
          const activo = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                activo ? "text-sky-400" : "text-base-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              {t.label}
            </button>
          );
        })}
        <button
          onClick={() => setMenuMovilAbierto(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium text-base-500"
        >
          <Menu className="w-5 h-5" />
          Más
        </button>
      </nav>

      {menuMovilAbierto && (
        <MenuMovil
          tabActual={tab}
          onElegir={(t) => {
            setTab(t);
            setMenuMovilAbierto(false);
          }}
          onCerrar={() => setMenuMovilAbierto(false)}
          onCambiarPerfil={cambiarDePerfil}
        />
      )}
    </div>
  );
}
