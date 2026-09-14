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
import { crearPerfil, getPerfilActivo, listarPerfiles, setPerfilActivo, verificarPassword } from "@/store/profiles";
import { Button, Card, Field, Input, Badge } from "@/components/ui/Primitives";
import { KaizenMark } from "@/components/ui/KaizenMark";
import { FabAgregarGasto } from "@/components/finanzas/FabAgregarGasto";
import { PanelPrincipal } from "@/components/panel/PanelPrincipal";
import { BienvenidaFlow } from "@/components/onboarding/Bienvenida";
import { RegistroDiarioView } from "@/components/registro/RegistroDiario";
import { FinanzasView } from "@/components/finanzas/Finanzas";
import { CierreSemanalView } from "@/components/cierre/CierreSemanal";
import { TemporadaView } from "@/components/temporada/Temporada";
import { RecompensasView } from "@/components/recompensas/Recompensas";
import { ReconocimientosView } from "@/components/reconocimientos/Reconocimientos";
import { HistorialView } from "@/components/historial/Historial";
import { ConfiguracionView } from "@/components/config/Configuracion";
import { sincronizarDatosRecordatorio } from "@/lib/push";

type TabId = "panel" | "registro" | "finanzas" | "cierre" | "temporada" | "recompensas" | "reconocimientos" | "historial" | "config";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "panel", label: "Panel", icon: LayoutDashboard },
  { id: "registro", label: "Hábitos", icon: ListChecks },
  { id: "finanzas", label: "Finanzas", icon: Wallet },
  { id: "cierre", label: "Cierre semanal", icon: CalendarClock },
  { id: "temporada", label: "Temporada", icon: Gauge },
  { id: "recompensas", label: "Recompensas", icon: Gift },
  { id: "reconocimientos", label: "Reconocimientos", icon: Medal },
  { id: "historial", label: "Historial", icon: Trophy },
  { id: "config", label: "Config.", icon: Settings },
];

// Las 4 secciones principales viven siempre visibles (barra inferior en celular,
// sidebar en escritorio); el resto se accede desde el menú ☰ de arriba a la derecha.
const TABS_PRINCIPALES: TabId[] = ["panel", "registro", "finanzas", "recompensas"];

// Identidad de color por sección (ver DESIGN.md "Identidad de sección"): el
// fondo y el acento de acción (botones) no cambian, solo el nav de cada una.
// Clases completas y literales a propósito — Tailwind necesita verlas así para generarlas.
const ACENTO_TAB: Record<string, { pill: string; icon: string; iconInactivo?: string }> = {
  panel: { pill: "bg-kaizen-500", icon: "text-kaizen-400" },
  registro: { pill: "bg-habitos-500", icon: "text-habitos-400" },
  finanzas: { pill: "bg-finanzas-500", icon: "text-finanzas-400" },
  recompensas: { pill: "bg-gold-500", icon: "text-gold-400" },
};
const DATA_COACH_TAB: Partial<Record<TabId, string>> = {
  registro: "coach-nav-registro",
  finanzas: "coach-nav-finanzas",
  recompensas: "coach-nav-recompensas",
};

function Logo() {
  return (
    <div className="w-11 h-11 rounded-2xl bg-base-850 border border-base-700 flex items-center justify-center mb-3">
      <KaizenMark size={22} />
    </div>
  );
}

function PantallaLogin({
  onEntrar,
  onIrACrear,
}: {
  onEntrar: (esNuevo: boolean) => void;
  onIrACrear: () => void;
}) {
  const reiniciar = useKaizenStore((s) => s.reiniciarConNombre);
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // No se lista quién tiene cuenta en este navegador: el usuario escribe su
  // nombre y contraseña como en cualquier login, y solo se busca el perfil
  // que coincide puertas adentro. Un usuario o contraseña equivocados dan el
  // mismo mensaje genérico — no revela cuáles nombres existen.
  const entrar = async () => {
    if (!nombre.trim()) {
      setError("Escribe tu nombre de usuario.");
      return;
    }
    setCargando(true);
    setError("");
    const perfil = listarPerfiles().find((p) => p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
    const ok = perfil ? await verificarPassword(perfil, password) : false;
    setCargando(false);
    if (!perfil || !ok) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }
    setPerfilActivo(perfil.id);
    reiniciar(perfil.nombre);
    useKaizenStore.persist.rehydrate();
    onEntrar(false);
  };

  return (
    <>
      <div className="mb-5">
        <Logo />
        <div className="text-lg font-semibold tracking-tight">Iniciar sesión</div>
        <div className="text-sm text-base-400 mt-1">Entra a tu perfil de Kaizen en este navegador.</div>
      </div>

      <div className="space-y-3 mb-5">
        <Field label="Usuario">
          <Input
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && entrar()}
          />
        </Field>
        <Field label="Contraseña">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && entrar()}
          />
        </Field>
        {error && <Badge tone="red">{error}</Badge>}
        <Button className="w-full" disabled={cargando} onClick={entrar}>
          {cargando ? "Entrando..." : "Entrar"}
        </Button>
      </div>

      <p className="text-sm text-base-400">
        ¿No tienes cuenta?{" "}
        <button onClick={onIrACrear} className="text-kaizen-400 font-medium hover:text-kaizen-300">
          Crear una
        </button>
      </p>
    </>
  );
}

function PantallaCrearCuenta({
  hayPerfiles,
  onEntrar,
  onIrALogin,
}: {
  hayPerfiles: boolean;
  onEntrar: (esNuevo: boolean) => void;
  onIrALogin: () => void;
}) {
  const reiniciar = useKaizenStore((s) => s.reiniciarConNombre);
  const [nombre, setNombre] = useState("");
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
    const perfil = await crearPerfil(nombre.trim(), password);
    setCargando(false);
    setPerfilActivo(perfil.id);
    reiniciar(nombre.trim());
    onEntrar(true);
  };

  return (
    <>
      <div className="mb-5">
        <Logo />
        <div className="text-lg font-semibold tracking-tight">Crear cuenta</div>
        <div className="text-sm text-base-400 mt-1">
          Protege tu progreso con una contraseña. Se guarda solo en este navegador — no hay recuperación si la
          olvidas.
        </div>
      </div>

      <div className="space-y-3">
        <Field label="Nombre">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="¿Cómo te llamas?" />
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
          <button onClick={onIrALogin} className="text-kaizen-400 font-medium hover:text-kaizen-300">
            Iniciar sesión
          </button>
        </p>
      )}
    </>
  );
}

function ProfileGate({ onEntrar }: { onEntrar: (esNuevo: boolean) => void }) {
  const perfiles = useMemo(() => listarPerfiles(), []);
  const [modo, setModo] = useState<"login" | "signup">(perfiles.length > 0 ? "login" : "signup");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm relative animate-fade-up">
        {modo === "login" ? (
          <PantallaLogin onEntrar={onEntrar} onIrACrear={() => setModo("signup")} />
        ) : (
          <PantallaCrearCuenta hayPerfiles={perfiles.length > 0} onEntrar={onEntrar} onIrALogin={() => setModo("login")} />
        )}
        <p className="text-xs text-base-500 mt-4 pt-4 border-t border-base-700">
          Tus datos se guardan solo en este navegador. Exporta desde Configuración para respaldarlos. Si activas
          notificaciones, tu suscripción push y lo mínimo necesario para avisarte (última fecha registrada, nombre y
          día de corte de tus tarjetas) se guardan en un servidor solo para eso — el resto de tus hábitos y finanzas
          nunca sale de este navegador.
        </p>
      </Card>
    </div>
  );
}

// Menú de opciones: hoja inferior en celular, panel anclado arriba a la derecha
// en escritorio. Ambos abren desde el mismo botón ☰.
function MenuOpciones({
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
  const otras = TABS.filter((t) => !TABS_PRINCIPALES.includes(t.id));
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-start md:justify-end md:pt-16 md:pr-6"
      onClick={onCerrar}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full md:w-72 bg-base-900 border border-base-700 rounded-t-2xl md:rounded-2xl p-4 pb-8 md:pb-4 animate-fade-up max-h-[75vh] overflow-y-auto shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-base-700 mx-auto mb-4 md:hidden" />
        <div className="space-y-1.5">
          {otras.map((t) => {
            const Icon = t.icon;
            const activo = tabActual === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onElegir(t.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors border ${
                  activo
                    ? "bg-kaizen-500/10 text-kaizen-400 border-kaizen-500/20"
                    : "bg-base-850 text-base-300 border-base-700 hover:bg-base-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={onCambiarPerfil}
          className="w-full text-center text-sm text-base-400 mt-4 pt-4 border-t border-base-700"
        >
          Cambiar de perfil
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [perfilId, setPerfilId] = useState<string | null>(getPerfilActivo());
  const [bienvenidaPendiente, setBienvenidaPendiente] = useState(false);
  const [tab, setTab] = useState<TabId>("panel");
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const usuario = useKaizenStore((s) => s.usuario);
  const nombreSistema = useKaizenStore((s) => s.config.textos.nombreSistema);
  const tituloActivo = useKaizenStore((s) => s.config.catalogoReconocimientos.find((c) => c.id === s.usuario.tituloActivo)?.nombre ?? null);
  const procesarCierres = useKaizenStore((s) => s.procesarCierresMensualesPendientes);
  const registrosDiarios = useKaizenStore((s) => s.registrosDiarios);
  const tarjetas = useKaizenStore((s) => s.finanzas.tarjetas);

  useEffect(() => {
    if (!perfilId) return;
    procesarCierres();
  }, [perfilId]);

  // Mantiene al Worker de avisos al día si el usuario ya activó notificaciones
  // push — no hace nada si nunca las activó (ver lib/push).
  useEffect(() => {
    if (!perfilId) return;
    const ultimoRegistro =
      registrosDiarios.length > 0 ? [...registrosDiarios].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0].fecha : null;
    void sincronizarDatosRecordatorio(perfilId, {
      ultimoRegistro,
      tarjetas: tarjetas.map((t) => ({ nombre: t.nombre, diaCorte: t.diaCorte })),
    });
  }, [perfilId, registrosDiarios, tarjetas]);

  const perfilActual = useMemo(() => listarPerfiles().find((p) => p.id === perfilId), [perfilId]);

  if (!perfilId) {
    return (
      <ProfileGate
        onEntrar={(esNuevo) => {
          setPerfilId(getPerfilActivo());
          if (esNuevo) setBienvenidaPendiente(true);
        }}
      />
    );
  }

  if (bienvenidaPendiente) {
    return <BienvenidaFlow onFinalizar={() => setBienvenidaPendiente(false)} />;
  }

  const cambiarDePerfil = () => {
    setPerfilActivo(null);
    setPerfilId(null);
  };

  return (
    <div className="min-h-screen text-base-100 flex">
      {/* Sidebar de escritorio */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-base-700 flex-col bg-base-900">
        <div className="px-4 py-5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-base-850 border border-base-700 flex items-center justify-center">
            <KaizenMark size={16} />
          </div>
          <span className="font-semibold tracking-tight">{nombreSistema}</span>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {TABS.filter((t) => TABS_PRINCIPALES.includes(t.id)).map((t) => {
            const Icon = t.icon;
            const activo = tab === t.id;
            const acento = ACENTO_TAB[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                data-coach={DATA_COACH_TAB[t.id]}
                className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  activo ? "bg-base-850 text-base-100" : "text-base-400 hover:text-base-100 hover:bg-base-850/60"
                }`}
              >
                {activo && <span className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full ${acento.pill}`} />}
                <Icon className={`w-4 h-4 ${activo ? acento.icon : ""}`} />
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-base-700">
          <div className="text-sm font-medium truncate">{perfilActual?.nombre ?? usuario.nombre}</div>
          <div className="text-xs text-base-500 mt-0.5 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Nivel {usuario.nivelGlobal}
          </div>
          {tituloActivo && (
            <div className="text-xs text-gold-400 mt-0.5 truncate">{tituloActivo}</div>
          )}
          <button className="text-xs text-base-500 hover:text-base-300 mt-2" onClick={cambiarDePerfil}>
            Cambiar de perfil
          </button>
        </div>
      </aside>

      {/* Barra superior de celular */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 h-14 bg-base-900/95 border-b border-base-700">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-base-850 border border-base-700 flex items-center justify-center">
            <KaizenMark size={13} />
          </div>
          <span className="font-semibold text-sm">{nombreSistema}</span>
        </div>
        <button onClick={() => setMenuMovilAbierto(true)} className="text-base-300 p-1.5" aria-label="Más opciones">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Menú ☰ de escritorio: accede a cierre semanal, temporada, reconocimientos, historial y config. */}
      <button
        onClick={() => setMenuMovilAbierto(true)}
        aria-label="Más opciones"
        className="hidden md:flex fixed top-5 right-6 z-30 w-10 h-10 rounded-full bg-base-900 border border-base-700 items-center justify-center text-base-300 hover:text-base-100 hover:bg-base-850 transition-colors shadow-card"
      >
        <Menu className="w-5 h-5" />
      </button>

      <main className="flex-1 min-w-0 px-4 md:px-6 py-6 pt-20 pb-24 md:pt-6 md:pb-6 max-w-6xl mx-auto w-full">
        <div key={tab} className="animate-fade-up">
          {tab === "panel" && <PanelPrincipal irA={(t) => setTab(t as TabId)} />}
          {tab === "registro" && <RegistroDiarioView />}
          {tab === "finanzas" && <FinanzasView />}
          {tab === "cierre" && <CierreSemanalView />}
          {tab === "temporada" && <TemporadaView />}
          {tab === "recompensas" && <RecompensasView />}
          {tab === "reconocimientos" && <ReconocimientosView />}
          {tab === "historial" && <HistorialView />}
          {tab === "config" && <ConfiguracionView />}
        </div>
      </main>

      {/* Barra inferior de celular: mismas 4 secciones principales que el sidebar de escritorio. */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch bg-base-900 border-t border-base-700 pb-[env(safe-area-inset-bottom)]">
        {TABS_PRINCIPALES.map((id) => {
          const t = TABS.find((x) => x.id === id)!;
          const Icon = t.icon;
          const activo = tab === id;
          const acento = ACENTO_TAB[id];
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              data-coach={DATA_COACH_TAB[id]}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                activo ? acento.icon : "text-base-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              {t.label}
            </button>
          );
        })}
      </nav>

      {menuMovilAbierto && (
        <MenuOpciones
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
