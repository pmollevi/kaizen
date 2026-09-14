# Origo — Worker de avisos (push real)

Backend mínimo, gratis, para poder avisar (racha en riesgo, corte de tarjeta
próximo) aunque la app esté cerrada. El festejo de racha NO pasa por aquí —
ese lo dispara el propio navegador en el momento (`src/lib/notificaciones.ts`
del frontend).

Nota: este Worker tuvo brevemente recuperación de contraseña y avisos por
correo (vía Resend), pero se quitaron a pedido — el correo no aportaba nada
real sin verificar un dominio propio en Resend (sin eso, solo entrega al
correo del dueño de la cuenta de Resend, nunca a otros usuarios). El secreto
`RESEND_API_KEY` ya se borró (`wrangler secret delete`). Si algún día quieres
retomarlo, el diseño (código de un solo uso, nunca la contraseña en sí)
sigue siendo válido — solo hay que verificar un dominio primero.

## Qué se creó en Cloudflare (para volver a entrar después)

- **Cuenta de Cloudflare**: la sesión quedó autenticada vía `wrangler login`
  (OAuth en el navegador) el 2026-09-13. Account ID: `8baa54a4ae76eff050e941fff32d49ab`.
  Entra en <https://dash.cloudflare.com> con la cuenta con la que aprobaste
  ese login.
- **Subdominio workers.dev**: `pablomollevi2007` (elegido al registrar el
  subdominio, paso único por cuenta).
- **Worker**: `kaizen-push`, desplegado en
  `https://kaizen-push.pablomollevi2007.workers.dev`. Se ve en el dashboard
  bajo **Workers & Pages → kaizen-push**.
- **KV Namespace**: `KAIZEN_PUSH_KV`, id `56b3828b8c9645209bb8fe488e1ffb56`.
  Se ve en **Workers & Pages → KV**. Guarda un registro por perfil
  (`sub:<perfilId>`) con la suscripción push y los datos mínimos para decidir
  cuándo avisar.
- **Cron Triggers**: `0 1 * * *` y `0 13 * * *` (UTC) — dos revisiones al día.
  Se ven en **kaizen-push → Settings → Trigger Events**.
- **Variables** (no secretas, visibles en el dashboard/`wrangler.toml`):
  `VAPID_PUBLIC_RAW`, `VAPID_SUBJECT`, `ALLOWED_ORIGIN` (fijo en
  `https://origo-app.pages.dev` — el Worker solo acepta ese origen).
- **Frontend (Cloudflare Pages)**: proyecto `origo-app`, publicado en
  `https://origo-app.pages.dev`. Se ve en el dashboard bajo **Workers &
  Pages → origo-app**. No tiene deploy automático conectado a GitHub —
  para publicar cambios del frontend corre, desde la raíz del repo:
  `npm run build && npx wrangler pages deploy dist --project-name=origo-app`.
  (Antes se usaba GitHub Pages en `pmollevi.github.io/kaizen/` — se
  desactivó, se borró `.github/workflows/deploy.yml`.)
- **Secreto**: `VAPID_PRIVATE_JWK` — se subió con `wrangler secret put`,
  nunca queda en el repo ni es legible desde el dashboard una vez guardado
  (ni siquiera por wrangler: `secret list` solo muestra el nombre, nunca el
  valor).
- **Cuenta de Resend**: se creó en resend.com durante el desarrollo pero ya
  no se usa (su API key se borró del Worker). Queda inactiva a menos que la
  uses para otra cosa; puedes eliminarla desde su dashboard si quieres.

Todo esto está en el plan gratuito de Cloudflare Workers (100k
solicitudes/día, KV incluido, Cron Triggers incluidos) — no se pidió tarjeta
de crédito en ningún paso.

## Comandos útiles

Todos se corren desde esta carpeta (`worker/`):

```bash
npm install              # instala wrangler/typescript la primera vez
npm run typecheck        # tsc --noEmit
npx wrangler deploy      # publica cambios al Worker
npx wrangler tail        # logs en vivo del Worker (util para depurar el cron)
npx wrangler kv key list --namespace-id 56b3828b8c9645209bb8fe488e1ffb56 --remote
```

## Regenerar las llaves VAPID (normalmente nunca hace falta)

Regenerarlas invalida TODAS las suscripciones existentes (cada usuario
tendría que volver a activar notificaciones). Solo hacerlo si la llave
privada se filtró. Para generarlas de nuevo:

```js
// node -e "esto" (usa el modulo crypto nativo de Node, sin dependencias)
const crypto = require("crypto");
const b64url = (b) => Buffer.from(b).toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const raw = publicKey.export({ format: "der", type: "spki" }).subarray(-65);
console.log("PUBLIC_RAW:", b64url(raw));
console.log("PUBLIC_JWK:", JSON.stringify(publicKey.export({ format: "jwk" })));
console.log("PRIVATE_JWK:", JSON.stringify(privateKey.export({ format: "jwk" })));
```

Luego: actualizar `VAPID_PUBLIC_KEY` en `src/config/push.ts` (frontend),
`VAPID_PUBLIC_RAW` en `wrangler.toml`, y volver a correr
`wrangler secret put VAPID_PRIVATE_JWK` con el nuevo valor.

## Rutas

- `POST /api/subscribe` — alta/actualización de una suscripción push de un
  perfil, más `ultimoRegistro`/`tarjetas` para decidir cuándo avisar. Exige
  `subscription` (nueva o ya guardada). Todo el cuerpo se valida (formato de
  perfilId, tarjetas, forma de la suscripción) antes de tocar KV.
- `POST /api/unsubscribe` — borra el registro completo (`sub:<perfilId>`) de
  KV. Verificado que de verdad desaparece (no solo se "desactiva").
- `scheduled()` — corre en cada Cron Trigger, recorre el KV y manda push a
  quien no registró su día o tiene un corte de tarjeta a 0-2 días, evitando
  reenviar el mismo aviso el mismo día (`avisosEnviados`). Si el push falla
  con 404/410 (suscripción muerta), se borra el registro.

## Seguridad

- **CORS**: el Worker solo responde `Access-Control-Allow-Origin:
  https://origo-app.pages.dev`, sin importar qué origen mande la solicitud —
  así un navegador bloquea leer la respuesta desde cualquier otro sitio.
  Ojo: CORS es una protección de **navegador**, no detiene una llamada
  directa por script/curl (eso lo cubren la validación y el rate limiting).
- **Rate limiting**: contador simple en KV por IP y por perfilId (ventanas
  de 1 hora) aplicado a `/api/subscribe`. No es atómico (lectura+escritura
  separadas) pero es suficiente para el volumen de un grupo de amigos, no
  para tráfico adversarial a escala.
- **Ninguna ruta expone el KV completo**: no existe (ni existió) un
  endpoint de listado/depuración; cada perfil solo puede tocar su propio
  registro porque cada llamada requiere su propio `perfilId`.
- **Secreto**: confirmado que `VAPID_PRIVATE_JWK` vive solo como `wrangler
  secret` — nunca en `wrangler.toml`, nunca en el repo, nunca en el
  historial de git (`worker/` no se había commiteado nunca antes de este
  cambio).
- Limitación conocida y aceptada: el Worker no conoce la zona horaria del
  usuario, así que "racha en riesgo" y "corte a N días" se calculan en UTC.
  Con dos revisiones al día esto da un aviso razonablemente a tiempo para
  la mayoría de zonas horarias, pero no es una hora local exacta.

## Cómo está armado (por si hay que tocarlo)

- `src/vapid.ts` / `src/encrypt.ts` / `src/webpush.ts`: implementación de Web
  Push (firma VAPID RFC 8292 + cifrado del payload RFC 8291) escrita a mano
  con WebCrypto nativo — **no usa el paquete npm `web-push`** porque depende
  del `crypto` de Node y no corre de forma confiable en el runtime de
  Workers. Verificado con un test de round-trip (cifrar con este código,
  descifrar de forma independiente) y un test end-to-end real contra una
  suscripción de FCM real durante el desarrollo — ambos limpios, sin
  quedar nada de eso en el repo.
- `src/ratelimit.ts`: el contador de KV descrito arriba.
