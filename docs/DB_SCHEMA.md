# DB Schema

> **⚠ ON HOLD (2026-09-18)**: owner decided to drop the DB entirely for free
> deployment (see `docs/ARCHITECTURE.md` "No DB" section) — nothing below is
> live in the current architecture. Kept for reference in case a DB gets
> re-added later. Don't build against this until that decision is reversed.

Owned by the **db** agent. Update this whenever a MySQL table or Redis key
pattern changes — the backend agent treats this file as the truth.

MySQL is primary (relational: restaurants own menu items); Redis is cache/
session only. See `docs/ARCHITECTURE.md` and `docs/PRODUCT.md` for why.

## MySQL schema
Real migrations: `db/migrations/001_init.sql` + `002_add_price.sql` +
`003_nullable_restaurant_id.sql` (source of truth for exact types/indexes/
constraints — this block is a readable summary, keep all three in sync).

```
restaurants
  id            INT UNSIGNED PK AUTO_INCREMENT
  name          VARCHAR(255) NOT NULL   -- v1: AI-inferred from signage, no verified merchant accounts yet
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  INDEX(name)                            -- repeat-scan lookup by name

menu_items
  id              INT UNSIGNED PK AUTO_INCREMENT
  restaurant_id   INT UNSIGNED NULL FK -> restaurants.id ON DELETE CASCADE
                                          -- nullable via 003_nullable_restaurant_id.sql — see
                                          --   "Restaurant name can be null" below. NOT YET APPLIED,
                                          --   needs docker exec + DESCRIBE verification like 002 was.
  name_ko         VARCHAR(255) NOT NULL  -- as scanned
  spice_level     TINYINT UNSIGNED NULL  -- 0-3
  allergens       JSON NULL
  how_to_eat      TEXT NULL
  price_krw       INT UNSIGNED NULL      -- added via 002_add_price.sql, applied+verified against
                                          --   the running container (DESCRIBE menu_items confirmed)
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  UNIQUE(restaurant_id, name_ko)         -- re-scan of same item = update, not duplicate.
                                          --   MySQL treats every NULL restaurant_id as distinct for
                                          --   uniqueness, so this still holds once restaurant_id is
                                          --   nullable (see below) — no schema change needed here.
  INDEX(restaurant_id)

menu_item_translations
  id            INT UNSIGNED PK AUTO_INCREMENT
  menu_item_id  INT UNSIGNED FK -> menu_items.id ON DELETE CASCADE
  language      ENUM('en','zh-TW','zh-CN','ja')  -- v1 only populates en/zh-TW
  name          VARCHAR(255) NOT NULL
  description   TEXT NULL
  UNIQUE(menu_item_id, language)
```

Restaurant identity for v1 is the AI-inferred name from the photo (no GPS
matching, no merchant accounts) — matching lookup on repeat scan is a
case-insensitive match on `restaurants.name`. Revisit if this causes
false-negative "new restaurant" rows for near-duplicate names (typos,
whitespace).

### Restaurant name can be null (2026-09-18, db decision)
Backend is removing the user-typed `restaurantName` field (`docs/TASKS.md`
Backend section) — the AI now infers it from signage in the photo, and
returns `null` when it can't read one. Decision on how to store that case,
picked to avoid fabricating fake restaurant identities:

- **No placeholder row.** We do *not* create a `restaurants` row with a name
  like `"Unknown-{timestamp}"` — that would pollute `restaurants.name` (which
  backend/frontend treat as a real, user-facing label) with junk, and every
  anonymous scan would need its own fake row anyway since there's nothing to
  match it against on a repeat scan.
- Instead, **`menu_items.restaurant_id` is now nullable**
  (`003_nullable_restaurant_id.sql`). When `restaurantName` is `null`:
  backend skips the `restaurants` table lookup/insert entirely and inserts
  `menu_items` rows directly with `restaurant_id = NULL`.
  - This also means **no upsert for anonymous scans** — `UNIQUE(restaurant_id,
    name_ko)` never matches an existing row when `restaurant_id` is `NULL`
    (MySQL indexes treat each `NULL` as distinct), so every anonymous scan is
    a plain insert, never an update. That's intentional: without a name
    there's no reliable way to know it's "the same restaurant" on a repeat
    scan, so there's nothing to safely reuse/upsert into.
  - `menu_item_translations` is unaffected — it keys off `menu_item_id`, not
    `restaurant_id`.
- **Status: migration written, never applied — moot now.** Before it could be
  applied/verified, the owner decided to drop the DB entirely (see the "⚠ ON
  HOLD" note at the top of this file / `docs/ARCHITECTURE.md` "No DB"). No
  action needed unless a DB gets re-added later, at which point this
  migration (plus the "no upsert for anonymous scans" behavior above) is
  still the right approach to pick back up.

## Redis key patterns
Backend reads this section before writing any Redis access. Redis is cache/
rate-limit only here — MySQL is the durable store (see above).

| Key pattern | Value | TTL | Why |
|---|---|---|---|
| `cache:menu:{restaurantNameNormalized}` | JSON: `{ restaurantId, items: [...] }` (same shape as the menu-lookup API response) | 300s | Hot-path read cache in front of MySQL for the "local menu map" lookup — repeat scans/views of the same restaurant within a few minutes skip the DB round trip. `restaurantNameNormalized` = trimmed + lowercased name, matching the MySQL lookup rule above. |
| `lock:scan:{restaurantNameNormalized}` | `"1"` | 20s | `SET NX EX` mutex so two users scanning the same restaurant at the same moment don't trigger duplicate OpenAI vision calls; second caller waits/polls instead of double-billing the AI call. |
| `ratelimit:scan:{clientId}` | counter (`INCR`) | 60s | Basic abuse control on the AI scan endpoint (no auth in v1, so `clientId` = device/session id issued by backend, not a user account). Cap enforced by backend. |

Any of these is invalidated/overwritten naturally by TTL expiry — no manual
invalidation needed since MySQL is always the source of truth underneath.

**When `restaurantName` is `null` (2026-09-18, db decision):** backend skips
`cache:menu:*` and `lock:scan:*` entirely for that request — don't key either
one on a literal `"null"` string. There's no restaurant identity to cache a
lookup under or to deduplicate concurrent scans against (see the MySQL
decision above — same reasoning: nothing to safely match a repeat request
to), so every anonymous scan just calls OpenAI directly, uncached and
unlocked. `ratelimit:scan:{clientId}` is unaffected — it keys off the client,
not the restaurant, so it still applies.
