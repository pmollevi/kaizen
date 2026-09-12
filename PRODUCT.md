# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who wants to build consistent daily habits across several life areas (study, business/work, exercise, nutrition, sleep, reading, meditation, relationships, creativity, gratitude) while managing a personal monthly budget, and who is motivated by turning that consistency into a game with real stakes. Kaizen is built as a product for the general public, not a single-user personal tool, even though today each person's data lives only in their own browser under a locally-created profile (no email verification, no cloud account).

## Product Purpose

Kaizen helps people stay consistent with life habits and a personal budget by fusing both into a single game economy: a monthly planning wizard lets the user pick which habits to track (from a shared catalog) and set up the month's budget, daily logging captures habit values and expenses, and a weekly closure computes compliance, awards Progress Points (PP), unlocks real "free money" from the user's own budget, and converts streaks into "protections" that shield a bad week. Success is sustained weekly compliance across chosen habit areas and financial targets, made visible through area levels, global level, seasons, achievements, and a permanent history.

## Positioning

Unlike habit trackers that reward completion with symbolic XP/badges, or budgeting apps that only track money, Kaizen ties real money to real habits: hitting your weekly habit and finance targets unlocks actual "dinero libre" (free money) carved out of your own monthly budget, and daily streaks convert into "protecciones" that shield your progress on a bad week. The RPG shell (areas, levels, seasons with narrative and a final challenge, achievements) wraps around that real-reward loop rather than existing as decoration on top of a plain tracker.

## Operating Context

- Monthly planning wizard: user activates habits from the shared catalog and builds that month's budget (income, categories, savings, rewards allocation) before the month starts.
- Daily registro: user logs a value per active habit and can add an expense in one tap via the floating quick-add button from anywhere in the app.
- Weekly closure (cierre semanal): computes per-area and global compliance, applies bonuses, awards PP, unlocks a share of "dinero libre", grants or spends "protecciones", and can level up individual habit areas.
- Seasons (temporadas): run over a defined multi-week period with a narrative frame, timed challenges (desafíos), and a final challenge (reto final); closing a season locks its results into permanent history.
- Recognitions (reconocimientos): a catalog of unlockable achievements, some secret, spanning consistency, volume, records, financial discipline, and season completion.
- History (historial): permanent record of past seasons, personal records, unlocked recognitions, and each area's highest level ever reached — this record is never edited retroactively.
- Configuración lets the user re-label the RPG terminology, tune the underlying economy constants, and export/import their data for backup.

## Capabilities and Constraints

- **Storage is permanently local-only.** All data lives in `localStorage`, scoped per locally-created profile per browser (`kaizen:datos:<id>`). There is no backend, no cloud sync, and no password recovery — this is a deliberate, permanent product decision (privacy and simplicity), not a temporary stage of development. Future design and features must assume no server ever exists and must work fully offline.
- **Local auth is profile separation, not a security boundary.** The password is a client-side SHA-256 hash used only to let multiple people share one browser/device without seeing each other's data; it does not protect against anyone with access to that browser's storage.
- **Export/import in Configuración is the only backup or transfer path** between devices or browsers.
- **Language is Spanish throughout**, including all domain terminology (áreas, hábitos, cierre semanal, temporada, recompensas, reconocimientos). There is no i18n layer today.
- **RPG terminology is configurable, not hardcoded.** `config.textos` maps generic game labels (atributos, xp, escudos, jefeTemporada, misiones, logros, salonFama, radar) to display strings; new UI should read from this map rather than hardcoding a label.
- **Habit catalog is shared and extensible.** `CATALOGO_AREAS` currently defines 10 templates (Intelecto, Imperio, Fuerza, Vitalidad, Energía, Sabiduría, Serenidad, Vínculos, Creatividad, Gratitud); users activate a subset each month rather than being locked to fixed per-user code paths. New habits should extend this catalog.
- **Economy is tunable.** PP curve, level thresholds, protection rules, and the reward-bank cap live in `config.economia` and can be adjusted per user via Configuración rather than being fixed constants.
- **"Imperio" (business/work) uniquely blends a time metric with financial compliance** (`vinculoFinanciero`) — it is the one habit area whose completion also depends on the finance side of the app.

## Brand Commitments

- Product name **Kaizen** (Japanese for "continuous improvement") — keep.
- Current mark: a rounded sky-blue square with a Sparkles glyph (lucide-react). Not confirmed as a durable identity beyond the current build; treat as incumbent visual evidence, not a locked brand asset, until a design pass revisits it.

## Evidence on Hand

None. No real user testimonials, screenshots, press, or usage data exist yet — future work must not fabricate any of these.

## Product Principles

1. **Real stakes over symbolic points.** Every reward mechanic should ultimately connect back to the user's real budget or a tangible protection, not stay abstract XP.
2. **Local-first, forever.** Never design or build as if a server exists; every feature must work fully offline against `localStorage` alone.
3. **Consistency over intensity.** The scoring and leveling model rewards sustained weekly compliance, not one-off spikes — new mechanics should reinforce that pacing, not undercut it with binge-friendly shortcuts.
4. **One shared catalog, personalized selection.** Habits are chosen from a common catalog each month, not fixed per-user code paths; extend the catalog rather than special-casing users.
5. **Spanish-first, terminology-abstracted.** Copy is Spanish, and RPG-style labels stay swappable through `config.textos` rather than hardcoded.
