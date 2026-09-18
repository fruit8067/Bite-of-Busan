# Architecture (source of truth)

This file is the shared contract all 4 agents (PM / frontend / backend / db) read
before doing anything. Whoever changes the stack or contracts here must ping the
other agents (`SendMessage`) so nobody works off a stale copy.

## Product
- Mobile app, shipped as an installable **APK** (Android) — primary target.
- **Web is also a supported target** (decided by owner, 2026-09-18), additive to
  the APK — not a replacement. Reason it's cheap: Expo's web build
  (`react-native-web`, already installed) renders the same screens without
  separate code. Known gap: `expo-image-picker`'s camera capture falls back to
  a file picker on web (no real camera), so the core "메뉴판 촬영" flow is
  weaker there — acceptable for a demo/desktop-access channel, not a reason to
  deprioritize the APK.
- **Web must be responsive** — same screens need to work at both desktop
  browser widths and mobile-browser widths (phone browser, not just the
  native app). No fixed-pixel layouts; content should reflow/constrain
  sensibly at narrow widths too. Verify with the browser at both a desktop
  width and a ~390px-wide viewport, not desktop-only.
- Non-technical owner (product decisions are the user's call, not the agents').

## Stack
| Layer     | Choice                                                            |
|-----------|--------------------------------------------------------------------|
| Frontend  | React Native via **Expo** (managed workflow) + TypeScript          |
| UI system | **Material Design 3**, via `react-native-paper` v5+ (has native M3 support) |
| Backend   | Node.js + **Express** + TypeScript, **stateless** (see below)      |
| Data store | **None** — see "No DB (2026-09-18)" below                          |
| AI layer | **OpenAI API** (GPT-4o or newer vision-capable model) from the backend — menu photo in, structured item list (name/translation/description/spice level/allergens/how-to-eat/price/restaurantName) out. One multimodal call instead of a separate OCR+translate pipeline. No dedicated OCR module for v1 — revisit (e.g. Naver Clova OCR, Google Cloud Vision) only if scan accuracy turns out to be a real problem, and record the switch here first. |
| Build output | APK: `eas build -p android` (or local Gradle via `expo prebuild`) → `.apk`. Web: `npx expo start --web` (dev) / `npx expo export --platform web` (static build) — already verified working. |

> Defaults chosen for a non-expert owner + fast iteration. Any agent may propose a
> change, but must write the reasoning here and message the PM before switching.

### No DB (2026-09-18, owner decision — reverses the earlier MySQL-primary
decision below, kept for history)
Owner wants to deploy without ongoing hosting cost. A DB (MySQL + Redis, both
need an always-on host — Railway's cheapest tier is $5/mo, free tiers for
managed MySQL/Redis are unreliable or gone) was the only part of this stack
that isn't free to run. Decision: **drop the DB entirely, backend becomes
fully stateless** — every scan calls OpenAI directly and returns the result;
nothing is persisted.
- **Traded away**: the "로컬 메뉴 지도" feature (`docs/PRODUCT.md`) — repeat
  scans of the same restaurant no longer skip the OpenAI call, no price
  history, no cross-user data accumulation. Moved back to roadmap — re-add a
  DB when there's budget/traction to justify the hosting cost.
- **db/ folder and the db agent's work are on hold** — the docker-compose/
  migrations/schema work already done is preserved in git history if this
  gets revisited, but nothing in `db/` runs in the current architecture.
- Backend: remove `mysql2`/`ioredis` usage from `POST /menu/scan` (no
  `restaurants`/`menu_items` upsert, no `cache:menu:*`/`lock:scan:*`/
  `ratelimit:scan:*`) — see `docs/TASKS.md`. The AI-inferred `restaurantName`
  (see below) is still returned in the response, just never stored.
- This also simplifies deployment: no DB to provision means the backend can
  run on more free-tier-friendly hosts (not just Railway) — revisit hosting
  choice once backend's stateless refactor lands.

~~Previous decision, superseded above~~: DB choice was reversed from the
original "Redis default" scaffold once the product (docs/PRODUCT.md) made
clear the data was fundamentally relational — MySQL became primary. That
reasoning was sound for the *product* shape; it's overridden now by a cost
constraint, not because it was wrong.

## Material Design 3 rules (frontend agent must follow)
- One central theme file (`frontend/src/theme.ts`) defines the M3 color roles
  (primary/secondary/tertiary/error/surface/... incl. `on-*` and `-container`
  variants), typography scale, and shape/elevation tokens. Screens consume the
  theme — they never hardcode colors/fonts.
- Support light + dark M3 color schemes from day one.

### Hybrid component approach (2026-09-18, revised) — owner disliked the
"generic AI-generated app" look of stock `react-native-paper` M3 components
compared to the teammate demo's crafted custom styling. Compromise, not a
full departure from M3 (full custom rebuild costs too much re-work given
what's already built):
- **Custom-styled** (highest visual footprint, biggest source of the
  "generic" feel): primary CTA buttons (shutter/analyze/create-card/flip
  buttons), the order card and scan-result item cards. Build these as
  plain `View`/`Pressable`-based components — still pull colors/type from
  `theme.ts` (so they stay on-brand and theme-aware), just not
  `react-native-paper`'s `Button`/`Card` primitives. Match the demo's shapes
  (pill buttons, rounded/bordered cards) — see the demo CSS in
  `docs/PRODUCT.md`'s artifact link for exact values (border-radius, etc.)
  if precision matters; approximate is fine otherwise.
- **Keep `react-native-paper`**: `TextInput`, `Snackbar`, `Chip` (allergen/
  spice chips are already emoji-based, fine as-is), theming plumbing. Low
  visual footprint, not what reads as "AI-generated," not worth rebuilding.
- Out of scope for now: replicating the demo's in-app camera viewfinder
  (corner brackets over a live preview) — that's a real feature (live camera
  preview via `expo-camera`), not just styling, since the app currently
  launches the OS system camera via `expo-image-picker`. Revisit as a
  separate task if wanted later.

### Brand palette (2026-09-18, superseded same day — see below)
~~Source: teammate's live demo (yellow/teal/red palette)~~ — **replaced** by
the owner with official Busan city colors (below) before frontend got far
into implementation. Typography decision (Song Myung + Noto Sans KR) still
stands — only the color role assignments changed.

### Brand palette v2 (2026-09-18, current) — Busan city colors
Owner-specified as CMYK (Y/K assumed 0), converted to hex via standard CMYK→RGB:

| Role (owner's term) | CMYK given | Hex | M3 role |
|---|---|---|---|
| 바탕색 (base/identity color) | C90 M30 | `#1AB3FF` | `primary` — main brand color, appears in app bar, primary buttons, selected states, key illustrations |
| 포인트 색 (accent, used sparingly) | C75 M100 | `#4000FF` | `secondary` — used for emphasis on top of primary (e.g. a CTA that needs to stand out from the primary chrome, selected/active accents) |

Notes for whoever implements this:
- Don't paint entire screen backgrounds `#1AB3FF` despite the name "바탕색" —
  that reads as a literal wall of saturated cyan and kills text legibility.
  Keep `background`/`surface` light-scheme near-white and dark-scheme near-
  black per normal M3 convention; `primary` shows up in components (app bar,
  buttons, chips, card headers, illustrations), not as full-bleed page fill.
- Generate the rest of the M3 tonal palette (containers, `on-*` pairs,
  tertiary, error) from these two seeds using `react-native-paper`'s M3
  theme tooling / HCT tonal generation rather than hand-picking each one.
  Error can stay a standard M3 red unless a Busan-specific error color is
  ever specified — it's a semantic system color, doesn't need to match brand
  hue.
- Both seed colors are blue-family (cyan-blue and blue-violet) — should read
  as a coherent "Busan blue" identity once the M3 tonal ramps are generated,
  not two clashing hues.

Typography updated too (2026-09-18): **부산체 (BusanFont)** replaces 'Song
Myung' for display/headline-level text — owner provided the official font
file, now at `frontend/assets/fonts/BusanFont_Provisional.ttf`. License:
Busan Metropolitan City holds the IP and permits free use (video/print/web/
mobile, no permission process required) — confirmed via the city's official
distribution. Only one weight exists (`_Provisional`), so it can't carry a
"bold" variant — use size/color for emphasis instead of a missing bold cut.
'Noto Sans KR' still handles everything else (body/labels/buttons),
unchanged.

## Folder ownership
- `frontend/` — frontend agent only
- `backend/`  — backend agent only
- `db/`       — db agent only
- `docs/`     — shared; any agent may update, but don't rewrite another agent's
  section without flagging it in the message to that agent first.
- Root `CLAUDE.md` — PM only.

Agents must not edit files outside their own folder (except `docs/`). If backend
needs a frontend change, it asks the PM, who asks the frontend agent.

## Contracts
- `docs/API_CONTRACT.md` — REST endpoints backend exposes, kept in sync by the
  backend agent; frontend agent reads it before wiring API calls.
- `docs/DB_SCHEMA.md` — Redis key patterns + (if used) MySQL schema, kept in
  sync by the db agent; backend agent reads it before writing queries.
- `docs/STATUS.md` — running handoff board (what's done / in progress / blocked)
  so a human glancing at the file (or a new session) can catch up fast.
- `docs/AGENTS.md` — live registry mapping role → folder → session name, filled
  in once all 4 windows are actually running.
