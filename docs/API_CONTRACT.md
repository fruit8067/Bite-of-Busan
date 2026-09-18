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
{ "imageUrl": string }  // public HTTPS Vercel Blob URL for a JPEG/PNG menu photo
```
The client first uploads the image directly to Vercel Blob through
`POST /api/upload/blob-upload`, then sends the returned public URL here. The
legacy `{ "imageBase64": string }` shape is still accepted for local/backward
compatibility, but new clients must use `imageUrl` to avoid the Vercel Function
4.5MB request-body limit.
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
- `400 { "error": "imageUrl is required" }` or invalid/non-HTTPS URL
- `502 { "error": "menu scan failed" }` — OpenAI call failed (see server logs)

### POST /api/upload/blob-upload
Auth: none
Request body: Vercel Blob client upload handshake payload
Response: Vercel Blob client token response
Errors: `400` when the upload handshake fails

### DELETE /api/upload/blob-delete
Auth: none
Request body: `{ "url": string }`
Response: `{ "success": true, "message": string }`
Errors: `400` when the URL is missing, `500` when Blob deletion fails

Rate limiting: not implemented, no `clientId`/session concept in v1 (no auth). Flag to PM if
abuse protection is needed before launch.
