// Cifrado del payload de Web Push: RFC 8291 (Message Encryption for Web
// Push) sobre el content-coding aes128gcm de RFC 8188. Implementado a mano
// con WebCrypto porque el runtime de Workers no soporta de forma confiable
// el paquete npm "web-push" (pensado para el crypto nativo de Node).
import { base64UrlToBytes, bytesToBase64Url, concatBytes } from "./base64";

async function hmacSha256(clave: Uint8Array, datos: Uint8Array): Promise<Uint8Array> {
  const claveHmac = await crypto.subtle.importKey("raw", clave, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const firma = await crypto.subtle.sign("HMAC", claveHmac, datos);
  return new Uint8Array(firma);
}

// HKDF-Expand de un solo bloque: valido porque nunca pedimos mas de 32 bytes (largo de SHA-256).
async function hkdfExpandCorto(prk: Uint8Array, info: Uint8Array, largo: number): Promise<Uint8Array> {
  const bloque = await hmacSha256(prk, concatBytes(info, new Uint8Array([1])));
  return bloque.slice(0, largo);
}

const TEXTO = (s: string) => new TextEncoder().encode(s);

export interface ClaveSuscripcion {
  p256dh: string; // base64url, punto EC sin comprimir de 65 bytes
  auth: string; // base64url, 16 bytes
}

/** Cifra `payload` para una suscripcion push dada. Devuelve el cuerpo completo (header aes128gcm + ciphertext) listo para el POST al endpoint. */
export async function cifrarPayload(payload: Uint8Array, claves: ClaveSuscripcion): Promise<Uint8Array> {
  const uaPublicBytes = base64UrlToBytes(claves.p256dh);
  const authSecret = base64UrlToBytes(claves.auth);

  const uaPublicKey = await crypto.subtle.importKey(
    "raw",
    uaPublicBytes,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );

  const parEfemero = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits",
  ])) as CryptoKeyPair;
  const asPublicKeyRaw = (await crypto.subtle.exportKey("raw", parEfemero.publicKey)) as ArrayBuffer;
  const asPublicBytes = new Uint8Array(asPublicKeyRaw);

  // El WebIDL real (WebCrypto spec, y lo que exige el runtime tanto de
  // Workers como de Node) usa la clave `public`; el tipo `$public` de
  // @cloudflare/workers-types es solo un artefacto de su generador de tipos
  // (escapa la palabra reservada), asi que se castea para no romper en runtime.
  const ecdhSecretBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: uaPublicKey } as unknown as SubtleCryptoDeriveKeyAlgorithm,
    parEfemero.privateKey,
    256
  );
  const ecdhSecret = new Uint8Array(ecdhSecretBits);

  // PRK_key = HKDF-Extract(salt=auth_secret, ikm=ecdh_secret)
  const prkKey = await hmacSha256(authSecret, ecdhSecret);
  const authInfo = concatBytes(TEXTO("WebPush: info"), new Uint8Array([0]), uaPublicBytes, asPublicBytes);
  const ikm = await hkdfExpandCorto(prkKey, authInfo, 32);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  // PRK = HKDF-Extract(salt, ikm)
  const prk = await hmacSha256(salt, ikm);

  const cek = await hkdfExpandCorto(prk, concatBytes(TEXTO("Content-Encoding: aes128gcm"), new Uint8Array([0])), 16);
  const nonce = await hkdfExpandCorto(prk, concatBytes(TEXTO("Content-Encoding: nonce"), new Uint8Array([0])), 12);

  // Un solo registro: delimitador 0x02 (ultimo registro), sin padding extra.
  const textoPlano = concatBytes(payload, new Uint8Array([2]));

  const claveAesGcm = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const cifradoConTag = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce, tagLength: 128 }, claveAesGcm, textoPlano)
  );

  const rs = 4096;
  const rsBytes = new Uint8Array(4);
  new DataView(rsBytes.buffer).setUint32(0, rs, false);

  const header = concatBytes(salt, rsBytes, new Uint8Array([asPublicBytes.length]), asPublicBytes);
  return concatBytes(header, cifradoConTag);
}

export { bytesToBase64Url };
