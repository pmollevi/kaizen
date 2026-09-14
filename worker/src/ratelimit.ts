// Rate limiting simple sobre KV: una ventana fija por clave (ip, perfilId,
// etc.), sin gastar de más la cuota gratuita de KV (1 escritura por
// solicitud real, con expirationTtl para que el propio KV limpie la clave).
export async function bajoLimite(
  kv: KVNamespace,
  clave: string,
  maxPorVentana: number,
  ventanaSegundos: number
): Promise<boolean> {
  const claveKv = `rl:${clave}`;
  const actualRaw = await kv.get(claveKv);
  const actual = actualRaw ? parseInt(actualRaw, 10) : 0;
  if (actual >= maxPorVentana) return false;
  await kv.put(claveKv, String(actual + 1), { expirationTtl: ventanaSegundos });
  return true;
}

export function ipDeSolicitud(request: Request): string {
  return request.headers.get("CF-Connecting-IP") || "desconocida";
}
