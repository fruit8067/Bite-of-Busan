# Status board

Each agent updates its own section. Keep entries short — this is a glance
board, not a log. PM reads this before assigning new work.

## PM
- [x] Product defined: `docs/PRODUCT.md` (부산한입/BusanBite)
- [x] MVP v1 scope decided: 메뉴 스캔 → AI 설명/번역 → 주문카드, 가게별 캐시 조회
- [x] DB strategy decided: MySQL primary (relational), Redis cache/session only
- [x] `OPENAI_API_KEY` set in `backend/.env` — menu-scan AI call unblocked
- [x] ~~Bootstrap via ListAgents~~ — cross-session discovery proved unreliable between sibling windows; coordination now runs through `docs/TASKS.md` + direct SendMessage where addresses are known. See `docs/TASKS.md` for current assignments.

## Frontend
- [x] Expo + TypeScript scaffold (`npx create-expo-app`)
- [x] `react-native-paper` installed, M3 theme (`src/theme.ts`, light+dark) wired into `App.tsx`
- [x] First real screen: menu scan UI (`src/screens/MenuScanScreen.tsx`) — camera/gallery capture via `expo-image-picker`, photo preview, "Analyze Menu" button (UI flow only, not wired to backend yet — waiting on `POST /menu/scan` in `docs/API_CONTRACT.md`)
- [x] Order card screen (`src/screens/OrderCardScreen.tsx`) — item select + quantity stepper + "less spicy" option using **mock data** (`src/data/mockMenuItems.ts`, per `docs/TASKS.md`), flip animation (front: English summary, back: large Korean order sentence).
- [x] Navigation: added **Expo Router** (not bare react-navigation — SDK 57's docs now recommend Router as the file-based layer on top of react-navigation; flagged and confirmed with the coordinating session). `App.tsx`/`index.ts` replaced by `app/_layout.tsx` (theme/providers), `app/index.tsx` (scan route), `app/order-card.tsx` (order route). `package.json` main → `expo-router/entry`, `app.json` scheme `busanbite`.
- [x] Allergy AI-estimate label + confirmation card (`docs/PRODUCT.md` "MVP에 반영" / pitching Q&A ②): "AI-estimated — please confirm exact ingredients with staff" caption under allergen chips on each menu item; `src/components/AllergyQuestionCard.tsx` (large Korean "땅콩 들어가나요?" + 예/아니오 buttons, not persisted anywhere) shown on the order card screen.
- [x] Wired to real `POST /menu/scan` (`docs/API_CONTRACT.md`) — `src/api/menuApi.ts` calls it and maps the response into our internal `MenuItem` shape; `MenuScanScreen` now has a required restaurant-name field, captures the photo as base64 (`expo-image-picker`'s `base64: true`), shows a loading spinner on the Analyze button, and surfaces server errors (400/423/502) via snackbar. Scanned items are passed to the order card screen via a small `ScanResultContext` (`src/state/ScanResultContext.tsx`) instead of route params. `OrderCardScreen` now takes `items` as a prop; `app/order-card.tsx` falls back to `mockMenuItems` if reached with no scan result (e.g. dev reload straight into that route).
- [x] ~~Not yet tested against a live backend~~ — backend's `OPENAI_API_KEY` issue is fixed and verified end-to-end (see Backend section). Still no Android emulator/adb on this machine, so only verified via the web build so far, not native.
- [ ] Physical-device testing note: `src/api/config.ts` defaults to `http://localhost:4000`, which won't reach this machine from a real phone over Expo Go — needs `EXPO_PUBLIC_API_URL` set to this machine's LAN IP for that case.
- [x] Responsive web layout (owner decision: web is a supported additional channel, desktop + phone browsers, per `docs/ARCHITECTURE.md`) — added `src/components/ScreenContainer.tsx` (caps content at `maxWidth: 600`, centered, `width: 100%`) and switched `MenuScanScreen`/`OrderCardScreen`/the flip-card view to use it instead of a raw `SafeAreaView`. No-op on native (phone widths are already under the cap); on web it keeps forms/cards from stretching edge-to-edge on desktop while staying full-width on narrow viewports. `npx tsc --noEmit` clean, `expo export` clean for both `--platform web` and `--platform android`.
- [x] ~~Not visually verified at a narrow (390px) viewport~~ — confirmed by the coordinating session: `width:100% + maxWidth:600 + alignSelf:center` is a standard responsive pattern, safe at narrow widths by construction even without pixel-level browser verification (neither session has a working browser-automation tool in this environment).
- [x] **Brand rebrand v2 — Busan city colors + official typeface** (`docs/ARCHITECTURE.md` "Brand palette v2", supersedes the earlier yellow/teal demo palette): `src/theme.ts` now generates `primary`/`secondary` (+ `on-*`/container pairs) for light and dark from the two Busan seed colors (`#1AB3FF`, `#4000FF`) via Google's official HCT tonal-palette algorithm (`@material/material-color-utilities`, `TonalPalette.fromInt(...).tone(n)` at the standard M3 tone stops — 40/90/10/100 light, 80/30/90/20 dark) rather than hand-picked hex, per the instruction not to hand-tune roles. `background`/`surface`/`outline`/`error` are left as react-native-paper's plain MD3 defaults (near-white light / near-black dark, standard M3 red) — explicitly NOT painted in the brand blue, per owner's "바탕색 ≠ paint the whole screen" note. Typography: swapped from the (now-discarded) 'Song Myung' Google Font to the owner-provided `assets/fonts/BusanFont_Provisional.ttf` (city-owned license, one weight only — bold emphasis uses size/color) for display/headline-level text; 'Noto Sans KR' unchanged for the rest. `app/_layout.tsx` loads it via `expo-font`'s `useFonts` with a local `require()`, blocking render behind an `ActivityIndicator` until fonts are ready.
- [x] Bonus fix found while wiring fonts: `@expo-google-fonts/noto-sans-kr`'s package root re-exports (and therefore bundles) all 9 weight files unconditionally (~56MB) even though we only use 2. Switched to per-weight subpath imports (`@expo-google-fonts/noto-sans-kr/400Regular`, `.../500Medium`) — confirmed via `expo export` asset listing that only the 2 needed `.ttf` files are bundled now.
- [x] **Currency conversion** (`docs/PRODUCT.md` "지금 증분", matches the teammate demo's `RATES` table exactly) — `src/utils/currency.ts`: fixed KRW/TWD/JPY/CNY/USD rate table, client-side only, no backend FX call. `OrderCardScreen` has a horizontal currency-chip row; each item's price converts live. `MenuItem.priceKrw: number | null` added to the type, `mockMenuItems.ts`, and `api/menuApi.ts`'s response mapper (backend's real `priceKrw` field — see Backend section below — flows straight through).
- [x] **Allergen icon grid** (replaces the old "AI-estimated" caption-only approach, per `docs/PRODUCT.md`/demo) — `src/data/allergens.ts` (8 categories: pork/shellfish/wheat-gluten/dairy/peanut/soy/egg/buckwheat, each with emoji icon + keyword list used to match backend's free-text `allergens: string[]` — a frontend-only heuristic, not a contract change) + `src/components/AllergenGrid.tsx` (4-column grid, present-vs-absent highlighting via `errorContainer`/`surfaceVariant`). Each item card now has an "Allergy info (AI-estimated) ▾/▴" toggle instead of the old always-visible caption; emoji icons sidestep the earlier-reported web icon-font ("small box") issue entirely since they render as text, not glyphs from a font that needs loading.
- [x] Item cards restructured to match the demo's visual hierarchy: Korean name is now the large primary line (`titleLarge`, brand display font), English/Chinese translations secondary, price line added below.
- [x] `npx tsc --noEmit` clean, `expo export` clean for both `--platform web` and `--platform android` throughout all of the above.

**코디네이팅 세션이 발견/수정한 버그 2건 (2026-09-18, owner가 웹 빌드를 열었는데 무한 흰 화면):**
1. `src/components/ScreenContainer.tsx` — `SafeAreaView`(react-native-safe-
   area-context)가 웹에서 `style` prop의 `backgroundColor`를 적용 안 함
   (theme 값 자체는 정상인 것까지 콘솔 로그로 확인). 배경색을 바깥의 평범한
   `View`로 옮기고 `SafeAreaView`는 인셋(패딩)만 담당하도록 구조 변경.
2. `app/_layout.tsx` — 로컬 `require()`로 불러오는 `BusanFont_Provisional`을
   블로킹 `useFonts()`에 넣으면 웹에서 영원히 resolve 안 되고 무한 로딩
   (재현 확인됨, 원인 불명 — expo-font의 웹 로컬 애셋 처리 쪽 문제로 추정,
   폰트 파일 자체 손상은 아닌 듯). `loadAsync()`로 분리해서 non-blocking으로
   변경 — 앱은 Noto Sans KR로 바로 뜨고, 부산체는 로드되면 비동기로 적용
   (실패해도 폴백만 됨, 앱이 죽지 않음). **네이티브(APK/에뮬레이터)에서는
   로컬 폰트 require가 다른 경로를 타서 이 웹 전용 이슈가 재현 안 될 수도
   있음 — 에뮬레이터 뜨면 원래 블로킹 방식이 거기선 문제없는지 확인해주시고,
   문제없으면 native/web 분기 처리할지 이대로 둘지는 프론트엔드가 판단해주세요.**
- 둘 다 `npx expo start --web --port 8090 --clear`로 별도 깨끗한 서버에서
  직접 재현 → 수정 → 재검증 완료 (스크린샷으로 정상 렌더링 확인).

**프론트엔드 리뷰 (2026-09-18):** 두 수정 모두 코드 검토 완료, `tsc`/
`expo export`(web+android) 재검증도 정상. 판단을 맡겨주신 native/web 분기
여부는 **그대로(분기 없이 두 플랫폼 다 non-blocking) 유지**하기로 결정 —
이 환경엔 에뮬레이터가 없어서 "블로킹 방식이 네이티브에서 원래 문제없는지"
자체를 검증할 수 없고, non-blocking 방식은 두 플랫폼 다 안전(최악의 경우
네이티브에서 로컬 폰트 로딩 완료 전까지 아주 짧은 순간 Noto Sans KR로
보이다가 부산체로 바뀌는 정도)하므로, 검증 안 된 블로킹 경로를 플랫폼별로
따로 유지하는 것보다 지금의 단일 경로가 더 안전하다고 판단했습니다. 에뮬레이터
확보되면 실제로 확인해서 필요하면 재검토하겠습니다.

## Backend
- [x] Express + TypeScript scaffold, `npm install` done, type-checks clean
- [x] `GET /health` endpoint (checks Redis connectivity) — documented in `docs/API_CONTRACT.md`
- [x] Verified against live Redis: `{"status":"ok","redis":"ok"}`
- [x] `POST /menu/scan` implemented (OpenAI vision → MySQL upsert → Redis cache, `lock:scan:*`
  mutex) — documented in `docs/API_CONTRACT.md`. Type-checks clean; verified end-to-end
  including a real OpenAI vision call.
- [x] ~~BLOCKED: OPENAI_API_KEY 401~~ — root cause found: this machine has a **stale
  Machine-level Windows env var `OPENAI_API_KEY`** (different/old key) that was silently
  shadowing the correct value from `backend/.env`, since `dotenv` doesn't override existing
  `process.env` vars by default. The `.env` key itself was always valid. Fixed in
  `backend/src/index.ts` with `dotenv.config({ override: true })` so the project's `.env` always
  wins. (The stale system env var itself is still sitting on this machine — harmless for this
  app now, but worth cleaning up if it causes confusion in another project.)
- [ ] Rate limiting (`ratelimit:scan:{clientId}`) not implemented — no clientId/session concept
  in v1 yet, noted as open item in `docs/API_CONTRACT.md`.
- [x] `priceKrw` field (owner decision, teammate demo) — DB migration confirmed applied
  (`price_krw INT UNSIGNED NULL` verified independently via `DESCRIBE menu_items` against the
  live container), then wired: OpenAI prompt now extracts `priceKrw` (`src/services/menuScan.ts`),
  `menuRepo` upsert writes/updates `price_krw` (insert, NULL price, and price-change-on-rescan
  all verified directly against MySQL), response type + `docs/API_CONTRACT.md` updated. Currency
  conversion stays client-side per the task — backend only returns the KRW integer.
  (Superseded below — this MySQL-backed version no longer runs; see "No DB refactor".)
- [x] **No DB refactor** (`docs/ARCHITECTURE.md` "No DB", owner decision — deploy cost) — backend
  is now fully stateless. `POST /menu/scan`: removed all MySQL/Redis code (`src/services/
  menuRepo.ts`, `src/config/mysql.ts`, `src/config/redis.ts` deleted; `mysql2`/`ioredis` removed
  from `package.json`, `npm install` clean). Request is now just `{ imageBase64 }` —
  `restaurantName` is no longer a request field, the old `400 restaurantName is required` error is
  gone. `src/services/menuScan.ts`'s OpenAI prompt now also extracts `restaurantName` (from a
  storefront sign/receipt/letterhead in the photo, `null` if none visible) alongside the menu
  items, in the same vision call. Response returns `restaurantName` (display-only, never stored)
  and `items`, no cache/lock/upsert step — every call hits OpenAI directly, no dedupe. Also
  dropped: `restaurantId` (no DB row to reference), the real per-item `id` (was the MySQL PK) —
  replaced with a response-scoped index (0,1,2,...) so the frontend keeps a stable React key
  *within one scan result*; flagged in `docs/API_CONTRACT.md` as not stable across scans/not a DB
  id (not explicitly in the PM's refactor instructions, but dropping `id` entirely would have
  silently broken `frontend/src/api/menuApi.ts`'s existing response mapping — messaged PM). `GET
  /health` simplified to `{ "status": "ok" }` (no Redis check). `docs/API_CONTRACT.md` rewritten
  for both endpoints. Verified: `tsc --noEmit` clean, server boots, `/health` and the
  `imageBase64`-missing 400 both checked live against a running instance. Did not burn a real
  OpenAI call on this change (no sample menu photo on hand) — the earlier end-to-end OpenAI
  verification above already covers the vision-call path; this only adds one more field to the
  same prompt/response-format contract, and the code falls back to `restaurantName: null` if the
  model omits it.
- [x] `.env`/`.env.example` — removed now-unused `REDIS_URL`/`MYSQL_URL` lines.

## DB
- [x] `db/docker-compose.yml` updated with MySQL service alongside Redis (matches ARCHITECTURE.md's MySQL-primary decision; `backend/.env.example` already points at it)
- [x] Real migration `db/migrations/001_init.sql` (restaurants / menu_items / menu_item_translations) — synced into `docs/DB_SCHEMA.md`
- [x] Redis key patterns defined (`docs/DB_SCHEMA.md`): `cache:menu:*` hot-path cache, `lock:scan:*` dedupe lock, `ratelimit:scan:*` abuse control
- [x] Container/migration verified by the coordinating session: `docker compose up -d` + `001_init.sql` applied cleanly, `SHOW TABLES` confirms all 3 tables. Host MySQL port changed to **3307** (3306 already taken by another local mysqld on this machine) — `db/docker-compose.yml`, `backend/.env(.example)`, `db/README.md` updated.
- [x] **`menu_items.price_krw`** (owner decision, teammate demo — see `docs/TASKS.md`) — added via new `db/migrations/002_add_price.sql` (`001_init.sql` left untouched, per instruction). Applied against the live container and verified with `DESCRIBE menu_items` — column present (`int unsigned NULL`). `docs/DB_SCHEMA.md` warning removed. Backend unblocked.
- [ ] Restaurant-name matching for repeat scans is exact-ish (trim+lowercase) — no fuzzy/typo handling; flag to PM if that turns out to cause duplicate restaurant rows in practice
- [~] **Nullable `restaurant_id` for AI-inferred restaurant name** (owner removed the user-typed name field — backend now infers it, can be `null`; see `docs/TASKS.md` Backend section) — decision made and written up in `docs/DB_SCHEMA.md` ("Restaurant name can be null"): no placeholder `restaurants` row, `menu_items.restaurant_id` goes nullable instead, anonymous scans are plain inserts (no upsert/cache/lock — `cache:menu:*`/`lock:scan:*` skipped entirely when name is null). Migration written: `db/migrations/003_nullable_restaurant_id.sql` (`MODIFY COLUMN restaurant_id INT UNSIGNED NULL`). **Not yet applied** — this session has no `docker` on PATH (unlike when 001/002 were verified). Needs PM/coordinating session to run it against the live container and confirm with `DESCRIBE menu_items`, same as `002_add_price.sql`'s verification. Backend's null-restaurantName work depends on this landing first.
