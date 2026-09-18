# DB (local)

Local Redis for development, via Docker.

## Prerequisite
Docker Desktop isn't installed on this machine yet. Install it, then:

```
cd db
docker compose up -d redis
```

Redis will be reachable at `redis://localhost:6379`, matching
`backend/.env.example`.

## Schema
See `../docs/DB_SCHEMA.md` — kept in sync by the db agent, read by the backend
agent before writing any data access.
