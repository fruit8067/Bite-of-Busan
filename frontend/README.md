# Frontend

Expo (managed) + TypeScript, React Native Paper (M3), Expo Router. See
`../docs/ARCHITECTURE.md` for the full stack/coordination contract.

## Local development
```
npm install
npm run web     # http://localhost:8081, reads EXPO_PUBLIC_API_URL or defaults to
                 # http://localhost:4000 (backend/src/index.ts local dev server)
```

## Deploying to Vercel (web build)
This deploys the **web** export only (a static SPA) — native (iOS/Android) still
ships through Expo separately. It's a **separate Vercel project from the backend**,
rooted at this `frontend/` folder.

- `npm run build:web` — runs `expo export --platform web`, outputs a static site to `dist/`
- `vercel.json` — sets `buildCommand`/`outputDirectory` for Vercel, and rewrites every
  path to `/index.html` (required for Expo Router's client-side routing — without this,
  a direct load or refresh on e.g. `/order-card` 404s since only `index.html` exists on disk)
- `.env.production` — sets `EXPO_PUBLIC_API_URL=https://biteofbusan.vercel.app` (the
  deployed backend). Expo loads this automatically for any production build/export, so
  no manual Vercel dashboard env var setup is needed for this value. It's a public API
  URL, not a secret, so it's fine to commit.

**Vercel project setup** (owner's own Vercel account, not done from an agent session):
1. New Project → import this repo → set **Root Directory** to `frontend`
2. Framework preset: "Other" (Vercel doesn't have a built-in Expo/Expo Router preset;
   `vercel.json`'s `buildCommand`/`outputDirectory` cover it)
3. Deploy — `vercel.json` and `.env.production` handle the rest

Deploying itself (`vercel login` / `vercel deploy`, or connecting the Git repo in the
Vercel dashboard) is the owner's step, not run from here.
