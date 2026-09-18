# Architecture (source of truth)

This file is the shared contract all 4 agents (PM / frontend / backend / db) read
before doing anything. Whoever changes the stack or contracts here must ping the
other agents (`SendMessage`) so nobody works off a stale copy.

## Product
- Mobile app, shipped as an installable **APK** (Android).
- Non-technical owner (product decisions are the user's call, not the agents').

## Stack
| Layer     | Choice                                                            |
|-----------|--------------------------------------------------------------------|
| Frontend  | React Native via **Expo** (managed workflow) + TypeScript          |
| UI system | **Material Design 3**, via `react-native-paper` v5+ (has native M3 support) |
| Backend   | Node.js + **Express** + TypeScript                                 |
| Cache/primary store | **Redis** (default choice for all data unless truly relational) |
| Relational store | **MySQL** — only introduced if backend/db agents agree Redis genuinely can't model the data (e.g. complex joins/reporting) |
| Build output | `eas build -p android` (or local Gradle via `expo prebuild`) → `.apk` |

> Defaults chosen for a non-expert owner + fast iteration. Any agent may propose a
> change, but must write the reasoning here and message the PM before switching.

## Material Design 3 rules (frontend agent must follow)
- All screens built with `react-native-paper` M3 components — no ad-hoc styled
  buttons/cards/inputs that diverge from M3 tokens.
- One central theme file (`frontend/src/theme.ts`) defines the M3 color roles
  (primary/secondary/tertiary/error/surface/... incl. `on-*` and `-container`
  variants), typography scale, and shape/elevation tokens. Screens consume the
  theme — they never hardcode colors/fonts.
- Support light + dark M3 color schemes from day one.

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
