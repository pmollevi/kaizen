import { firmarVapidJwt } from "./vapid";
import { cifrarPayload, type ClaveSuscripcion } from "./encrypt";

export interface SuscripcionPush {
  endpoint: string;
  keys: ClaveSuscripcion;
}

export interface EnvVapid {
  VAPID_PUBLIC_RAW: string;
  VAPID_PRIVATE_JWK: string;
  VAPID_SUBJECT: string;
}

/** Manda un push real al navegador. Devuelve el status HTTP del servicio de push (410/404 = suscripcion muerta, hay que borrarla). */
export async function enviarWebPush(
  suscripcion: SuscripcionPush,
  payload: { title: string; body: string; ir?: string; tag?: string },
  env: EnvVapid,
  ttlSegundos = 86400
): Promise<{ ok: boolean; status: number }> {
  const audience = new URL(suscripcion.endpoint).origin;
  const privateJwk = JSON.parse(env.VAPID_PRIVATE_JWK) as JsonWebKey;
  const jwt = await firmarVapidJwt(audience, env.VAPID_SUBJECT, privateJwk);

  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const cuerpo = await cifrarPayload(payloadBytes, suscripcion.keys);

  const res = await fetch(suscripcion.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: String(ttlSegundos),
      Authorization: `vapid t=${jwt}, k=${env.VAPID_PUBLIC_RAW}`,
    },
    body: cuerpo,
  });
  return { ok: res.ok, status: res.status };
}
