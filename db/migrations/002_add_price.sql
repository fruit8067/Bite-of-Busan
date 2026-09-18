-- Adds price (KRW) to menu_items, per owner decision to add currency
-- conversion chips to the scan/order screens (docs/PRODUCT.md).
-- Frontend converts KRW -> other currencies client-side with a fixed rate
-- table; backend only needs to return the KRW price.

ALTER TABLE menu_items
  ADD COLUMN price_krw INT UNSIGNED NULL AFTER how_to_eat;
