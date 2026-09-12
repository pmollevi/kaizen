---
name: Kaizen
description: A dark, glass-paneled personal command deck where habits, streaks, and real money share one game economy.
colors:
  sky-signal: "#0ea5e9"
  sky-signal-hover: "#38bdf8"
  void-950: "#0a0b0d"
  void-900: "#121317"
  void-850: "#171920"
  void-800: "#1d1f28"
  void-700: "#2a2d38"
  void-600: "#3a3e4d"
  void-500: "#565b6e"
  void-400: "#7a8094"
  void-300: "#a3a8b8"
  void-200: "#c8ccd6"
  void-100: "#e8e9ee"
  area-intelecto: "#5b8def"
  area-imperio: "#e0a63a"
  area-fuerza: "#e0544f"
  area-vitalidad: "#4cb782"
  area-energia: "#9b6fe0"
  area-sabiduria: "#3ab5c6"
  area-serenidad: "#63c7b2"
  area-vinculos: "#e06fa8"
  area-creatividad: "#c68fe0"
  area-gratitud: "#e0c23a"
  signal-success: "#10b981"
  signal-warning: "#f59e0b"
  signal-danger: "#f43f5e"
typography:
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.25rem"
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
    backgroundColor: "{colors.sky-signal}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.sky-signal-hover}"
  button-secondary:
    backgroundColor: "rgba(255,255,255,0.06)"
    textColor: "{colors.void-100}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  card:
    backgroundColor: "rgba(255,255,255,0.035)"
    textColor: "{colors.void-100}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input:
    backgroundColor: "rgba(255,255,255,0.04)"
    textColor: "{colors.void-100}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Kaizen

## Overview

**Creative North Star: "El Centro de Mando Nocturno" (The Night Command Deck)**

Kaizen reads like a personal mission control that only exists after dark: an almost-black surface lit from within by a handful of instrument panels made of frosted glass. Every card is a gauge — level, streak, budget, season — floating a fraction above the void on a soft inset highlight and a diffuse ambient shadow, never a hard edge. The system stays quiet by default: one accent voice (sky blue), a restrained neutral scale, and per-habit colors that behave as data-encoding, not decoration. It earns the right to break that calm only at the moment something real is won — a level-up, a closed week, a streak milestone — where a short, physical burst (pop, confetti, a wiggle) interrupts the stillness and then gets out of the way.

This is not gamified-app candy and it is not a spreadsheet. The RPG framing (levels, seasons, achievements) and the financial framing (budgets, categories, real money unlocked weekly) are rendered in the exact same visual language on purpose — the same glass card, the same restrained sky accent, the same progress bar — because the product's whole premise is that they are one economy, not two features bolted together. Flatness or a low-effort look is the one thing this system must never slide into: depth, glow, and motion are the proof of craft, not embellishment to be trimmed for simplicity.

**Key Characteristics:**
- Near-black base with frosted, translucent glass cards floating on soft ambient shadows — never flat, never hard-edged.
- A single accent voice (sky blue) for action and identity; habit-area colors are data, not brand decoration.
- Calm and precise by default; short, physical celebration bursts (pop / confetti / wiggle) mark real, earned moments only.
- Progress is always visualized as a bar, ring, or radar — a number alone is never the only signal.
- Rounded, soft geometry throughout (12–16px radii); no sharp corners, no hairline-only borders without a shadow behind them.

## Colors

The palette is restrained and precise: a near-monochrome dark neutral scale carries almost the entire surface, one sky-blue accent carries every call to action and active state, and a wider set of hues exists solely to encode which life habit a piece of data belongs to.

### Primary
- **Signal Sky** (`#0ea5e9`, hover `#38bdf8`): the only accent used for primary actions, active navigation states, focus rings, links, and the brand mark. **The One Signal Rule.** Sky blue is the sole color allowed to mean "act here" or "this is active" anywhere in the app; if a new affordance needs an accent, it borrows this one rather than introducing a second brand hue.

### Neutral
- **Void 950** (`#0a0b0d`): page background, always paired with the three soft radial gradients (see Layout) rather than used flat.
- **Void 900 / 850** (`#121317` / `#171920`): elevated surfaces — sidebars, mobile headers/footers, modal panels.
- **Void 800 / 700** (`#1d1f28` / `#2a2d38`): structural lines — the radar chart's grid rings and spokes render in Void 700.
- **Void 600 / 500** (`#3a3e4d` / `#565b6e`): tertiary text, disabled states, uppercase micro-labels.
- **Void 400 / 300** (`#7a8094` / `#a3a8b8`): secondary body text, hints, subtitles.
- **Void 200 / 100** (`#c8ccd6` / `#e8e9ee`): primary text and headings on dark surfaces.

### Data Colors (Habit Areas)
- **Intelecto Blue** (`#5b8def`), **Imperio Amber** (`#e0a63a`), **Fuerza Red** (`#e0544f`), **Vitalidad Green** (`#4cb782`), **Energía Violet** (`#9b6fe0`), **Sabiduría Cyan** (`#3ab5c6`), **Serenidad Teal** (`#63c7b2`), **Vínculos Pink** (`#e06fa8`), **Creatividad Lilac** (`#c68fe0`), **Gratitud Gold** (`#e0c23a`): one fixed color per habit template in the catalog (`areaCatalog.ts`), applied via inline `color`/`backgroundColor`, never a Tailwind utility class. **The Data-Not-Decoration Rule.** A habit's color may only appear on the elements that represent that specific habit's data (its icon, progress bar, radar point) — it must never bleed into chrome, buttons, or another habit's row.

### Status Colors
- **Success Emerald** (`#10b981`): budget category under its limit, achievement unlocked, positive confirmations.
- **Warning Amber** (`#f59e0b`): budget category approaching its limit, pending action banners.
- **Danger Rose** (`#f43f5e`): over-budget category, destructive actions, validation errors.

## Typography

**Body & UI Font:** Inter (with `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`)

**Character:** A single, highly legible grotesque carries every role in the system — there is no display serif or accent face. Hierarchy is built entirely through weight, size, and letter-spacing (tight/negative tracking on headings, wide uppercase tracking on labels), which keeps the dashboard reading as precise instrumentation rather than editorial content.

### Hierarchy
- **Headline** (600, 1.125–1.25rem, tight/-0.01em tracking): screen titles ("Hola, {nombre}"), primary card totals (level, PP, wallet balance).
- **Title** (600, 0.9375–1rem, -0.01em tracking): section titles inside a `Card` (`SectionTitle`), modal titles.
- **Body** (400, 0.8125–0.875rem): all running copy, list rows, form values.
- **Label** (500, 0.6875–0.75rem, uppercase, +0.04em tracking): stat labels, table headers, micro-context tags ("racha 2/4", "tope $9,000").

### Named Rules
**The No-Serif Rule.** The system has exactly one type family. A second face — even for a hero number — reads as an inconsistency, not sophistication.

## Layout

The shell is a fixed two-mode frame: a 224px (`w-56`) fixed sidebar with a top-aligned brand mark and bottom-anchored profile block on desktop (`md:` and up), collapsing to a fixed top bar plus a fixed bottom tab bar (with a "Más" overflow sheet) below that breakpoint. Content lives in a single centered column capped at `max-w-6xl`, laid out as a responsive grid — `grid-cols-1` on mobile widening to 2–3 columns (`lg:grid-cols-3`, cards spanning `lg:col-span-2` for the dominant panel) on larger screens. Vertical rhythm between major blocks is a consistent `space-y-6` / `gap-6`; inside a card, sub-groups step down through `mb-5`, `mb-4`, `space-y-3`.

The page background is never a flat fill: three large, soft `radial-gradient` washes (sky/indigo at low opacity, `background-attachment: fixed`) sit behind every screen, giving the void depth without adding visual noise. A floating action button (56px circle, fixed bottom-right, offset above the mobile tab bar) is always reachable for the single highest-frequency action (quick expense entry), independent of which tab is open.

## Elevation & Depth

Kaizen is a glass system, not a flat or tonal one: depth comes from a layered combination of translucency, blur, and soft ambient shadow rather than solid elevated panels or a single drop-shadow. Every raised surface (cards, modals, the FAB, primary buttons) carries a paired treatment — a 1px inset highlight (`inset 0 1px 0 0 rgba(255,255,255,0.05–0.3)`) simulating light catching a glass edge, plus a large, soft, downward ambient shadow (`0 20-30px 40-60px -20/-28px rgba(0,0,0,0.7-0.8)`) that reads as the surface floating, not sitting. Flatness is explicitly rejected: a card, button, or modal with no shadow and no translucency is treated as unfinished, not as restraint.

### Shadow Vocabulary
- **Card Float** (`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_20px_40px_-28px_rgba(0,0,0,0.7)]`): the default resting state for every `Card`.
- **Action Glow** (`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_20-30px_-8px_rgba(59,130,246,0.6-0.7)]`): primary buttons, the logo mark, and the FAB — an inset highlight plus a sky-tinted glow that ties the accent color to elevation itself.
- **Overlay Lift** (`shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]`): modals and sheets, always paired with a `backdrop-blur-xl` scrim (`bg-black/70 backdrop-blur-sm`) behind them.

### Named Rules
**The Never-Flat Rule.** No interactive or content-bearing surface renders without both a translucent fill (or backdrop-blur) and a shadow; a plain solid rectangle reads as a bug, not a minimalist choice.

## Shapes

Geometry is uniformly soft: `12px` (`rounded-xl`) is the default radius for buttons, inputs, and small chips; `16px` (`rounded-2xl`) marks primary containers — cards, modals, the mobile sheet's top corners; fully circular (`rounded-full`) is reserved for pills/badges, avatars, the FAB, and progress-bar tracks. Borders are always a hairline of translucent white (`border-white/10` typically), never a solid opaque color — a border alone never carries a surface; it always rides on top of the glass fill and shadow described above. There are no sharp corners anywhere in the system.

## Components

### Buttons
- **Shape:** `rounded-xl` (12px), `px-3.5 py-2`, `text-sm font-medium`, `active:scale-[0.97]` on press.
- **Primary:** Signal Sky fill, white text, inset highlight + sky Action Glow shadow (see Elevation).
- **Secondary:** `bg-white/[0.06]` with a `border-white/10` hairline, no glow — used for the lower-priority action beside a primary one.
- **Ghost:** transparent, `hover:bg-white/[0.06]`, muted text — used for tertiary/dismissive actions ("Elegir otro perfil").
- **Danger:** rose-tinted translucent fill (`bg-rose-500/15`) with a matching hairline border, reserved for destructive confirmation.

### Cards / Containers
- **Corner Style:** `rounded-2xl` (16px).
- **Background:** `bg-white/[0.035]` with `backdrop-blur-xl`.
- **Shadow Strategy:** Card Float (see Elevation).
- **Border:** `border-white/[0.08]` hairline.
- **Internal Padding:** `p-5` (20px). A `SectionTitle` (title + optional subtitle + trailing action) leads most cards with `mb-4` below it.

### Inputs / Fields
- **Style:** `bg-white/[0.04]`, `border-white/10`, `rounded-xl`, `px-3 py-2`, `text-sm`.
- **Focus:** border shifts to sky (`focus:border-sky-400`), fill brightens slightly (`focus:bg-white/[0.06]`), plus a soft sky focus ring (`focus:ring-2 focus:ring-sky-400/50`) — no default browser outline.
- **Label pattern:** every field is wrapped by a `Field` component: an uppercase-adjacent micro-label (`text-xs font-medium text-base-400`) above the control, optional hint text below.

### Badges
- **Style:** `rounded-full` pill, `px-2.5 py-0.5`, `text-xs font-medium`, translucent tinted background with a matching translucent border (10–20% opacity fill/border of the tone color) — neutral, green, yellow, red, and blue tones map directly to the Status Colors plus Signal Sky.

### Progress Bars
- **Style:** `h-1.5`–`h-2.5` track in `bg-white/[0.06]`, `rounded-full`, filled bar transitions width over `duration-500` — the system's primary way of showing any 0–1 completion value (habit compliance, level progress, budget usage), always preferred over a bare percentage number alone.

### Navigation
- **Desktop sidebar:** fixed `w-56`, translucent (`bg-white/[0.015] backdrop-blur-xl`), items as full-width rows (`rounded-lg`, `px-3 py-2`); the active item gets a 2px sky pill on its left edge plus a sky-tinted icon — never a filled background block alone.
- **Mobile:** a fixed top bar (brand + hamburger) and a fixed bottom tab bar (4 primary destinations + "Más") share the same translucent, blurred, hairline-bordered treatment as cards; the "Más" overflow opens as a bottom sheet (`rounded-t-2xl`, drag handle bar, backdrop scrim) rather than a dropdown or a new screen.

### Radar Chart (signature component)
A borderless SVG radar built from the active habit areas: concentric rings and axis spokes render in the quiet Void 700 grid color, the filled polygon uses a low-opacity Signal-Sky fill (`#5b8def` at ~20% via `33` hex alpha) with a solid Signal-Sky stroke, and each vertex is a solid dot in that habit's own Data Color — the one place a habit color is allowed to sit directly on top of the accent's polygon. This is the system's clearest expression of "many small honest instruments, one shared frame."

### Floating Quick-Add (FAB)
A 56px `rounded-full` sky-filled circle, fixed bottom-right and offset above the mobile tab bar, carrying the Action Glow shadow. It opens a bottom-anchored (mobile) / centered (desktop) modal sheet with the same Overlay Lift treatment as every other modal — the FAB is a placement pattern for the single most frequent action, not a separate visual language.

## Do's and Don'ts

### Do:
- **Do** pair every elevated surface with both an inset highlight and a soft, diffuse ambient shadow (Card Float / Action Glow / Overlay Lift) — depth is load-bearing, not decorative.
- **Do** keep Signal Sky as the only color that means "act" or "active"; let habit Data Colors stay confined to that habit's own data points.
- **Do** represent any 0–1 progress value as a bar, ring, or radar, never a bare number alone.
- **Do** reserve celebratory motion (`pop`, `confetti-fall`, `wiggle`) for moments the user actually earned — a level-up, a closed week, an unlocked achievement.
- **Do** use `rounded-full` for anything meant to feel tappable-and-alive (FAB, badges, avatars) and `rounded-xl`/`rounded-2xl` for everything else; never a sharp corner.

### Don't:
- **Don't** render any content-bearing surface flat — no translucency, no blur, no shadow reads as unfinished, not minimal, and is the one failure mode this system must never fall into.
- **Don't** introduce a second brand accent color alongside Signal Sky; a new affordance borrows sky rather than inventing a hue.
- **Don't** use a habit's Data Color outside that habit's own row, icon, or chart point — it must never become a page-wide theme color or a generic status color.
- **Don't** reach for saturated, loot-box-style color blasts, gold badge icons, or competing celebratory chrome — the system earns delight through restraint and timing, not through decoration density.
- **Don't** render the financial views as a dense literal spreadsheet (heavy table borders, monospaced grids by default); budgets and expenses use the same glass cards and progress bars as every other panel.
