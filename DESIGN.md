---
name: Kaizen
description: Disciplina personal con energía Duolingo — fondo oscuro constante, colores vivos y saturados por sección, y momentos de acción con una micro-animación breve.
colors:
  bg: "#0D0E0E"
  surface: "#151716"
  surface-2: "#1C1E1D"
  border: "#292C2A"
  text-primary: "#F2F1EC"
  text-secondary: "#858982"
  kaizen-200: "#BFF0C8"
  kaizen-300: "#8FE6A0"
  kaizen-400: "#5BDA72"
  kaizen-500: "#2FA347"
  kaizen-600: "#22832F"
  gold-300: "#FFE685"
  gold-400: "#FFD84D"
  gold-500: "#FFC800"
  gold-600: "#D9A800"
  habitos-300: "#FFC773"
  habitos-400: "#FFA733"
  habitos-500: "#FF9600"
  habitos-600: "#D97D00"
  finanzas-300: "#8FDBFB"
  finanzas-400: "#4FC3F7"
  finanzas-500: "#0D8FCC"
  finanzas-600: "#0A6FA0"
  area-intelecto: "#4D8DFF"
  area-imperio: "#FFA229"
  area-fuerza: "#FF5C5C"
  area-vitalidad: "#3DDC5A"
  area-energia: "#9D6BFF"
  area-sabiduria: "#2BD4C4"
  area-serenidad: "#3DC7EF"
  area-vinculos: "#FF6FB8"
  area-creatividad: "#C77DFF"
  area-gratitud: "#FFCF33"
  signal-success: "#10b981"
  signal-warning: "#f59e0b"
  signal-danger: "#f43f5e"
typography:
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.04em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.kaizen-500}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.kaizen-600}"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Kaizen

## Overview

**Creative North Star: "Disciplina con energía" (Duolingo-dark)**

Kaizen vive sobre un fondo casi negro y cálido — eso no cambia — pero encima de ese fondo el color es vivo y saturado, no un acento apagado: verdes, naranjas, azules, morados y amarillos con la misma energía que una app que quiere que volver todos los días se sienta bien. La sobriedad del sistema ya no vive en el color, vive en la estructura: jerarquía tipográfica clara, mucho espacio negativo, bordes finos en vez de vidrio o glow, y animación corta y con intención en vez de ruido. Un número grande (un total gastado, un nivel, una racha) sigue siendo siempre lo primero que se lee — solo que ahora ese número, y la tarjeta que lo rodea, tienen color real.

Esto no es una app de gimnasio, ni un banco, ni un videojuego genérico: es un sistema de crecimiento personal que no le tiene miedo al color. La antigua identidad — panel de vidrio nocturno, azul eléctrico como único acento, sombras con glow, dinero como mecánica de recompensa — se abandona por completo, y así también su reemplazo demasiado apagado ("El Cuaderno Silencioso"): esa fase enseñó la estructura (jerarquía, espacio, bordes finos) que este sistema conserva, pero el color ya no se queda en tonos pastel. El verde Kaizen sigue siendo el acento de **acción** (todo botón primario, todo focus ring); el dorado se reserva para lo que de verdad se ganó. La gamificación (rachas, niveles, logros) se celebra con color y movimiento reales, sin volverse un loot box ruidoso — la diferencia con un videojuego está en el propósito y el tono de la copy, no en apagar el color.

Las 4 secciones principales de navegación (Panel, Hábitos, Finanzas, Recompensas) tienen su propio color de identidad vivo — en el nav, el título de página, y ahora también en el fondo/borde de la tarjeta principal de cada pantalla (ver "Identidad de sección"). Y los momentos de acción real — guardar el registro del día, salvar una racha con una protección, alcanzar un hito — llevan una micro-animación breve y con intención, nunca decorativa (ver "Motion").

**Key Characteristics:**
- Fondo casi negro y cálido, superficies planas (`surface`/`surface-2`) con borde fino de 1px — nunca vidrio, nunca glow.
- Colores vivos y saturados (verde, naranja, azul, morado, amarillo) para acento de acción, identidad de sección y datos por categoría — no tonos pastel ni apagados.
- Verde Kaizen como acento de **acción** (botones primarios, focus ring); dorado para lo ya ganado; cada sección principal suma su propio color de identidad en nav, título, y el fondo/borde de su tarjeta principal (ver "Identidad de sección").
- Mucho espacio negativo; una jerarquía de tres niveles siempre visible: título → dato principal grande → texto secundario discreto.
- Barras de progreso delgadas (1px de alto) en vez de gruesas; ninguna sombra decorativa sin función — el color hace el trabajo que antes hacía el glow.
- Los momentos de acción real tienen una micro-animación breve (pop, barra que se llena) — nunca en cada clic, solo donde el usuario acaba de lograr algo.

## Colors

Fondo cálido casi negro constante en el 100% de la superficie, y sobre él, color vivo y saturado con un trabajo real: una tinta de acción, un dorado de reconocimiento, un acento por sección, y una paleta de categoría que ya es reconocible desde el nivel 1. El color no es decoración — pero tampoco se apaga para parecer sobrio.

### Base
- **Fondo** (`#0D0E0E`): el lienzo. Plano — a lo sumo un vinetado radial casi imperceptible, nunca un gradiente de color saturado.
- **Superficie** (`#151716`): toda `Card`, sidebar, header y bottom-nav.
- **Superficie secundaria** (`#1C1E1D`): chips, filas dentro de una card, inputs.
- **Borde** (`#292C2A`): el único tipo de borde en todo el sistema — 1px, sólido, nunca translúcido ni brillante.
- **Texto principal** (`#F2F1EC`): títulos y datos principales.
- **Texto secundario** (`#858982`): subtítulos, hints, metadatos.

### Acento (marca)
- **Verde Kaizen** (`kaizen-500` `#2FA347` en rellenos con texto claro encima, `kaizen-400` `#5BDA72` como acento de texto/ícono): **The One Signal Rule.** El único color que significa "actúa aquí" — todo botón primario, todo focus ring, el checkbox de hábito seleccionado en el wizard. Ningún otro color reemplaza a este para una acción.
- **Dorado** (`gold-500` `#FFC800`): reservado para lo que ya se ganó — un logro desbloqueado, un hito de racha, y por eso también la identidad de la sección Recompensas.

### Identidad de sección
Cada una de las 4 secciones principales de navegación tiene un acento propio, vivo y saturado, reutilizado en su ítem de nav (activo), el título de su página (`SectionTitle accent=`) y el fondo/borde de la tarjeta principal de esa pantalla:
- **Panel** → Verde Kaizen `#5BDA72` (`kaizen-400`, es la base, no necesita un color nuevo).
- **Hábitos** → Naranja vivo `#FF9600` (`habitos-500`).
- **Finanzas** → Azul vivo `#4FC3F7` (`finanzas-400`) — un azul real y saturado; el "nunca azul" era una regla de la fase anterior, ya no aplica. El fill sólido del FAB de gasto usa este mismo tono claro con ícono oscuro encima (`text-base-950`), no texto claro: así el botón se ve realmente vívido contra el fondo casi negro en vez de leerse como un círculo apagado. El tono más profundo `finanzas-500` (`#0D8FCC`) se reserva para botones con texto/ícono claro encima (donde sí hace falta ese contraste).
- **Recompensas** → Dorado `#FFC800` (`gold-500`) — coincide con el acento de logros porque la sección **es** rachas, protecciones y logros.

**The Section Identity Rule.** Un color de sección vive en el nav, el título de página, y en el fondo/borde de la tarjeta principal de esa pantalla (`bg-{color}-500/[0.08-0.09]`, `border-{color}-500/35-40`) — no solo en íconos puntuales, con intensidad suficiente para leerse como color real, no como una insinuación. Nunca reemplaza al verde Kaizen en un botón primario o un focus ring, y nunca se usa fuera de su sección (el color de Hábitos no aparece en Finanzas). No es una paleta libre: son 4 acentos fijos, documentados aquí, no uno por feature. Y no es "pintar todo": las tarjetas secundarias (listas, categorías) se quedan más neutras a propósito, para que el color de sección siga marcando la tarjeta protagonista en vez de volverse ruido parejo.

### Datos (categorías de hábito)
Intelecto `#4D8DFF` · Imperio `#FFA229` · Fuerza `#FF5C5C` · Vitalidad `#3DDC5A` · Energía `#9D6BFF` · Sabiduría `#2BD4C4` · Serenidad `#3DC7EF` · Vínculos `#FF6FB8` · Creatividad `#C77DFF` · Gratitud `#FFCF33` — diez tonos vivos y claramente distinguibles entre sí, estilo Duolingo, no una paleta desaturada de acentos discretos. **The Data-Not-Decoration Rule.** Un color de categoría solo puede aparecer en el ícono, punto de radar o barra de esa categoría específica — nunca en chrome, botones, ni como fondo de sección. En el wizard de planeación se usa el color puro del catálogo (reconocible desde el día 1); en pantallas de uso diario (radar, hábitos, panel) se combina con el nivel del hábito — ver "Color por nivel".

**Color por nivel.** Fuera del wizard, el acento de una categoría se mezcla con un gris apagado (`#585C54`) en proporción al nivel del hábito (`colorPorNivel` en `src/lib/color.ts`): nivel 1 ya nace vivo (78% de intensidad — lejos de monocromo), nivel 20 llega exactamente al hex documentado arriba. La progresión existe pero es sutil; el color nunca empieza apagado para "ganárselo" — eso contradiría la energía Duolingo del resto del sistema.

### Estado
- **Éxito** (`emerald-500`), **Advertencia** (`amber-500`), **Peligro** (`rose-500`): confirmaciones, validaciones, acciones destructivas. Sin relación con el acento de marca ni con los colores de categoría.

## Typography

**Fuente única:** Inter (con `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`). Un solo grotesco para todo el sistema — la jerarquía se construye con tamaño, peso y tracking, no con una segunda tipografía.

### Jerarquía
- **Headline** (600, 1.5rem, -0.01em): saludo del panel ("Hola, {nombre}"), el número protagonista de cada pantalla.
- **Title** (600, 1rem, -0.01em): títulos de sección dentro de una `Card`.
- **Body** (400, 0.875rem): texto corrido, filas de lista, valores de formulario.
- **Label** (500, 0.6875rem, uppercase, +0.04em): etiquetas de stat, encabezados de tabla, micro-contexto.

**The Number-First Rule.** Todo dato que importa (total gastado, nivel, PP, racha) se renderiza como el elemento tipográfico más grande de su tarjeta — el texto que lo explica va siempre debajo, más pequeño y en `text-secondary`. La racha diaria (Panel, Hábitos y Recompensas) recibe además un bloque propio con fondo ámbar e ícono de flama (`animate-flicker` cuando la racha es mayor a 0) para destacar sobre el resto de stats — pero a un tamaño intermedio (`text-4xl` en móvil, `text-5xl` en escritorio), no el techo del sistema: debe notarse de inmediato sin dominar toda la pantalla ni competir con el dato principal de esa vista (el total gastado en Finanzas, el radar en Panel).

## Layout

El shell se mantiene: sidebar fija de 224px en escritorio, barra superior + barra inferior en móvil, columna central `max-w-6xl`. Lo que cambia es el fondo: ya no hay gradientes radiales de color detrás de cada pantalla — el fondo es prácticamente plano, con a lo sumo un vinetado verde casi imperceptible arriba. El ritmo vertical (`space-y-6`/`gap-6` entre bloques, `mb-4` bajo cada `SectionTitle`) se conserva igual.

## Elevation & Depth

Kaizen dejó de ser un sistema de vidrio. La profundidad ahora viene de un borde fino de 1px (`border-base-700`) y una sombra de contacto muy sutil (`shadow-card`: `0 1px 2px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.2)`) — nunca de blur, translucidez ni glow de color.

### Shadow Vocabulary
- **Card** (`shadow-card`): la sombra por defecto de toda superficie elevada — casi imperceptible, solo separa la tarjeta del fondo.
- **Soft** (`shadow-soft`: `0 8px 24px -16px rgba(0,0,0,0.5)`): modales, hojas y el botón flotante — el único lugar con una sombra algo más presente, y aun así sin tinte de color.

### Named Rules
**The No-Glow Rule.** Ninguna superficie lleva una sombra de color (`shadow-color/40` tipo glow) ni un `backdrop-blur`. Si algo necesita destacar, lo hace con un borde de acento de 1-2px, nunca con resplandor.

## Shapes

`12px` (`rounded-xl`) es el radio por defecto de botones, inputs y chips; `16px` (`rounded-2xl`) marca cards y modales. `rounded-full` se reserva para pills, avatares y el FAB. Los bordes son siempre sólidos de 1px en `border-base-700` — nunca translúcidos, nunca brillantes.

## Motion

**The Instant-Feedback Rule.** El sistema se siente vivo en el uso diario, no solo en momentos especiales — pero la forma de lograrlo sin sentirse lento es que la animación de una acción que se repite mucho (marcar un hábito, cambiar de sección, ver subir un número) sea siempre corta (100-220ms): es feedback instantáneo, no una espera. Solo los momentos realmente puntuales (un hito de racha, una protección salvando la racha, el tour de bienvenida) se permiten un poco más de presencia.

### Todos los días (corta, en cada interacción)
- **Rebote al marcar** (`animate-tap`, 180ms): tocar Sí/No, sumar una comida o ajustar un contador da un pop breve a la tarjeta del hábito, encima del cambio de color que ya ocurre.
- **Números que cuentan** (`useCountUp`, ~300ms ease-out cúbico): racha, PP totales y los contadores de hábito suben hacia su nuevo valor en vez de saltar directo — nunca en datos que cambian por scroll continuo (el selector del wizard ya es continuo de por sí).
- **Cambio de sección** (`animate-fade-up`, 250ms): pasar de Panel a Hábitos/Finanzas/Recompensas hace un fundido + leve desplazamiento en vez de un corte seco.
- **Racha con vida** (`animate-flicker`, 1.8s infinito, muy sutil): el ícono de flama de la racha activa parpadea apenas — solo cuando la racha es mayor a 0.
- **El radar se dibuja** (`animate-radar-in`, 450ms, una sola vez al montar): aparece con una entrada suave en vez de estar ya completo — no se repite en cada actualización de datos, o se sentiría agitado.

### Momentos puntuales (más presencia, mucho más raros)
- **Entrada** (`animate-pop`, 220ms exponential ease-out): cards, modales, y cualquier tarjeta que reemplaza a otra (el carrusel de metas del wizard) — siempre desde un estado ya visible, nunca un salto seco.
- **Toast de acción** (`animate-toast-fill`): al guardar el registro diario, una barra delgada del color de la sección corriente (`habitos-500`) se llena a lo largo de la vida del toast.
- **Celebración de hito:** al alcanzar un hito de racha (7/30/90/365 días) o al usar una protección, el mensaje usa el acento dorado + `animate-pop` — el único momento en que el sistema se permite sonar como un logro, nunca como un videojuego.
- **Coachmarks:** un tour breve (4-6 pasos) que aparece una sola vez, la primera vez que un perfil nuevo llega al panel tras terminar el asistente de planeación. Usa un recorte tipo spotlight (`box-shadow` sobre el elemento señalado) y nunca vuelve a mostrarse — la bandera vive en `localStorage`, no en el estado persistido de la app.

## Components

### Buttons
- **Primary:** relleno verde Kaizen, texto claro, sin sombra de color — solo la sombra de contacto estándar.
- **Secondary:** `bg-base-850` con borde `border-base-700`.
- **Ghost:** transparente, hover a `bg-base-850`.
- **Danger:** relleno rosa translúcido, para confirmaciones destructivas.

### Cards
- Fondo `bg-base-900` sólido, borde `border-base-700`, `shadow-card`, `rounded-2xl`, `p-5`.

### Inputs
- `bg-base-850`, `border-base-700`, foco en verde Kaizen (`focus:border-kaizen-400`, `focus:ring-kaizen-400/40`) — nunca azul.

### Progress bars
- `h-1` por defecto (antes `h-1.5`–`h-2.5`): delgadas y elegantes, relleno verde Kaizen salvo que representen datos por categoría (entonces usan el color de esa categoría).

### Navigation
- Ítem activo: pill + ícono en el color de identidad de esa sección (verde Kaizen en Panel, naranja en Hábitos, azul en Finanzas, dorado en Recompensas) — vivo y reconocible, no un tinte discreto. Las pestañas fuera de las 4 principales (Cierre, Temporada, Reconocimientos, Historial, Config.) no tienen color propio y usan verde Kaizen por defecto.

### Avisos (banners del Centro de Avisos)
Tarjetas dismissables en la parte alta del Panel, calculadas en el momento (sin backend): borde + fondo muy tenue según el tono — ámbar para urgente (racha en riesgo, tarde y sin registrar), verde-azulado (`finanzas`) para informativo (corte de tarjeta próximo), dorado para logro. Nunca bloquean la pantalla ni son modales; se descartan con una "×" y no vuelven a aparecer ese mismo aviso (bandera en `localStorage`, igual que coachmarks). Opcionalmente se replican como notificación del navegador si el usuario dio permiso y la pestaña está en segundo plano — nunca reemplazan al banner.

### Radar (componente insignia)
Anillos y ejes en `border-base-700`; el polígono de cumplimiento usa un relleno verde Kaizen vivo (`#2FA34733`) con trazo del verde más claro (`#5BDA72`) a 1.5px — cada vértice es un punto sólido en el color propio de esa categoría. Debe leerse como una herramienta de análisis personal con energía real, no como un gráfico apagado ni como un HUD de videojuego.

### Isotipo Kaizen
Una "K" geométrica de dos trazos en degradado verde oliva (`#B7BC9C` → `#636B47`), usable sola (favicon, logros, pantallas de carga) o junto al wordmark "KAIZEN" en el header. Vive como componente SVG reutilizable, nunca como raster.

## Finanzas: control de gastos, no economía de recompensas

Finanzas se rediseñó como una herramienta de control y visualización de gastos personales — sin presupuesto asignado, sin "dinero libre", sin banco de recompensas. Prioridad de lectura en la pantalla: **total gastado → gastos recientes → categorías → métodos de pago → tarjetas**. Las tarjetas de crédito (hasta 3, con nombre y día de corte) se muestran como filas sobrias con un ícono neutro — nunca imitando el chrome de una app bancaria real. Los resúmenes (de corte y mensuales) siguen una jerarquía editorial fija: TOTAL GASTADO primero y grande, después "¿en qué?", "¿cuánto?" y "¿cómo lo pagué?" — con barras delgadas de distribución por categoría, sin gráficas complejas.

## Do's and Don'ts

### Do:
- **Do** mantener el verde Kaizen como el único color que significa "actúa aquí" en botones primarios y focus rings.
- **Do** usar bordes finos y sólidos (`border-base-700`) más una sombra casi imperceptible como única fuente de profundidad.
- **Do** dejar que los colores de categoría vivan solo en el ícono, punto o barra de esa categoría, atenuados por nivel fuera del wizard.
- **Do** dar al número más importante de cada tarjeta el mayor tamaño tipográfico disponible.
- **Do** representar hábitos, rachas y logros sin ninguna referencia a dinero — son rachas, niveles y reconocimientos, punto.
- **Do** usar el color de identidad de cada sección (Panel/Hábitos/Finanzas/Recompensas) solo en su nav, su título de página y sus propios elementos — nunca en botones primarios.
- **Do** animar las interacciones de todos los días (marcar un hábito, un número que cambia, cambiar de sección) siempre que la animación sea corta (100-220ms) — feedback instantáneo, no una espera.
- **Do** reservar la animación más presente (toast con barra, celebración dorada) para los momentos que el usuario realmente ganó (guardar el día, un hito, una protección usada).

### Don't:
- **Don't** usar glow, blur, gradientes de color o translucidez estilo vidrio — es la antigua identidad, y queda descartada por completo.
- **Don't** volver a apagar el color a tonos pastel/desaturados "para verse sobrio" — la sobriedad de este sistema vive en la estructura (jerarquía, espacio, bordes finos), no en apagar el color.
- **Don't** introducir un color fuera de los acentos documentados aquí (acción, dorado, 4 secciones, 10 categorías) — la paleta es amplia y viva, pero sigue siendo fija, no libre.
- **Don't** dejar que el color de una sección se filtre a otra, o que reemplace al verde Kaizen en un botón primario.
- **Don't** mostrar dinero como recompensa, penalización o mecánica de juego en ningún lugar de Hábitos.
- **Don't** convertir Finanzas en una imitación de app bancaria o de inversión — es control de gastos personal, nada más.
- **Don't** usar un color de categoría como fondo grande de sección o como tinte de navegación.
- **Don't** dejar que una animación rutinaria dure más de ~220ms — si se siente como una espera, ya no es feedback.
