---
name: Kaizen
description: Un cuaderno de disciplina silencioso y premium — fondo oscuro constante, cada sección con su propio color de identidad, y momentos de acción con una micro-animación breve.
colors:
  bg: "#0D0E0E"
  surface: "#151716"
  surface-2: "#1C1E1D"
  border: "#292C2A"
  text-primary: "#F2F1EC"
  text-secondary: "#858982"
  kaizen-200: "#D8DAC7"
  kaizen-300: "#B7BC9C"
  kaizen-400: "#9BA37C"
  kaizen-500: "#7B835C"
  kaizen-600: "#636B47"
  gold-400: "#D4BC7C"
  gold-500: "#C5A85B"
  gold-600: "#A98B44"
  habitos-300: "#E0BFA4"
  habitos-400: "#CE9B72"
  habitos-500: "#BD7A52"
  habitos-600: "#96603F"
  finanzas-300: "#A9C9C3"
  finanzas-400: "#78A69D"
  finanzas-500: "#4B8078"
  finanzas-600: "#3A6660"
  area-intelecto: "#6B7A8F"
  area-imperio: "#A97C50"
  area-fuerza: "#B5624A"
  area-vitalidad: "#5E8C5A"
  area-energia: "#7E6C9E"
  area-sabiduria: "#4F7C7A"
  area-serenidad: "#8FA084"
  area-vinculos: "#A9667A"
  area-creatividad: "#A79BC0"
  area-gratitud: "#C9AA5C"
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

**Creative North Star: "El Cuaderno Silencioso" (The Quiet Ledger)**

Kaizen se lee como el cuaderno personal de alguien que se toma en serio su propia mejora: papel casi negro y cálido, una sola tinta de acento (verde oliva apagado), y superficies planas con un borde fino en vez de vidrio, glow o gradientes. Nada compite por atención — la jerarquía la construyen el tamaño y el peso tipográfico, no el color. El sistema existe para que un número grande (un total gastado, un nivel, una racha) sea siempre lo primero que se lee, y todo lo demás quede detrás, discreto.

Esto no es una app de gimnasio, ni un banco, ni un videojuego: es un sistema de crecimiento personal. La antigua identidad — panel de vidrio nocturno, azul eléctrico, sombras con glow, dinero como mecánica de recompensa — se abandona por completo. El verde Kaizen sigue siendo el único acento de **acción** (todo botón primario, todo focus ring); el dorado se reserva para lo que de verdad se ganó (un logro, un hito). La gamificación (rachas, niveles, logros) sigue existiendo pero se comporta con la misma sobriedad que el resto del sistema — nunca vuelve a sentirse como un loot box.

Un refinamiento sobre esa base: las 4 secciones principales de navegación (Panel, Hábitos, Finanzas, Recompensas) tienen su propio color de identidad — no un rediseño, un punto medio. El fondo, la tipografía y el verde Kaizen de los botones no cambian; lo que cambia es que cada sección "se siente" reconocible por su color en el nav, su título de página y un par de elementos propios (ver "Identidad de sección"). Y los momentos de acción real — guardar el registro del día, salvar una racha con una protección, alcanzar un hito — llevan una micro-animación breve y con intención, nunca decorativa (ver "Motion").

**Key Characteristics:**
- Fondo casi negro y cálido, superficies planas (`surface`/`surface-2`) con borde fino de 1px — nunca vidrio, nunca glow.
- Verde Kaizen como único acento de **acción** (botones primarios, focus ring); dorado para lo ya ganado; cada sección principal suma su propio color de identidad en su nav, título y elementos propios (ver "Identidad de sección").
- Colores de categoría desaturados que solo aparecen como acentos pequeños (un punto, un ícono, un borde de 2px) — jamás como bloque de color grande.
- Mucho espacio negativo; una jerarquía de tres niveles siempre visible: título → dato principal grande → texto secundario discreto.
- Barras de progreso delgadas (1px de alto) en vez de gruesas; ninguna sombra decorativa sin función.
- Los momentos de acción real tienen una micro-animación breve (pop, barra que se llena) — nunca en cada clic, solo donde el usuario acaba de lograr algo.

## Colors

Paleta cálida casi monocroma para el 95% de la superficie, una sola tinta de acento para acción, y un dorado reservado exclusivamente para reconocimiento. Los colores de categoría existen solo para diferenciar datos, nunca para decorar chrome.

### Base
- **Fondo** (`#0D0E0E`): el lienzo. Plano — a lo sumo un vinetado radial casi imperceptible (`rgba(123,131,92,0.05)`), nunca un gradiente de color saturado.
- **Superficie** (`#151716`): toda `Card`, sidebar, header y bottom-nav.
- **Superficie secundaria** (`#1C1E1D`): chips, filas dentro de una card, inputs.
- **Borde** (`#292C2A`): el único tipo de borde en todo el sistema — 1px, sólido, nunca translúcido ni brillante.
- **Texto principal** (`#F2F1EC`): títulos y datos principales.
- **Texto secundario** (`#858982`): subtítulos, hints, metadatos.

### Acento (marca)
- **Verde Kaizen** (`#7B835C`, hover `#636B47`): **The One Signal Rule.** El único color que significa "actúa aquí" — todo botón primario, todo focus ring, el checkbox de hábito seleccionado en el wizard. Ningún otro color reemplaza a este para una acción.
- **Dorado** (`#C5A85B`): reservado para lo que ya se ganó — un logro desbloqueado, un hito de racha, y por eso también la identidad de la sección Recompensas.

### Identidad de sección
Cada una de las 4 secciones principales de navegación tiene un acento propio, reutilizado en su ítem de nav (activo), el título de su página (`SectionTitle accent=`) y un puñado de elementos que son inequívocamente "de esa sección" (la barra de gasto-vs-ingreso, el FAB de gasto, el pill de día seleccionado en Hábitos):
- **Panel** → Verde Kaizen `#7B835C` (es la base, no necesita un color nuevo).
- **Hábitos** → Terracota `#BD7A52` (`habitos-500`).
- **Finanzas** → Verde-azulado `#4B8078` (`finanzas-500`) — deliberadamente no es azul: sigue siendo una familia verde/teal, nunca el azul eléctrico retirado.
- **Recompensas** → Dorado `#C5A85B` (`gold-500`) — coincide con el acento de logros porque la sección **es** rachas, protecciones y logros.

**The Section Identity Rule.** Un color de sección vive en el nav, el título de página y un pequeño número de elementos propios de esa sección — nunca reemplaza al verde Kaizen en un botón primario o un focus ring, y nunca se usa fuera de su sección (el color de Hábitos no aparece en Finanzas). No es una paleta libre: son 4 acentos fijos, documentados aquí, no uno por feature.

### Datos (categorías de hábito)
Intelecto `#6B7A8F` · Imperio `#A97C50` · Fuerza `#B5624A` · Vitalidad `#5E8C5A` · Energía `#7E6C9E` · Sabiduría `#4F7C7A` · Serenidad `#8FA084` · Vínculos `#A9667A` · Creatividad `#A79BC0` · Gratitud `#C9AA5C`. **The Data-Not-Decoration Rule.** Un color de categoría solo puede aparecer en el ícono, punto de radar o barra de esa categoría específica — nunca en chrome, botones, ni como fondo de sección. En el wizard de planeación se usa el color puro del catálogo (reconocible desde el día 1); en pantallas de uso diario (radar, hábitos, panel) se atenúa según el nivel del hábito — ver "Color por nivel".

**Color por nivel.** Fuera del wizard, el acento de una categoría se mezcla con un gris apagado (`#585C54`) en proporción al nivel del hábito (`colorPorNivel` en `src/lib/color.ts`): nivel 1 se ve casi monocromo, nivel 20 llega exactamente al hex documentado arriba. Es una progresión literal — la constancia "ilumina" el color, nunca al revés.

### Estado
- **Éxito** (`emerald-500`), **Advertencia** (`amber-500`), **Peligro** (`rose-500`): confirmaciones, validaciones, acciones destructivas. Sin relación con el acento de marca ni con los colores de categoría.

## Typography

**Fuente única:** Inter (con `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`). Un solo grotesco para todo el sistema — la jerarquía se construye con tamaño, peso y tracking, no con una segunda tipografía.

### Jerarquía
- **Headline** (600, 1.5rem, -0.01em): saludo del panel ("Hola, {nombre}"), el número protagonista de cada pantalla.
- **Title** (600, 1rem, -0.01em): títulos de sección dentro de una `Card`.
- **Body** (400, 0.875rem): texto corrido, filas de lista, valores de formulario.
- **Label** (500, 0.6875rem, uppercase, +0.04em): etiquetas de stat, encabezados de tabla, micro-contexto.

**The Number-First Rule.** Todo dato que importa (total gastado, nivel, PP, racha) se renderiza como el elemento tipográfico más grande de su tarjeta — el texto que lo explica va siempre debajo, más pequeño y en `text-secondary`. La racha diaria (Panel y Hábitos) es la excepción con más peso: usa `Stat size="lg"` (`text-4xl`, por encima del resto de stats de su misma fila) porque es el número que más motiva sostener.

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
- Ítem activo: pill de 2px + ícono en el color de identidad de esa sección (verde Kaizen en Panel, terracota en Hábitos, verde-azulado en Finanzas, dorado en Recompensas) — nunca un bloque de fondo saturado. Las pestañas fuera de las 4 principales (Cierre, Temporada, Reconocimientos, Historial, Config.) no tienen color propio y usan verde Kaizen por defecto.

### Radar (componente insignia)
Anillos y ejes en `border-base-700`; el polígono de cumplimiento usa un relleno verde Kaizen muy sutil (`#7B835C22`) con trazo del mismo verde a 1.5px — cada vértice es un punto sólido en el color propio de esa categoría. Debe leerse como una herramienta de análisis personal, no como un gráfico de videojuego.

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
- **Don't** introducir azul eléctrico ni ningún color fuera de los 4 acentos de sección documentados aquí.
- **Don't** dejar que el color de una sección se filtre a otra, o que reemplace al verde Kaizen en un botón primario.
- **Don't** mostrar dinero como recompensa, penalización o mecánica de juego en ningún lugar de Hábitos.
- **Don't** convertir Finanzas en una imitación de app bancaria o de inversión — es control de gastos personal, nada más.
- **Don't** usar un color de categoría como fondo grande de sección o como tinte de navegación.
- **Don't** dejar que una animación rutinaria dure más de ~220ms — si se siente como una espera, ya no es feedback.
