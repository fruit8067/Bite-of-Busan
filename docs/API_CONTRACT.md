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
Response: `{ "status": "ok", "redis": "ok" | "down" }`
Errors: none (always 200; check `redis` field for connectivity)
