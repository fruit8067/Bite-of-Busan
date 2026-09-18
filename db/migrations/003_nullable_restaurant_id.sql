-- Supports scans where the AI can't read a restaurant name/signage off the
-- photo (owner decision: drop the user-typed "restaurant name" field, let the
-- AI infer it and return null when it can't — see docs/PRODUCT.md, docs/TASKS.md
-- Backend section). menu_items.restaurant_id becomes nullable so an anonymous
-- scan's items can be stored without fabricating a placeholder restaurants row.
-- The existing FK + UNIQUE(restaurant_id, name_ko) both keep working with NULL
-- (FK check is skipped for NULL; MySQL treats each NULL as distinct for
-- uniqueness, so anonymous scans never collide with each other or dedupe --
-- every anonymous scan is a plain insert, no upsert/cache reuse, matching the
-- "skip cache/lock when name is null" decision for Redis below).

ALTER TABLE menu_items
  MODIFY COLUMN restaurant_id INT UNSIGNED NULL;
