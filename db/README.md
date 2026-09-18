# DB (local)

Local Redis for development, via Docker.

## Prerequisite
Docker Desktop isn't installed on this machine yet. Install it, then:

```
cd db
docker compose up -d
```

Redis at `redis://localhost:6379`, MySQL at `mysql://root:changeme@localhost:3307/busanbite`
(host port 3307, not 3306 — this machine already has another local mysqld on
3306; root password `changeme`, local dev only) — matching `backend/.env.example`.

Apply the schema once the containers are up:
```
docker compose exec -T mysql mysql -uroot -pchangeme busanbite < migrations/001_init.sql
```

## Schema
See `../docs/DB_SCHEMA.md` — kept in sync by the db agent, read by the backend
agent before writing any data access. Real migration files live in
`migrations/` (`001_init.sql` = restaurants/menu_items/menu_item_translations).
