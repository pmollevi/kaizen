// Firma del JWT de VAPID (RFC 8292) usando WebCrypto — sin dependencias de
// Node, corre tal cual en el runtime de Cloudflare Workers.
import { base64UrlToBytes, bytesToBase64Url } from "./base64";

function base64UrlJson(obj: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(obj)));
}

/** privateJwk: el JSON de la llave privada VAPID (secreto VAPID_PRIVATE_JWK). */
export async function firmarVapidJwt(audience: string, subject: string, privateJwk: JsonWebKey): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600, // maximo permitido por RFC8292 es 24h; 12h es sobrado y mas seguro
    sub: subject,
  };
  const encabezado = base64UrlJson(header);
  const cuerpo = base64UrlJson(payload);
  const entrada = `${encabezado}.${cuerpo}`;

  const clave = await crypto.subtle.importKey(
    "jwk",
    privateJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  const firma = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    clave,
    new TextEncoder().encode(entrada)
  );
  return `${entrada}.${bytesToBase64Url(firma)}`;
}

export function bytesDesdeBase64Url(s: string): Uint8Array {
  return base64UrlToBytes(s);
}
