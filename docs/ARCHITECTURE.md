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

## Design system: none — pixel-match the sample front (2026-09-19, final, supersedes all M3 history below)
Owner decision, explicit and final: **drop Material Design 3 entirely.** Not a
hybrid, not "M3 with custom brand colors" — no `react-native-paper` M3 theme
system governing look at all. The target look is **`frontendSample/
busanbite-demo.html`** (the teammate's static HTML demo), matched as closely
as React Native allows: same colors, same fonts, same shapes (pill buttons,
card borders/radii, the camera-frame corner brackets, the gradient order
card, chip styles), same visual hierarchy. Approximate where RN can't do
something CSS can (e.g. exact `box-shadow` blur) — but the intent is
pixel-fidelity, not "inspired by."

**Scope is NOT the demo's scope** — the demo shows the full product vision
(먹기 tab enhanced + 말하기 tab + AI 챗봇 FAB). Build the *look* of everything
the demo shows, but only the *features* already in this app: menu scan →
result list (currency chips, allergen grid, price) → order card (flip to
Korean). **Do not build**: the 말하기 tab, the AI 챗봇 floating button/panel,
or a live in-app camera viewfinder (corner brackets are a static styling
element on the existing photo-preview box, not a real camera preview feed —
the app still launches the OS camera via `expo-image-picker`). If the demo's
markup for a feature we're not building would otherwise leak into a shared
component, just don't port that piece.

Concrete tokens from the demo (`frontendSample/busanbite-demo.html`'s
`:root`), for whoever restyles `theme.ts` and the custom components:

| Token | Hex | Use |
|---|---|---|
| `--stage` | `#10161f` | dark scheme background |
| `--stage-2` | `#161f2b` | dark scheme surface/variant |
| `--paper` | `#fbf6ec` | light scheme background/surface |
| `--paper-2` | `#f2ead9` | light scheme surface variant |
| `--ink` | `#211a12` | text on light/paper surfaces |
| `--muted` | `#8a7f6b` | secondary/muted text |
| `--hairline` | `#e4d9c1` | borders/dividers (light) |
| `--yellow` | `#f4b41a` | primary brand color (buttons, accents) |
| `--yellow-deep` | `#c98a00` | primary, dark-scheme variant |
| `--red` | `#c1432e` | error / spicy-level accent |
| `--teal` | `#2f6f63` | secondary accent (e.g. talk-mode-style cards, English text) |
| `--white` | `#ffffff` | button/card fills |

Typography: **'Song Myung'** (serif) for display/headline text (screen
titles, Korean dish names, the big order-card sentence), **'Noto Sans KR'**
for everything else — this is what the demo itself uses. This **reverts** the
2026-09-18 부산체(BusanFont) swap below — confirmed with owner 2026-09-19,
Song Myung it is. `assets/fonts/BusanFont_Provisional.ttf` is unused now
(fine to delete or leave).

Component approach: plain `View`/`Pressable`/custom components matching the
demo's CSS shapes directly (no `react-native-paper` Button/Card governing
appearance). Keep `react-native-paper` only for pieces with no visual
footprint worth rebuilding (e.g. `TextInput` if one remains anywhere,
`Snackbar` for error toasts) — everything visible should look like the demo,
not like Material.

### Superseded history (kept for context, do not build against these)
~~Hybrid M3 + custom buttons/cards (2026-09-18)~~ and ~~Busan city CMYK
colors as M3 primary/secondary (2026-09-18)~~ — both replaced by the above.
The Busan-blue palette (`#1AB3FF`/`#4000FF`) and the `AppButton`/`AppCard`
M3-hybrid components built for it are no longer the target look; restyle or
replace them to match the demo tokens above instead.

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
