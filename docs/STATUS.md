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
- [x] **지금 증분 3건 완료** (`docs/PRODUCT.md`/`docs/TASKS.md` "owner 지적 3건"):
  1. **UI 다국어 지원** — 커스텀 컨텍스트 기반 i18n (`src/i18n/strings.ts` en/zh-TW 사전,
     `src/i18n/LanguageContext.tsx` — 별도 라이브러리 없이 훅+Context, `AsyncStorage`로
     `busanbite.uiLanguage` 영속화). 첫 실행 시 `app/onboarding-language.tsx`(신규 M3 화면,
     `AppButton`/theme 토큰만 사용 — `MenuScanScreen`/`OrderCardScreen`과 달리 하드코딩 색 없음)로
     리다이렉트, 선택 후 저장하고 `/`로 복귀. `app/index.tsx`가 게이트 역할(`ready`/`language`
     확인 후 `<Redirect>`). `MenuScanScreen`/`OrderCardScreen`/`AllergenGrid`/
     `AllergyQuestionCard`/`currency.ts`의 모든 버튼·라벨·힌트·에러 메시지를 키로 교체.
     **예외 그대로 유지**: 주문카드 뒷면 한국어 문장, `AllergyQuestionCard`의 "땅콩
     들어가나요?" 질문은 UI 언어와 무관하게 항상 한국어 고정(사장님용). 카드 앞면(고객용
     문구: TO. STAFF/老闆, flip 버튼, edit 버튼)은 화면 자체의 콘텐츠-언어 토글(en/繁中,
     `OrderCardScreen`의 기존 언어 칩)을 따르도록 `translate(lang, key)` 헬퍼로 분리 — 이
     과정에서 기존 버그 하나 발견/수정: `FlippableOrderCard`의 `edit` 필드가 en/zh-TW 둘 다
     하드코딩된 한국어 "메뉴 수정"였음(번역 안 됨) → 이번에 정식으로 "Edit menu"/"編輯菜單"로
     분리.
  2. **가게 이름 입력 필드 제거** — `MenuScanScreen`에서 `TextInput` 완전 삭제,
     `src/api/menuApi.ts`의 `scanMenu()`는 이제 `imageBase64`만 보내고
     `{ restaurantName, items }`를 반환(백엔드의 stateless 리팩터 이후 실제 계약과 이미 일치 —
     `docs/API_CONTRACT.md` 최신본 확인함). `OrderCardScreen`에 `restaurantName` prop 추가,
     "{가게}의 메뉴예요" / 이름 없으면 "이 가게의 메뉴예요" 문구 표시(`ScanResultContext`도
     `restaurantName: string | null` 허용하도록 타입 수정).
  3. **재촬영 기능** — 사진 미리보기 위에 "✕ Retake" 배지 버튼 추가, 누르면 `imageUri`/
     `imageBase64`/`fileName` 초기화하고 다시 촬영/갤러리 선택 화면으로.
  - `npx tsc --noEmit`, `expo export`(web+android) 모두 클린. 온보딩→스캔→주문카드→
    뒤집기카드 전체 플로우를 `npx expo start --web`로 직접 띄워서 브라우저로 검증
    (언어 선택, 필드 제거, 모든 번역 라벨, restaurant 문구, allergy 카드까지 스크린샷 확인).
  - **참고/미해결**: `MenuScanScreen`/`OrderCardScreen`은 여전히 데모 재현용 하드코딩 색
    팔레트(마젠타/네이비 글로우, `#EC008C` 등)를 쓰고 있어 `frontend/CLAUDE.md`의 "테마 토큰만
    사용" 원칙과 어긋남 — `theme.ts`/`AppButton`/`AppCard`는 정상인데 이 두 화면만 그 전
    "데모 모양 재현" 작업 때부터 별도 하드코딩 스타일 시트를 씀. 이번 작업 범위 밖이라
    손대지 않았고, PM/owner 판단 필요하면 알려주세요.
  - 브라우저 검증 중 발견한 기존(내 변경과 무관한) 이슈: 주문카드 뒤집기 애니메이션이
    `rotate`(2D)를 써서 웹에서 뒷면이 좌우반전된 채 앞면과 겹쳐 보임(`backfaceVisibility`가
    react-native-web에서 완전히 적용 안 되는 것으로 보임) — 네이티브에서 재현되는지는 확인
    못함(에뮬레이터 없음). 급한 건 아니지만 다음에 카드 쪽 손댈 때 참고해주세요.
- [x] **색상 통일 완료** (`docs/TASKS.md` "owner 결정 — 색상 통일", 위에서 제가 남긴
  하드코딩 색 지적에 대한 오너 결정) — `MenuScanScreen.tsx`/`OrderCardScreen.tsx`에서
  `#EC008C`(마젠타)/`#003795`/`#58228F` 등 하드코딩 hex를 전부 제거하고 `useTheme()`의
  `theme.colors.*` 토큰으로 교체:
  - 주요 CTA(촬영/갤러리/Analyze/Create Order Card/flip 버튼)는 `AppButton`으로 교체.
    `AppButton`이 이미 `loading` prop을 지원해서 Analyze 버튼의 로딩 텍스트 스와핑 로직도
    같이 단순화됨(원형 셔터 버튼 모양은 포기하고 일반 pill 버튼으로 통일 — `AppButton`이
    원형을 지원하지 않아서 모양보다 컴포넌트 재사용/토큰 준수 쪽을 우선했습니다).
  - 스캔결과 항목 카드는 `AppCard`로 교체(선택 시 `primaryContainer`/`primary` 테두리).
  - 배경 글로우/브랜드 타이틀/모드 스위치/스테퍼 점/폰 프레임/노치/스캔 프레임/코너
    브래킷/메뉴판 목업/알레르기 토글/가격 등 화면 전체 색상을 `primary`/`secondary`/
    `surface`/`surfaceVariant`/`outline`/`onSurface(Variant)` 토큰으로 재매핑 — 라이트/
    다크 양쪽에서 자동으로 맞는 색이 나옵니다(이전엔 다크 배경 고정).
  - 주문카드 앞/뒷면(뒤집기 카드)은 애니메이션(`Animated.View` + `rotate`) 때문에
    `AppCard`로 감쌀 수 없어서(정적 View만 지원) 예외적으로 `Animated.View`를 유지하되
    배경은 `theme.colors.primary`(앞면)/`theme.colors.secondary`(뒷면)로, 텍스트는
    `onPrimary`/`onSecondary`로 교체 — 부산블루 두 시드 색이 정확히 앞/뒷면 구분에
    맞아떨어졌습니다.
  - "덜 맵게" 인라인 토글 필/수량 스테퍼는 `Chip`/`TextInput`/`Snackbar`와 같이 "그대로
    둘 것" 목록에 없었지만 시각적 비중이 작아 컴포넌트 교체 대신 토큰 색상만 적용.
  - `Chip`(언어/통화 선택)에 하드코딩됐던 `backgroundColor: "#ffffff"` 오버라이드 제거 —
    Paper의 M3 기본 Chip 스타일 그대로 사용.
  - **범위 밖으로 남겨둔 것(명시적으로 지시받은 파일만 작업)**: `ChatBotOverlay.tsx`는
    지시가 `MenuScanScreen.tsx`/`OrderCardScreen.tsx`로 특정돼 있었고 `docs/PRODUCT.md`
    로드맵상 v1 범위 밖(AI 챗봇) 기능이라 손대지 않음 — 여전히 마젠타/남색 하드코딩
    색을 씁니다. 필요하면 알려주세요.
  - "말하기" 모드 스위치 버튼: 판단을 맡겨주셔서 그대로 뒀습니다(원래도 onPress 없이
    비활성 표시만 하던 버튼이라 숨기지 않아도 헷갈릴 위험이 적다고 판단).
  - `npx tsc --noEmit`, `expo export`(web+android) 클린. 브라우저로 두 화면(스캔, 선택
    목록/선택된 카드, 뒤집기 카드, 알레르기 카드) 전부 재검증 — 마젠타/남색 완전히
    사라지고 부산블루 계열로 통일된 것 스크린샷으로 확인.

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

- [x] **주문카드 뒤집기 언어 버그 수정** (owner 리포트: "역방향(점원 쪽)일 땐 한국어
  괜찮은데, 정방향으로 돌아왔을 때 유저 언어로 안 바뀜") — 위에서 미해결로 남겨뒀던
  "`rotate`(2D)라서 웹에서 뒷면이 겹쳐 보임" 버그가 원인이었음: `backfaceVisibility`는
  3D 회전(rotateX/Y)에서만 의미가 있는데 Z축 `rotate`를 쓰고 있어서, 뒤에 선언된
  한국어 카드(`primary` 배경)가 회전 각도와 무관하게 항상 앞 카드(번역된 `secondary`
  배경) 위를 완전히 덮고 있었음 — 웹뿐 아니라 네이티브에서도 같은 구조적 문제.
  `FlippableOrderCard`(`src/screens/OrderCardScreen.tsx`)의 앞/뒷면 `transform`을
  `rotate` → `perspective + rotateY`(진짜 3D 카드 뒤집기)로 교체 — 새 AI 호출 없이
  이미 갖고 있던 데이터(`line.nameCustomer`=스캔 시 받은 번역, `line.nameKo`)를 그대로
  사용, 회전 각도에 따라 올바른 면이 보이도록 수정. `npx tsc --noEmit`, `expo export
  --platform web` 클린. (세션 없어서 PM이 직접 수정 — owner 지시)
  - **후속 수정**: 브라우저로 직접 뒤집어보니 회전 자체가 애니메이션 없이 순간적으로
    끝나버림(owner 리포트: "180도 xy 방향으로 돌아가야 되는데 안돌아가네") — 원인은
    `perspective`를 애니메이션되는 `rotateY`와 같은 `transform` 배열에 섞어 넣어서
    RN Animated가 보간을 못 하고 최종값으로 바로 점프해버린 것. `perspective`를
    부모(정적) `flipArea`로 분리하고 자식 `Animated.View`엔 `rotateY`만 남겨서 해결,
    8초로 늘려서 중간 프레임(옆모습 → 뒤집힘)까지 실제로 캡처해서 검증함.

- [x] **디자인 시스템 M3 완전 폐기 → 샘플과 픽셀 매칭** (`docs/TASKS.md` "Now
  (2026-09-19, owner 결정 — 최종)" / `docs/ARCHITECTURE.md` "Design system: none",
  owner가 직접 "task.md 보고 m3 버리고 sample보고 그대로 클론코딩 해" 지시 — 세션
  없어서 PM이 직접 작업):
  - `src/theme.ts` — `@material/material-color-utilities`의 HCT 톤 생성 로직 전부
    제거, `frontendSample/busanbite-demo.html`의 실제 `:root` 값(스테이지 남색/
    마젠타 `#ec008c`·`#003795`, 청록 `#0095d9`, 레드 `#58228f`, 페이퍼 `#fbf8ff` 등)을
    그대로 쓰는 플랫 팔레트로 교체. **참고**: `docs/ARCHITECTURE.md`의 토큰 표(금색
    `#f4b41a`/테라코타 계열)는 실제 샘플 파일과 다른 값이었음(문서가 샘플보다 먼저
    쓰였거나 갱신이 안 된 것으로 추정) — owner가 "sample보고 그대로"라고 명시했으므로
    문서 표 대신 `frontendSample/busanbite-demo.html`의 실제 CSS 값을 그대로 따름.
    ARCHITECTURE.md 토큰 표는 갱신 안 했으니 다음에 문서 작업할 때 실제 파일 기준으로
    바로잡아주세요.
  - 폰트: 부산체(`BusanFont_Provisional`) 되돌리고 Song Myung(`@expo-google-fonts/
    song-myung` 새로 설치) + Noto Sans KR로 복귀. `app/_layout.tsx`의 non-blocking
    부산체 로딩 로직 제거, Song Myung을 기존 `useFonts` 블로킹 호출에 합침(원래도
    Noto Sans KR과 같은 Google Font 방식이라 웹에서 멈추는 문제 없음).
  - `AppButton`에 `variant="dark"`(ink 배경 + yellow 텍스트) 추가 — 데모의
    make-card-btn/flip-btn과 동일한 톤. Analyze/Create Order Card/flip 버튼에 적용.
  - `AppCard` 배경을 `surface`(크림톤 paper) 대신 순수 `white`로, radius 8→16 —
    데모의 `.item-card`와 일치.
  - `MenuScanScreen`의 스캔 프레임/목업 메뉴판을 데모의 다크 브라운 SVG 목업 색상
    (`#2a2018`/`#f2ead9`/`#4a3d2c` 등, 데모 자체도 팔레트 토큰이 아닌 하드코딩 값)으로
    맞춤.
  - **주문카드 뒤집기 메커니즘 재구현** — 데모의 실제 JS(`renderCardView()` +
    `classList.toggle('flipped')`)를 보니, 두 면이 각각 다른 배경색인 3D 카드-뒤집기가
    아니라 **카드 하나**(배경 그라디언트는 항상 노랑→노랑딥 고정)에 대해 내용을
    버튼 클릭 즉시 스왑하면서 동시에 `rotate(180deg)`(2D, Z축)를 애니메이션시키는
    구조였음 — "탁자 위에서 휴대폰을 통째로 180도 돌려서 건너편 사람에게 보여주는"
    실제 제스처를 그대로 시뮬레이션한 것(180도 회전이라 내 쪽에선 뒤집혀 보이지만
    건너편 사람에겐 똑바로 보임). 기존의 앞/뒤 두 개 `Animated.View` + `rotateY` 3D
    플립 구조를 버리고 카드 하나 + `expo-linear-gradient`(신규 설치) + `rotate` +
    내용 즉시 스왑으로 재작성 — 데모와 동일하게 동작 확인(브라우저로 직접 뒤집어서
    180도 회전 + "TO. 사장님" 뒤집힌 모습까지 스크린샷 캡처).
  - **범위 제외 확인**: 말하기 탭/AI 챗봇 FAB·패널/실시간 카메라 뷰파인더는
    `docs/TASKS.md` 지시대로 만들지 않음(`ChatBotOverlay.tsx`는 이전부터 있던 것,
    이번 스코프에서 손 안 댐 — 여전히 구버전 마젠타/네이비 하드코딩 색).
  - `npx tsc --noEmit`, `expo export --platform web` 클린. `npx expo start --web`로
    직접 띄워서 스캔 화면/결과 목록(통화·언어 칩, 알레르기 그리드)/주문카드 뒤집기
    전부 스크린샷으로 데모와 대조 검증 완료.
  - **`expo export --platform android` 확인 중 발견(제 변경과 무관한 기존 이슈)**:
    Android 번들링이 `Unable to resolve module stream`으로 실패함 — `@vercel/blob/
    client`(`src/api/uploadApi.ts`가 씀, `d8b71ad Restore Vercel Blob menu uploads`
    커밋에서 추가됨, 이번 작업 이전부터 있던 코드)가 내부적으로 Node.js `stream`을
    import하는데 Android 번들 타깃엔 브라우저용 폴리필이 안 걸림(웹은 되는데
    android/native는 막힘). 이번 스코프(M3 폐기/샘플 매칭) 밖이라 손 안 댔습니다 —
    metro resolver에 폴리필 alias를 추가하거나, blob 업로드 경로를 웹 전용으로 두는
    등 결정이 필요해서 owner/frontend 판단이 필요합니다.

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
