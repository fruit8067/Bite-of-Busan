# Backend

Express + TypeScript. Fully stateless (no DB) — see `../docs/ARCHITECTURE.md` "No DB".

## Local development
```
npm install
npm run dev   # http://localhost:4000, reads backend/.env
```

## Deploying to Vercel
The Express app is wrapped for Vercel's Node.js serverless functions:
- `src/app.ts` — the Express app itself (no `.listen()`), shared by both entry points
- `src/index.ts` — local dev entry point, calls `app.listen()` (`npm run dev`/`npm start`)
- `api/index.ts` — Vercel serverless entry point, exports the app
- `vercel.json` — rewrites every request to `/api` so Express's own router handles all paths

**Environment variables**: `OPENAI_API_KEY` must be set in the Vercel project's Settings →
Environment Variables — Vercel does **not** read `backend/.env` (that file is local-only and
gitignored). This is the one manual step before deploying.

Deploying itself (`vercel login` / `vercel deploy`) is the owner's own Vercel account and isn't
done from an agent session.

**Confirmed in production (2026-09-18)**: hit `413 FUNCTION_PAYLOAD_TOO_LARGE` on a real menu
photo from `biteofbusan.vercel.app`. Vercel's Node.js Functions hard-cap request bodies at
**4.5MB on every plan — not configurable**. `express.json`'s limit was lowered from `10mb` to
`4mb` (gives a clean JSON `413` for anything under Vercel's own ceiling; above it Vercel rejects
before our code even runs). This is not a backend-fixable limit — see `docs/API_CONTRACT.md`
"Size limit" note. Fix has to be client-side: compress/resize the photo before base64-encoding
it, comfortably under ~3MB raw so the base64 body stays under the cap.
