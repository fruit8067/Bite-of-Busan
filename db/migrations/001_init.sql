-- Initial schema for busanbite (v1 MVP: 메뉴 스캔 + 로컬 메뉴 지도 캐시)
-- Matches ../../docs/DB_SCHEMA.md — keep both in sync.

CREATE TABLE IF NOT EXISTS restaurants (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL, -- v1: user-entered, no verified merchant accounts yet
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_restaurants_name (name) -- repeat-scan lookup: "has this restaurant been scanned before?"
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_items (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  restaurant_id  INT UNSIGNED NOT NULL,
  name_ko        VARCHAR(255) NOT NULL, -- as scanned off the menu
  spice_level    TINYINT UNSIGNED NULL, -- 0-3, NULL = not applicable/unknown
  allergens      JSON NULL,
  how_to_eat     TEXT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_menu_items_restaurant
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE KEY uq_menu_items_restaurant_name (restaurant_id, name_ko), -- re-scan same item = update, not duplicate
  INDEX idx_menu_items_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_item_translations (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  menu_item_id  INT UNSIGNED NOT NULL,
  language      ENUM('en', 'zh-TW', 'zh-CN', 'ja') NOT NULL, -- v1 only populates en/zh-TW, per docs/PRODUCT.md
  name          VARCHAR(255) NOT NULL,
  description   TEXT NULL,
  CONSTRAINT fk_translations_menu_item
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  UNIQUE KEY uq_translations_item_language (menu_item_id, language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
