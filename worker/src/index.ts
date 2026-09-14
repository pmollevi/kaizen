// Worker de avisos de Origo: guarda la suscripcion push minima de cada
// perfil y, dos veces al dia (Cron Trigger), revisa si hay que avisar de una
// racha en riesgo o de un corte de tarjeta proximo. El festejo de racha NO
// pasa por aqui — ese lo dispara el propio navegador en el momento (ver
// src/lib/notificaciones.ts del frontend).
import { enviarWebPush, type SuscripcionPush } from "./webpush";
import { bajoLimite, ipDeSolicitud } from "./ratelimit";

export interface Env {
  KAIZEN_PUSH_KV: KVNamespace;
  VAPID_PUBLIC_RAW: string;
  VAPID_PRIVATE_JWK: string;
  VAPID_SUBJECT: string;
  ALLOWED_ORIGIN?: string;
}

interface Tarjeta {
  nombre: string;
  diaCorte: number;
}

interface RegistroPerfil {
  subscription?: SuscripcionPush;
  ultimoRegistro?: string | null;
  tarjetas?: Tarjeta[];
  avisosEnviados?: Record<string, true>;
}

const PREFIJO = "sub:";
const DIAS_AVISO_CORTE = 2;
const RETENCION_AVISOS_DIAS = 45;
// Solo se acepta este origen exacto (el sitio publicado en Cloudflare Pages).
// Si ALLOWED_ORIGIN no está configurado, se usa este valor — nunca se
// refleja el Origin de la solicitud ni se responde con "*".
const ORIGEN_PERMITIDO_DEFAULT = "https://origo-app.pages.dev";

function corsHeaders(env: Env): HeadersInit {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || ORIGEN_PERMITIDO_DEFAULT,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(data: unknown, status: number, env: Env): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(env) },
  });
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function diasEntreISO(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / 86400000);
}

/** Proxima fecha de corte (hoy o en el futuro) para una tarjeta, en UTC. Aproximado a proposito: no conocemos la zona horaria del usuario (ver README del worker). */
function proximoCorte(diaCorte: number, hoy: string): string {
  const [anio, mes, dia] = hoy.split("-").map(Number);
  const diasEnMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const diaCorteValido = Math.min(diaCorte, diasEnMes);
  const esteMes = `${anio}-${String(mes).padStart(2, "0")}-${String(diaCorteValido).padStart(2, "0")}`;
  if (dia <= diaCorteValido) return esteMes;
  const siguienteMesDate = new Date(Date.UTC(anio, mes, 1));
  const anio2 = siguienteMesDate.getUTCFullYear();
  const mes2 = siguienteMesDate.getUTCMonth() + 1;
  const diasEnMes2 = new Date(Date.UTC(anio2, mes2, 0)).getUTCDate();
  const diaCorte2 = Math.min(diaCorte, diasEnMes2);
  return `${anio2}-${String(mes2).padStart(2, "0")}-${String(diaCorte2).padStart(2, "0")}`;
}

function podarAvisosViejos(avisos: Record<string, true>, hoy: string): Record<string, true> {
  const salida: Record<string, true> = {};
  for (const clave of Object.keys(avisos)) {
    const fecha = clave.split("-").slice(-3).join("-");
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha) && Math.abs(diasEntreISO(fecha, hoy)) <= RETENCION_AVISOS_DIAS) {
      salida[clave] = true;
    }
  }
  return salida;
}

// --- Validacion de entrada: nada de lo que llega del cliente se confia a ciegas ---
function perfilIdValido(s: unknown): s is string {
  return typeof s === "string" && /^[a-z0-9_]{3,48}$/i.test(s);
}
function fechaISOValidaONula(s: unknown): s is string | null {
  return s === null || (typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s));
}
function tarjetasValidas(arr: unknown): arr is Tarjeta[] {
  if (!Array.isArray(arr) || arr.length > 3) return false;
  return arr.every(
    (t) =>
      t &&
      typeof t === "object" &&
      typeof (t as Tarjeta).nombre === "string" &&
      (t as Tarjeta).nombre.length > 0 &&
      (t as Tarjeta).nombre.length <= 60 &&
      Number.isInteger((t as Tarjeta).diaCorte) &&
      (t as Tarjeta).diaCorte >= 1 &&
      (t as Tarjeta).diaCorte <= 31
  );
}
function suscripcionValida(s: unknown): s is SuscripcionPush {
  if (!s || typeof s !== "object") return false;
  const sub = s as Record<string, unknown>;
  if (typeof sub.endpoint !== "string" || !sub.endpoint.startsWith("https://") || sub.endpoint.length > 500)
    return false;
  const keys = sub.keys as Record<string, unknown> | undefined;
  if (!keys || typeof keys.p256dh !== "string" || typeof keys.auth !== "string") return false;
  if (keys.p256dh.length < 20 || keys.p256dh.length > 300) return false;
  if (keys.auth.length < 10 || keys.auth.length > 100) return false;
  return true;
}

async function revisarYAvisarPerfil(perfilId: string, registro: RegistroPerfil, env: Env): Promise<void> {
  if (!registro.subscription) return;
  const hoy = hoyISO();
  let avisosEnviados = registro.avisosEnviados ?? {};
  let cambiado = false;

  const claveRacha = `racha-${hoy}`;
  if (registro.ultimoRegistro !== hoy && !avisosEnviados[claveRacha]) {
    const { ok, status } = await enviarWebPush(
      registro.subscription,
      {
        title: "No pierdas tu racha",
        body: "Todavía no registraste tu día en Origo — un minuto y la sigues sumando.",
        ir: "registro",
        tag: "kaizen-racha",
      },
      env
    );
    if (status === 404 || status === 410) {
      await env.KAIZEN_PUSH_KV.delete(`${PREFIJO}${perfilId}`);
      return;
    }
    if (ok) {
      avisosEnviados = { ...avisosEnviados, [claveRacha]: true };
      cambiado = true;
    }
  }

  for (const t of registro.tarjetas ?? []) {
    const corte = proximoCorte(t.diaCorte, hoy);
    const diasFaltantes = diasEntreISO(hoy, corte);
    const claveCorte = `corte-${t.nombre}-${corte}`;
    if (diasFaltantes >= 0 && diasFaltantes <= DIAS_AVISO_CORTE && !avisosEnviados[claveCorte]) {
      const texto =
        diasFaltantes === 0
          ? `Tu tarjeta ${t.nombre} corta hoy.`
          : `Tu tarjeta ${t.nombre} corta en ${diasFaltantes} ${diasFaltantes === 1 ? "día" : "días"}.`;
      const { ok, status } = await enviarWebPush(
        registro.subscription,
        { title: "Corte de tarjeta próximo", body: texto, ir: "finanzas", tag: `kaizen-corte-${t.nombre}` },
        env
      );
      if (status === 404 || status === 410) {
        await env.KAIZEN_PUSH_KV.delete(`${PREFIJO}${perfilId}`);
        return;
      }
      if (ok) {
        avisosEnviados = { ...avisosEnviados, [claveCorte]: true };
        cambiado = true;
      }
    }
  }

  if (cambiado) {
    avisosEnviados = podarAvisosViejos(avisosEnviados, hoy);
    await env.KAIZEN_PUSH_KV.put(`${PREFIJO}${perfilId}`, JSON.stringify({ ...registro, avisosEnviados }));
  }
}

async function manejarSubscribe(request: Request, env: Env): Promise<Response> {
  let cuerpo: {
    perfilId?: string;
    subscription?: unknown;
    ultimoRegistro?: string | null;
    tarjetas?: unknown;
  };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: "JSON inválido" }, 400, env);
  }
  if (!perfilIdValido(cuerpo.perfilId)) return json({ error: "perfilId inválido" }, 400, env);

  const ip = ipDeSolicitud(request);
  if (!(await bajoLimite(env.KAIZEN_PUSH_KV, `sub-perfil:${cuerpo.perfilId}`, 30, 3600))) {
    return json({ error: "Demasiadas solicitudes, intenta más tarde" }, 429, env);
  }
  if (!(await bajoLimite(env.KAIZEN_PUSH_KV, `sub-ip:${ip}`, 60, 3600))) {
    return json({ error: "Demasiadas solicitudes, intenta más tarde" }, 429, env);
  }

  if (cuerpo.subscription !== undefined && !suscripcionValida(cuerpo.subscription)) {
    return json({ error: "subscription inválida" }, 400, env);
  }
  if (cuerpo.tarjetas !== undefined && !tarjetasValidas(cuerpo.tarjetas)) {
    return json({ error: "tarjetas inválidas" }, 400, env);
  }
  if (cuerpo.ultimoRegistro !== undefined && !fechaISOValidaONula(cuerpo.ultimoRegistro)) {
    return json({ error: "ultimoRegistro inválido" }, 400, env);
  }

  const claveKv = `${PREFIJO}${cuerpo.perfilId}`;
  const existenteRaw = await env.KAIZEN_PUSH_KV.get(claveKv);
  const existente: RegistroPerfil = existenteRaw ? JSON.parse(existenteRaw) : {};

  const subscription = (cuerpo.subscription as SuscripcionPush | undefined) ?? existente.subscription;
  if (!subscription) {
    return json({ error: "No hay suscripción registrada para este perfil todavía" }, 400, env);
  }

  const actualizado: RegistroPerfil = {
    subscription,
    ultimoRegistro: cuerpo.ultimoRegistro !== undefined ? cuerpo.ultimoRegistro : existente.ultimoRegistro ?? null,
    tarjetas: (cuerpo.tarjetas as Tarjeta[] | undefined) ?? existente.tarjetas ?? [],
    avisosEnviados: existente.avisosEnviados ?? {},
  };
  await env.KAIZEN_PUSH_KV.put(claveKv, JSON.stringify(actualizado));
  return json({ ok: true }, 200, env);
}

async function manejarUnsubscribe(request: Request, env: Env): Promise<Response> {
  let cuerpo: { perfilId?: string };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: "JSON inválido" }, 400, env);
  }
  if (!perfilIdValido(cuerpo.perfilId)) return json({ error: "perfilId inválido" }, 400, env);
  await env.KAIZEN_PUSH_KV.delete(`${PREFIJO}${cuerpo.perfilId}`);
  return json({ ok: true }, 200, env);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (request.method === "POST" && url.pathname === "/api/subscribe") return manejarSubscribe(request, env);
    if (request.method === "POST" && url.pathname === "/api/unsubscribe") return manejarUnsubscribe(request, env);

    return json({ error: "No encontrado" }, 404, env);
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    let cursor: string | undefined;
    do {
      const listado = await env.KAIZEN_PUSH_KV.list({ prefix: PREFIJO, cursor });
      for (const clave of listado.keys) {
        const raw = await env.KAIZEN_PUSH_KV.get(clave.name);
        if (!raw) continue;
        const perfilId = clave.name.slice(PREFIJO.length);
        const registro: RegistroPerfil = JSON.parse(raw);
        ctx.waitUntil(revisarYAvisarPerfil(perfilId, registro, env));
      }
      cursor = listado.list_complete ? undefined : listado.cursor;
    } while (cursor);
  },
};
