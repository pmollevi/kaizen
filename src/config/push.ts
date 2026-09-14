// Clave pública VAPID (no es secreta: viaja al navegador por diseño) y URL
// del Worker de Cloudflare que guarda suscripciones y manda los avisos
// mientras la app está cerrada. Generados una sola vez — ver worker/README.md
// para regenerarlos si hiciera falta.
export const VAPID_PUBLIC_KEY =
  "BCQxzQiQ6nIBsprzmUkbul-_PB_3prSg5KubO033PgcW1TR0w5tTkdIrpIrSR8Dsu6g5llfsZ5I8IwIIKQF6yfI";

export const PUSH_API_BASE = "https://kaizen-push.pablomollevi2007.workers.dev";
