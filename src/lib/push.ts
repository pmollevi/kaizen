// Web Push real: registra la suscripción del navegador en el Worker de
// Cloudflare para poder avisar aunque la app esté cerrada (racha en riesgo,
// corte de tarjeta). El festejo de racha NO pasa por aquí — ese se muestra
// directo desde el navegador en el momento (ver lib/notificaciones).
import { PUSH_API_BASE, VAPID_PUBLIC_KEY } from "@/config/push";
import type { Tarjeta } from "@/types";

export interface DatosRecordatorio {
  ultimoRegistro: string | null;
  tarjetas: Pick<Tarjeta, "nombre" | "diaCorte">[];
}

function clavePushActivo(perfilId: string): string {
  return `kaizen:push-activo:${perfilId}`;
}

export function avisosActivosLocalmente(perfilId: string): boolean {
  try {
    return localStorage.getItem(clavePushActivo(perfilId)) === "1";
  } catch {
    return false;
  }
}

function marcarAvisosLocalmente(perfilId: string, activo: boolean): void {
  try {
    if (activo) localStorage.setItem(clavePushActivo(perfilId), "1");
    else localStorage.removeItem(clavePushActivo(perfilId));
  } catch {
    // almacenamiento no disponible: no bloquea el resto de la app
  }
}

export function soportaPush(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Segura = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binario = atob(base64Segura);
  const salida = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) salida[i] = binario.charCodeAt(i);
  return salida;
}

async function enviarAlWorker(ruta: string, cuerpo: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${PUSH_API_BASE}${ruta}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
    return res.ok;
  } catch {
    // sin conexión o Worker caído: la app sigue funcionando, solo no queda registrado el aviso remoto
    return false;
  }
}

/** Pide permiso, suscribe al navegador a push y registra la suscripción en el Worker. Nunca se llama sola: solo desde el toggle en Configuración. */
export async function activarAvisos(
  perfilId: string,
  datos: DatosRecordatorio
): Promise<{ ok: boolean; motivo?: string }> {
  if (!soportaPush()) return { ok: false, motivo: "Este navegador no soporta notificaciones push." };

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") return { ok: false, motivo: "No se concedió el permiso de notificaciones." };

  try {
    const registro = await navigator.serviceWorker.ready;
    let suscripcion = await registro.pushManager.getSubscription();
    if (!suscripcion) {
      suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
    }
    const enviado = await enviarAlWorker("/api/subscribe", {
      perfilId,
      subscription: suscripcion.toJSON(),
      ultimoRegistro: datos.ultimoRegistro,
      tarjetas: datos.tarjetas,
    });
    if (!enviado) return { ok: false, motivo: "No se pudo conectar con el servidor de avisos. Intenta de nuevo." };
    marcarAvisosLocalmente(perfilId, true);
    return { ok: true };
  } catch {
    return { ok: false, motivo: "No se pudo activar la suscripción push en este navegador." };
  }
}

export async function desactivarAvisos(perfilId: string): Promise<void> {
  marcarAvisosLocalmente(perfilId, false);
  try {
    const registro = await navigator.serviceWorker.ready;
    const suscripcion = await registro.pushManager.getSubscription();
    if (suscripcion) await suscripcion.unsubscribe();
  } catch {
    // no bloquea: el registro remoto igual se limpia a continuación
  }
  await enviarAlWorker("/api/unsubscribe", { perfilId });
}

/** Mantiene al día los datos mínimos que el Worker necesita para decidir cuándo avisar (última fecha registrada, tarjetas y su día de corte). Solo llama al Worker si el usuario ya activó avisos. */
export async function sincronizarDatosRecordatorio(perfilId: string, datos: DatosRecordatorio): Promise<void> {
  if (!avisosActivosLocalmente(perfilId)) return;
  await enviarAlWorker("/api/subscribe", { perfilId, ultimoRegistro: datos.ultimoRegistro, tarjetas: datos.tarjetas });
}
