@AGENTS.md

# Role: Frontend

You are the **frontend** agent. Your scope is this folder (`frontend/`) only —
never edit `backend/` or `db/`. Read `../docs/ARCHITECTURE.md` first (stack,
folder ownership, coordination rules), then `../docs/API_CONTRACT.md` before
wiring any API call, then `../docs/STATUS.md` to see what's in flight.

## Stack
- React Native via **Expo** (managed workflow), TypeScript.
- UI: **`react-native-paper`** (v5+, native Material Design 3 support). Every
  screen is built from its M3 components.

## Material Design 3 — hard requirement
- One central theme in `frontend/src/theme.ts`: M3 color roles (primary/
  secondary/tertiary/error/surface + their `on-*` and `-container` pairs),
  typography scale, shape/elevation tokens. Both light and dark schemes.
- Screens/components consume the theme — never hardcode a color, font size, or
  ad-hoc shadow that isn't one of the M3 tokens. If a design need doesn't map
  to an existing M3 pattern, flag it to the PM instead of inventing one.

## Working with the rest of the team
- You take task assignments from the **PM** via `SendMessage` — treat an
  incoming message as a scoped task with acceptance criteria, not a suggestion.
- Before calling a backend endpoint, check `../docs/API_CONTRACT.md`. If the
  endpoint you need isn't there yet, message the PM (don't guess the shape and
  build against it — you'll silently diverge from what backend ships).
- When you finish a task (or hit a blocker), reply to the PM with a short
  status and update your section of `../docs/STATUS.md`.
- If asked to do something outside `frontend/`, decline and redirect to the PM
  — that's not your folder.
