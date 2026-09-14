# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who wants to build consistent daily habits across several life areas (study, business/work, exercise, nutrition, sleep, reading, meditation, relationships, creativity, gratitude) while keeping a clear, separate handle on personal spending, and who is motivated by streaks, levels, and achievements rather than by money-based incentives. Origo is built as a product for the general public, not a single-user personal tool, even though today each person's data lives only in their own browser under a locally-created profile (no email verification, no cloud account).

## Product Purpose

Origo helps people sustain consistency in life habits and stay in control of their personal spending, as two parts of the same personal-growth system rather than one game economy. A monthly planning wizard lets the user pick which habits to track (from a shared catalog) and set a weekly goal for each; daily logging captures habit values, and a weekly closure computes compliance, awards Progress Points (PP), and converts sustained streaks into "protections" that shield a bad week. Success is sustained weekly compliance across chosen habit areas, made visible through area levels, global level, seasons, achievements, and a permanent history. Finanzas is a separate, plain expense-tracking tool — money is never a habit reward, penalty, or unlock.

## Positioning

Unlike gamified habit trackers that lean on loot-box-style rewards, or budgeting apps bolted onto an unrelated tracker, Origo is one coherent personal-growth system: habits are driven purely by streaks, levels, and achievements (never money), and Finanzas is a sober, editorial tool for understanding where your money goes — cash vs. card, categories, and per-card billing-cycle summaries. The RPG shell (areas, levels, seasons with narrative and a final challenge, achievements) exists to reinforce discipline and consistency, deliberately kept quiet and secondary rather than loud or game-like.

## Operating Context

- Monthly planning wizard: user activates habits from the shared catalog, sets each one's weight and weekly/daily goal, and optionally a big goal for the month. No financial setup happens here.
- Daily registro: user logs a value per active habit and can add an expense in one tap via the floating quick-add button from anywhere in the app.
- Weekly closure (cierre semanal): computes per-area and global compliance, applies bonuses, awards PP, grants or spends "protecciones", and can level up individual habit areas — entirely habit-based, no money involved.
- Finanzas: pure personal expense control — log what was bought, how much, its category, and whether it was paid in cash or by card; register up to 3 credit cards (name + billing/cutoff day); the app auto-generates a summary on each card's cutoff day and a general summary at month's end (total spent, cash vs. card, category breakdown).
- Seasons (temporadas): run over a defined multi-week period with a narrative frame, timed challenges (desafíos), and a final challenge (reto final); closing a season locks its results into permanent history.
- Recognitions (reconocimientos): a catalog of unlockable achievements, some secret, spanning consistency, volume, records, and season completion.
- History (historial): permanent record of past seasons, personal records, unlocked recognitions, and each area's highest level ever reached — this record is never edited retroactively.
- Configuración lets the user re-label the RPG terminology, tune the underlying economy constants, and export/import their data for backup.

## Capabilities and Constraints

- **Habit and expense data is permanently local-only.** All of it lives in `localStorage`, scoped per locally-created profile per browser (`kaizen:datos:<id>` — the storage key prefix stays as-is, it's invisible to users and renaming it would wipe existing data). There is no cloud sync and no password recovery for this data — a deliberate, permanent product decision (privacy and simplicity). A minimal Cloudflare Worker backend does exist, but only for opt-in web push notifications (racha en riesgo, corte de tarjeta): it stores a push subscription plus the bare minimum needed to decide when to notify, never habit or expense content. Future design and features must assume no server exists for anything beyond that opt-in notification relay, and the app must keep working fully offline without it.
- **Local auth is profile separation, not a security boundary.** The password is hashed client-side (PBKDF2 + a random per-user salt) used only to let multiple people share one browser/device without seeing each other's data; it does not encrypt the stored data and does not protect against anyone with access to that browser's storage. There is no password recovery.
- **Export/import in Configuración is the only backup or transfer path** between devices or browsers.
- **Language is Spanish throughout**, including all domain terminology (áreas, hábitos, cierre semanal, temporada, recompensas, reconocimientos). There is no i18n layer today.
- **RPG terminology is configurable, not hardcoded.** `config.textos` maps generic game labels (atributos, xp, escudos, jefeTemporada, misiones, logros, salonFama, radar) to display strings; new UI should read from this map rather than hardcoding a label.
- **Habit catalog is shared and extensible.** `CATALOGO_AREAS` currently defines 10 templates (Intelecto, Imperio, Fuerza, Vitalidad, Energía, Sabiduría, Serenidad, Vínculos, Creatividad, Gratitud); users activate a subset each month rather than being locked to fixed per-user code paths. New habits should extend this catalog.
- **Economy is tunable.** PP curve, level thresholds, and protection rules live in `config.economia` and can be adjusted per user via Configuración rather than being fixed constants. There is no reward-bank or money-unlock concept anywhere in this economy.
- **Habits never touch money.** No habit area, weekly closure, or achievement reads or grants money — Finanzas is fully decoupled from the habit-gamification loop. "Imperio" (business/work) is a plain time-tracked habit like any other, with no financial submetric.
- **Finanzas has its own small entities.** `Tarjeta` (name + `diaCorte`, max 3) and `CategoriaGasto` (a flat, user-editable list) model cards and expense categories; `Gasto.metodo` is `"efectivo" | "tarjeta"`. There is no budget/allocation model — categories are labels for reporting, not spending limits.

## Brand Commitments

- Product name **Origo**, tagline "Start where you are" — keep. (Renamed from Kaizen; internal identifiers that users never see — localStorage key prefixes, the Cloudflare Worker name `kaizen-push`, its KV namespace — were deliberately left as-is to avoid wiping existing users' data or requiring redeployment; see `DESIGN.md`.)
- Current mark: a metallic olive ring with a cut, rendered from a raster source (`OrigoMark`, `src/components/ui/OrigoMark.tsx`, backed by `public/icons/icon-192.png`), usable alone or with the "ORIGO" wordmark. See `DESIGN.md` for the full system.

## Evidence on Hand

None. No real user testimonials, screenshots, press, or usage data exist yet — future work must not fabricate any of these.

## Product Principles

1. **Discipline over dopamine.** Habit rewards are streaks, levels, and achievements — never money, never a loot-box feel. Gamification stays quiet and secondary to the sense of real, sustained progress.
2. **Local-first, forever.** Never design or build as if a server exists; every feature must work fully offline against `localStorage` alone.
3. **Consistency over intensity.** The scoring and leveling model rewards sustained weekly compliance, not one-off spikes — new mechanics should reinforce that pacing, not undercut it with binge-friendly shortcuts.
4. **One shared catalog, personalized selection.** Habits are chosen from a common catalog each month, not fixed per-user code paths; extend the catalog rather than special-casing users.
5. **Spanish-first, terminology-abstracted.** Copy is Spanish, and RPG-style labels stay swappable through `config.textos` rather than hardcoded.
