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
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import { useKaizenStore } from "@/store/useKaizenStore";
import {
  crearPerfil,
  getPerfilActivo,
  listarPerfiles,
  setPerfilActivo,
  verificarPassword,
  type Perfil,
} from "@/store/profiles";
import { Button, Card, Field, Input, Badge } from "@/components/ui/Primitives";
import { FabAgregarGasto } from "@/components/finanzas/FabAgregarGasto";
import { ArrowLeft, Lock, User } from "lucide-react";
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

function Logo() {
  return (
    <div className="w-11 h-11 rounded-2xl bg-sky-500 flex items-center justify-center mb-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_24px_-8px_rgba(59,130,246,0.6)]">
      <Sparkles className="w-5 h-5 text-white" />
    </div>
  );
}

function PantallaLogin({ perfiles, onEntrar, onIrACrear }: { perfiles: Perfil[]; onEntrar: () => void; onIrACrear: () => void }) {
  const reiniciar = useKaizenStore((s) => s.reiniciarConNombre);
  const [seleccionado, setSeleccionado] = useState<Perfil | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const entrarComo = async (p: Perfil, pass: string) => {
    setCargando(true);
    setError("");
    const ok = await verificarPassword(p, pass);
    setCargando(false);
    if (!ok) {
      setError("Contraseña incorrecta.");
      return;
    }
    setPerfilActivo(p.id);
    reiniciar(p.nombre);
    useKaizenStore.persist.rehydrate();
    onEntrar();
  };

  const elegir = (p: Perfil) => {
    setError("");
    setPassword("");
    if (!p.passwordHash) {
      entrarComo(p, "");
    } else {
      setSeleccionado(p);
    }
  };

  return (
    <>
      <div className="mb-5">
        <Logo />
        <div className="text-lg font-semibold tracking-tight">Iniciar sesión</div>
        <div className="text-sm text-base-400 mt-1">Entra a tu perfil de Kaizen en este navegador.</div>
      </div>

      {!seleccionado ? (
        perfiles.length > 0 ? (
          <div className="space-y-2 mb-5">
            {perfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => elegir(p)}
                className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 active:scale-[0.98] text-sm font-medium transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-base-300" />
                </div>
                <div className="min-w-0">
                  <div className="truncate">{p.nombre}</div>
                  {p.email && <div className="text-xs text-base-500 truncate">{p.email}</div>}
                </div>
                {p.passwordHash && <Lock className="w-3.5 h-3.5 text-base-500 ml-auto shrink-0" />}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-500 mb-5">Todavía no tienes un perfil en este navegador.</p>
        )
      ) : (
        <div className="space-y-3 mb-5">
          <button
            onClick={() => setSeleccionado(null)}
            className="inline-flex items-center gap-1.5 text-xs text-base-500 hover:text-base-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Elegir otro perfil
          </button>
          <div className="text-sm font-medium">{seleccionado.nombre}</div>
          <Field label="Contraseña">
            <Input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && entrarComo(seleccionado, password)}
            />
          </Field>
          {error && <Badge tone="red">{error}</Badge>}
          <Button className="w-full" disabled={cargando} onClick={() => entrarComo(seleccionado, password)}>
            {cargando ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      )}

      <p className="text-sm text-base-400">
        ¿No tienes cuenta?{" "}
        <button onClick={onIrACrear} className="text-sky-400 font-medium hover:text-sky-300">
          Crear una
        </button>
      </p>
    </>
  );
}

function PantallaCrearCuenta({ hayPerfiles, onEntrar, onIrALogin }: { hayPerfiles: boolean; onEntrar: () => void; onIrALogin: () => void }) {
  const reiniciar = useKaizenStore((s) => s.reiniciarConNombre);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const crear = async () => {
    if (!nombre.trim()) return setError("Ponle un nombre a tu perfil.");
    if (password.length < 6) return setError("La contraseña necesita al menos 6 caracteres.");
    if (password !== confirmar) return setError("Las contraseñas no coinciden.");
    setError("");
    setCargando(true);
    const perfil = await crearPerfil(nombre.trim(), email, password);
    setCargando(false);
    setPerfilActivo(perfil.id);
    reiniciar(nombre.trim());
    onEntrar();
  };

  return (
    <>
      <div className="mb-5">
        <Logo />
        <div className="text-lg font-semibold tracking-tight">Crear cuenta</div>
        <div className="text-sm text-base-400 mt-1">
          Protege tu progreso con una contraseña. Se guarda solo en este navegador, no hay recuperación por correo.
        </div>
      </div>

      <div className="space-y-3">
        <Field label="Nombre">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="¿Cómo te llamas?" />
        </Field>
        <Field label="Correo (opcional)">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
        </Field>
        <Field label="Contraseña" hint="Mínimo 6 caracteres.">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Confirmar contraseña">
          <Input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && crear()}
          />
        </Field>
        {error && <Badge tone="red">{error}</Badge>}
        <Button className="w-full" disabled={cargando} onClick={crear}>
          {cargando ? "Creando..." : "Crear cuenta"}
        </Button>
      </div>

      {hayPerfiles && (
        <p className="text-sm text-base-400 mt-4">
          ¿Ya tienes cuenta?{" "}
          <button onClick={onIrALogin} className="text-sky-400 font-medium hover:text-sky-300">
            Iniciar sesión
          </button>
        </p>
      )}
    </>
  );
}

function ProfileGate({ onEntrar }: { onEntrar: () => void }) {
  const perfiles = useMemo(() => listarPerfiles(), []);
  const [modo, setModo] = useState<"login" | "signup">(perfiles.length > 0 ? "login" : "signup");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm relative animate-fade-up">
        {modo === "login" ? (
          <PantallaLogin perfiles={perfiles} onEntrar={onEntrar} onIrACrear={() => setModo("signup")} />
        ) : (
          <PantallaCrearCuenta hayPerfiles={perfiles.length > 0} onEntrar={onEntrar} onIrALogin={() => setModo("login")} />
        )}
        <p className="text-xs text-base-500 mt-4 pt-4 border-t border-white/10">
          Tus datos se guardan solo en este navegador. Exporta desde Configuración para respaldarlos.
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full bg-base-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl p-4 pb-8 animate-fade-up max-h-[75vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mb-4" />
        <div className="grid grid-cols-3 gap-2">
          {otras.map((t) => {
            const Icon = t.icon;
            const activo = tabActual === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onElegir(t.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium transition-colors border ${
                  activo ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-white/[0.03] text-base-300 border-white/[0.06]"
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
          className="w-full text-center text-sm text-base-400 mt-5 pt-4 border-t border-white/10"
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
    <div className="min-h-screen text-base-100 flex">
      {/* Sidebar de escritorio */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-white/[0.08] flex-col bg-white/[0.015] backdrop-blur-xl">
        <div className="px-4 py-5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_4px_14px_-4px_rgba(59,130,246,0.7)]">
            <Sparkles className="w-3.5 h-3.5 text-white" />
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
                className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  activo ? "bg-white/[0.06] text-base-100" : "text-base-400 hover:text-base-100 hover:bg-white/[0.03]"
                }`}
              >
                {activo && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-sky-400" />}
                <Icon className={`w-4 h-4 ${activo ? "text-sky-400" : ""}`} />
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/[0.08]">
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
      <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 h-14 bg-base-900/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-500 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
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
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch bg-base-900/80 backdrop-blur-xl border-t border-white/[0.08] pb-[env(safe-area-inset-bottom)]">
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

      <FabAgregarGasto />
    </div>
  );
}
