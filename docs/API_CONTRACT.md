# API Contract

Owned by the **backend** agent. Update this whenever an endpoint is added,
changed, or removed — the frontend agent treats this file as the truth, not
the backend source code.

## Format for each endpoint
```
### METHOD /path
Auth: none | required
Request body: { ... }
Response: { ... }
Errors: 4xx/5xx cases
```

## Endpoints

### GET /health
Auth: none
Request body: none
Response: `{ "status": "ok" }`
Errors: none (always 200)

### POST /menu/scan
Auth: none

Backend is fully stateless as of 2026-09-18 (see `docs/ARCHITECTURE.md` "No DB") — no MySQL,
no Redis, no cache, no lock, nothing persisted. Every call hits OpenAI vision directly and
returns the result.

Request body:
```
{ "imageBase64": string }  // raw base64 or data: URL, JPEG/PNG photo of the menu
```
Response (200):
```
{
  "restaurantName": string | null,   // AI-read from a storefront sign/receipt/letterhead in the photo; null if none visible. Not stored anywhere — display only.
  "items": [
    {
      "id": number,                      // index within THIS response only (0, 1, 2, ...) — not a DB id, not stable across scans. Use only as a React key / local selection key.
      "nameKo": string,
      "spiceLevel": number | null,       // 0-3
      "allergens": string[],
      "howToEat": string | null,
      "priceKrw": number | null,         // KRW price as printed on the menu, null if not visible/legible. Currency conversion (TWD/JPY/CNY/USD) is done client-side.
      "translations": {
        "en": { "name": string, "description": string | null },
        "zh-TW": { "name": string, "description": string | null }
      }
    }
  ]
}
```
Behavior: single OpenAI vision call per request, no caching/dedupe — two requests for the same
restaurant both hit OpenAI. Items no longer have a stable `id` (nothing is persisted, so there's
no row to key off of).

Errors:
- `400 { "error": "imageBase64 is required" }`
- `502 { "error": "menu scan failed" }` — OpenAI call failed (see server logs)

Rate limiting: not implemented, no `clientId`/session concept in v1 (no auth). Flag to PM if
abuse protection is needed before launch.
