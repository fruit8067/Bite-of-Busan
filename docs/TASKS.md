# Tasks (coordination without SendMessage)

Cross-session messaging (ListAgents/SendMessage) proved unreliable between the
4 windows in practice, so coordination runs through files instead: this file
lists the current assignment per role, `docs/STATUS.md` reports progress. No
one needs to poll — just check this file when starting work or when the owner
says "TASKS.md 확인해줘".

## Frontend
**Done:**
- 메뉴 스캔 화면 (`src/screens/MenuScanScreen.tsx`) — STATUS.md 참고.
- 주문 카드 화면 (`src/screens/OrderCardScreen.tsx`) — 항목 선택 + 수량 조절 +
  "덜 맵게" 옵션, 목업 데이터(`src/data/mockMenuItems.ts`) 사용, 탭하면 뒤집혀서
  큰 글씨 한국어 문장이 나오는 카드 UI.
- Navigation 도입 — **Expo Router**로 붙였습니다 (순수 react-navigation 수동
  설정이 아니라 그 위의 파일 기반 레이어; AGENTS.md 지시대로 SDK 57 공식 문서를
  확인해보니 v57 문서가 지금 이 방식을 표준으로 안내하고 있어서 이걸로
  선택했습니다). `App.tsx`/`index.ts` 제거, `app/_layout.tsx`(테마/Provider),
  `app/index.tsx`(스캔), `app/order-card.tsx`(주문카드)로 교체.
  `package.json` main → `expo-router/entry`, `app.json`에 scheme `busanbite`
  추가. 화면 전환은 `router.push("/order-card")` / `router.back()`.
- 알레르기 AI-추정 표시 + 확인 카드 — 메뉴 항목 알레르기 칩 아래 "AI-estimated
  — please confirm exact ingredients with staff" 캡션 추가, 주문 카드 화면에
  `src/components/AllergyQuestionCard.tsx`(큰 글씨 "땅콩 들어가나요?" +
  예/아니오 버튼, 답변은 로컬 state로만 표시되고 저장/전송 안 함) 추가.

- 백엔드가 `POST /menu/scan`을 이미 구현하고 `docs/API_CONTRACT.md`에 스펙을
  올려둔 걸 확인해서 (STATUS.md 참고 — OPENAI_API_KEY 문제로 실호출만 막혀
  있고 계약 자체는 완성) 대기하지 않고 바로 연동했습니다:
  - `src/api/menuApi.ts` — 실제 API 호출 + 응답을 내부 `MenuItem` 타입으로 매핑
  - `MenuScanScreen`에 가게 이름 입력 필드 추가(API가 필수로 받음), 사진을
    base64로 캡처, Analyze 버튼 로딩 상태, 서버 에러(400/423/502) 스낵바로 표시
  - 스캔 결과는 `ScanResultContext`로 주문 카드 화면에 전달, 스캔 없이 주문
    카드 화면으로 바로 진입하면(개발 중 새로고침 등) mock 데이터로 폴백

**업데이트**: OPENAI_API_KEY 문제 해결되고 실제 엔드투엔드 동작 검증 완료
(코디네이팅 세션이 웹 빌드로 직접 확인함 — 스캔/주문카드/뒤집기카드/알레르기
카드 전부 정상, `docs/STATUS.md` 참고).

**결정사항 (2026-09-18, owner)**: **웹도 추가 지원 대상**으로 확정 — APK
대체가 아니라 추가 채널. `react-native-web`/`react-dom` 이미 설치돼 있고
`npx expo start --web`로 잘 동작하는 것까지 확인됨 (코디네이팅 세션이 검증).
`docs/ARCHITECTURE.md`에 반영해뒀습니다.

**Now:** 특별히 새로 만들 건 없음 — 이미 되는 상태. 다만:
- 앞으로 화면 작업할 때 웹에서도 깨지지 않는지 가끔 확인해주세요 (`npm run web`)
- 아이콘이 웹에서 작은 네모 박스로 보이는 이슈 확인됨 (모바일/에뮬레이터는
  문제없을 가능성 높음, 아이콘 폰트가 웹에 안 실리는 문제로 추정) — 급하진
  않지만 여유 있을 때 봐주세요
- `expo-image-picker`가 웹에서는 카메라 대신 파일 선택창으로 폴백되는 게
  정상 동작입니다 (ARCHITECTURE.md에 이미 기록) — 버그 아님, 고치지 마세요

**완료 (반응형, owner 요구사항):** `src/components/ScreenContainer.tsx` 추가
— 콘텐츠를 `maxWidth: 600` + 가운데 정렬로 감싸는 공용 래퍼. 세 화면(스캔,
주문 카드 선택, 뒤집기 카드) 전부 이걸로 교체. 데스크톱 큰 화면에서 폼/카드가
가운데 600px 폭으로 모이고, 좁은 화면(폰)에서는 그대로 꽉 참(원래 고정폭이
`minWidth:24` 하나뿐이라 별다른 부작용 없음). `tsc`/`expo export`(web+android)
클린. 코디네이팅 세션이 코드 리뷰로 재검증 완료 (자동화 툴로 픽셀 확인은
안 됐지만 이 패턴 자체가 브라우저 표준 동작이라 문제없음) — 이 항목은 끝.

**Now (2026-09-18, owner 결정 — 팀원 라이브 데모 반영):** owner가 팀원이 만든
라이브 데모(`claude.ai/artifact/PrTZ9BbUidr8NrPZhZQTem`)를 공유했고, 이걸
"현재 디자인(M3) 기준으로" 재구현하기로 했습니다. 전체 범위(말하기/AI챗봇
포함)는 로드맵으로 천천히 — 지금은 "먹기" 탭 강화만. `docs/PRODUCT.md`의
"지금 증분" 섹션, `docs/ARCHITECTURE.md`의 "Brand palette" 섹션(정확한 M3
컬러 매핑 + 폰트) 먼저 읽어주세요.

1. **테마 리브랜딩 — 팔레트 변경됨 (2026-09-18, owner 재결정)**: 데모의
   금색/청록 팔레트는 **폐기**하고 부산시 공식 컬러로 교체해주세요 — 이미
   theme.ts에 금색/청록 버전을 구현하신 거 확인했는데, 그걸 부산블루로 다시
   교체하는 작업입니다. `docs/ARCHITECTURE.md`의 "Brand palette v2 (Busan city
   colors)" 섹션에 정확한 hex/M3 롤 매핑 다 적어뒀어요 (primary `#1AB3FF`,
   secondary `#4000FF`). "바탕색"이라는 이름 때문에 화면 전체를 시안색으로
   칠하면 안 된다는 주의사항도 문서에 적어뒀으니 꼭 읽어주세요.
   **폰트도 확정됐습니다** — owner가 부산시 공식 서체(부산체) 파일을 줘서
   `frontend/assets/fonts/BusanFont_Provisional.ttf`에 넣어뒀어요 (라이선스:
   부산시 보유, 별도 허가 없이 자유 사용 가능 — ARCHITECTURE.md에 기록).
   `app/_layout.tsx`의 `@expo-google-fonts/song-myung` 대신 로컬 폰트로
   교체해주세요:
   ```
   const [fontsLoaded] = useFonts({
     BusanFont_Provisional: require("../assets/fonts/BusanFont_Provisional.ttf"),
     NotoSansKR_400Regular,
     NotoSansKR_500Medium,
   });
   ```
   그리고 `theme.ts`의 `buildFontConfig()`에서 `"SongMyung_400Regular"`로 된
   부분을 전부 `"BusanFont_Provisional"`로 바꿔주세요. `@expo-google-fonts/
   song-myung` 의존성은 이제 안 쓰니 package.json에서 제거해도 됩니다(선택).
   굵기가 이 한 가지(Provisional)뿐이라 bold 변형이 없어요 — 강조는 크기/색으로.
2. **통화 변환**: 스캔 결과/주문 화면에 KRW/TWD/JPY/CNY/USD 칩 추가 —
   데모의 `RATES` 고정 환율표 방식 그대로(백엔드 API 불필요, 프론트에서 계산).
   `priceKrw` 필드는 백엔드가 곧 추가할 예정(아래 Backend 섹션) — 그 전까지는
   목업 데이터에 가격 필드 추가해서 먼저 작업해도 됩니다.
3. **알레르기 아이콘 그리드**: 기존 "AI-estimated" 캡션 방식을 데모처럼 8종
   아이콘(돼지고기/갑각류/밀/우유/땅콩/대두/계란/메밀) 그리드 + "자세히 보기"
   토글로 교체. "AI 추정" 문구는 유지(어디에 표시할지는 자유).
4. 먹는 법(howToEat)은 이미 있으니 그대로 사용.

우선순위: 1(리브랜딩) 먼저, 그다음 2·3은 순서 상관없음.

**완료 (2026-09-18):** 1·2·3 전부 끝냈습니다.
- **리브랜딩**: `src/theme.ts`가 부산블루 두 시드(`#1AB3FF`/`#4000FF`)를
  `@material/material-color-utilities`(구글 공식 HCT 알고리즘, Material Theme
  Builder가 쓰는 것과 같은 엔진)로 돌려서 primary/secondary + on-*/container를
  라이트·다크 각각 생성합니다 (표준 M3 톤 스탑: 라이트 40/90/10/100, 다크
  80/30/90/20) — 손으로 hex 안 골랐습니다. background/surface/outline/error는
  말씀하신 대로 손 안 대고 Paper 기본값 그대로 뒀습니다(밝은/어두운 중립톤 +
  표준 M3 red 유지, 화면 전체 시안색 아님). 폰트는 주신 스니펫 그대로
  `BusanFont_Provisional.ttf` 로컬 로드 + `theme.ts` 전체 치환 완료,
  `@expo-google-fonts/song-myung` 의존성 제거.
  - 부수 발견: `@expo-google-fonts/noto-sans-kr`를 패키지 루트에서 import하면
    안 쓰는 굵기까지 9개 폰트 파일(약 56MB)이 전부 번들에 딸려왔습니다 —
    `@expo-google-fonts/noto-sans-kr/400Regular` 식 개별 경로 import로 바꿔서
    실제 쓰는 2개 파일만 번들되는 것까지 `expo export`로 확인했습니다.
- **통화 변환**: `src/utils/currency.ts`에 데모 `RATES` 테이블 그대로(KRW 1 /
  TWD 44 / JPY 9.3 / CNY 192 / USD 1390, 소수점 자리수도 동일) 프론트 전용
  계산. 주문 카드 화면에 통화 칩 row 추가, 항목별 가격 실시간 변환 표시.
  `priceKrw`는 백엔드가 이미 실제로 내려주고 있어서(Backend Done 참고) 바로
  연결했습니다 — mock 데이터 임시 가격 없이 진행.
- **알레르기 아이콘 그리드**: `src/data/allergens.ts`(8종 이모지 아이콘 +
  백엔드 자유 텍스트 allergens와 매칭할 키워드 목록) + `src/components/
  AllergenGrid.tsx`(4열 그리드). 항목 카드에 "Allergy info (AI-estimated)
  ▾/▴" 토글 추가. 이모지 아이콘이라 예전에 보고드렸던 "웹에서 아이콘이 네모
  박스로 보이는" 문제도 이 부분에선 자연히 피해갑니다(폰트 로딩 필요 없음).
  카드 레이아웃도 데모처럼 한글 이름을 크게, 영어/중국어를 보조로 재배치.
- `tsc`/`expo export`(web+android) 전부 클린. docs/STATUS.md에 더 자세히
  적어뒀습니다.

**Now (2026-09-18, owner 결정 — "AI스러운 느낌" 절충안):** owner가 지금 스타일이
너무 "AI가 대충 만든 앱" 느낌이라고 해서, 전체를 커스텀으로 갈아엎진 않고
절충하기로 했습니다. `docs/ARCHITECTURE.md`의 "Hybrid component approach"
섹션에 정확한 범위 적어뒀어요 — 요약:

1. **커스텀 스타일로 교체할 것** (시각적 비중 제일 큰 것들): 주요 CTA 버튼
   (Take Photo/Gallery/Analyze Menu/Create Order Card/flip 버튼)과 카드류
   (주문카드, 스캔결과 항목 카드) — `react-native-paper`의 `Button`/`Card`
   대신 `View`/`Pressable` 기반 커스텀 컴포넌트로. 색상/타이포는 여전히
   `theme.ts`에서 가져와서 브랜드 일관성은 유지. 모양은 데모(pill 버튼,
   둥근/테두리 카드) 참고해서 비슷하게 — 픽셀 단위로 안 맞아도 됨.
2. **그대로 둘 것**: `TextInput`, `Snackbar`, `Chip`(알레르기/맵기 칩은 이미
   이모지라 그대로 둬도 괜찮음) — 시각적 비중 작아서 안 바꿔도 "AI스러운
   느낌"에 크게 안 미침.
3. **이번엔 범위 밖**: 데모의 인앱 카메라 뷰파인더(모서리 브라켓)는 실제
   기능(`expo-camera` 라이브 프리뷰) 추가라 스타일링이 아니에요 — 지금은
   시스템 카메라 앱 그대로 쓰는 구조 유지, 나중에 별도 작업으로.

**추가로 같이 고쳐주세요 — 아이콘 깨짐**: 콘솔에 계속 뜨던 "none of the
required icon libraries are installed" 경고 기억나실 텐데, owner가 실제로
화면에서 아이콘이 깨져 보인다고 확인했습니다. `@expo/vector-icons` 설치하면
해결됩니다 (Expo 프로젝트 표준 선택지, 네이티브 링킹 불필요, 웹에서도 동작).
Paper 아이콘 가이드(https://callstack.github.io/react-native-paper/docs/guides/icons)
참고해서 설정해주세요. 커스텀 버튼/카드로 교체하는 김에 아이콘 쓰는 곳도
같이 점검하면 좋을 것 같습니다.

**Now (2026-09-18, owner 지적 3건 — `docs/PRODUCT.md` "지금 증분" 참고):**

1. **UI 다국어 지원 (진짜로)** — 지금 화면(방금 만드신 커스텀 스캔 화면 포함)에
   한국어("부산한입", "먹기"/"말하기", "메뉴판 촬영", "촬영"/"갤러리", "분석
   중...", 안내문구 등)와 영어("Restaurant name", "Analyze")가 뒤섞여 있어요.
   외국인 타겟이라 이러면 안 됩니다.
   - 문자열을 전부 i18n 파일로 분리 (예: `src/i18n/en.ts`, `src/i18n/zh-TW.ts`)
     하고 컴포넌트는 키로 참조하도록 변경 (`t('scan.title')` 같은 방식, 라이브러리
     안 써도 되고 간단한 커스텀 훅/컨텍스트로 충분합니다).
   - **앱 첫 실행 시 언어 선택 화면** 추가 (온보딩) — 선택값은 로컬에 저장
     (`AsyncStorage`) 해서 다음 실행부터 안 물어봄. 나중에 설정에서 바꿀 수 있게
     하는 것도 고려해주세요 (이번에 필수는 아님).
   - v1 언어: 영어 + 번체 중국어 (기존 우선순위 그대로).
   - **예외**: 주문 카드 뒷면의 한국어 문장(사장님께 보여주는 그 문장)은 UI
     언어 설정과 무관하게 항상 한국어로 고정 — 여기는 절대 번역하면 안 됩니다.
2. **가게 이름 입력 필드 제거** — `docs/PRODUCT.md`/`docs/API_CONTRACT.md` 참고
   (백엔드가 API를 바꾸는 중, 아래 Backend 섹션). `MenuScanScreen`의
   "Restaurant name" `TextInput` 완전히 제거하고, 스캔 요청은 이미지만 보내면
   됩니다. 응답으로 오는 `restaurantName`(null일 수 있음)을 결과 화면에
   "OO식당 메뉴예요" / 이름을 못 읽었으면 그냥 안 보여주거나 "이 가게" 같은
   식으로 자연스럽게 표시해주세요. 백엔드 API 변경 전에 UI 정리부터 먼저
   진행하셔도 됩니다 (필드 제거는 백엔드 안 기다려도 됨).
3. **재촬영 기능** — 사진을 고른 뒤, 그 사진 위(또는 근처)에 명확한
   "✕ 다시 찍기" 같은 버튼을 추가해서 눌렀을 때 사진 상태를 지우고 다시
   촬영/갤러리 선택으로 돌아갈 수 있게 해주세요. 지금은 촬영/갤러리 버튼을
   또 눌러야만 바뀌는데, 명시적인 취소/재촬영 동작이 없어요.

**참고 (2026-09-18, 급하지 않음) — DB 완전 제거 결정**: `docs/ARCHITECTURE.md`
"No DB" 섹션 참고, 배포 비용 때문에 DB 없이 완전 무상태 백엔드로 갑니다.
프론트 영향은 작아요 — `src/api/menuApi.ts`의 응답 타입에서 `restaurantId:
number` 필드가 백엔드에서 없어질 예정이니(사용하는 곳 확인해보니 UI 로직엔
안 쓰이고 타입에만 있음), 백엔드가 API_CONTRACT.md 갱신하면 그때 같이
지워주세요. "로컬 메뉴 지도"(재스캔시 캐시) 관련 UI는 애초에 없었으니 추가로
뺄 것도 없습니다.

**Now (2026-09-18, owner 결정) — 색상 통일:** `MenuScanScreen.tsx`/
`OrderCardScreen.tsx`가 아직 예전 "데모 재현" 때 하드코딩한 마젠타/네이비
팔레트(`#EC008C` 등)를 쓰고 있는 거 owner한테 물어봤고, **부산블루로 통일하기로
결정**했습니다. `AppButton`/`AppCard`(이미 만드신 부산블루 테마 컴포넌트)로
두 화면 전부 교체해주세요 — `theme.ts` 토큰만 쓰고 하드코딩 hex 색은 전부
제거. `frontend/CLAUDE.md`의 "테마 토큰만 사용" 원칙 그대로 지켜주시면 됩니다.

**말하기(Speak) 기능은 이번엔 안 만듭니다** — owner가 스코프에서 완전히
빼기로 결정했습니다 (`docs/PRODUCT.md` 로드맵에 그대로 남겨두고, 나중에
다시 논의). `MenuScanScreen`에 있는 "말하기" 모드 스위치 버튼은 그대로 눌러도
아무 동작 안 하는 상태로 둬도 되고, 헷갈리면 이번 색상 정리하는 김에 숨겨두는
것도 좋습니다 (필수는 아님, 판단 맡길게요).

**Now (2026-09-19, owner 결정 — 최종, 이전 색상통일 지시 대체) — M3 완전
폐기, 샘플과 픽셀 단위로 동일하게:** owner가 명확히 결정했습니다 — Material
Design 3(부산블루 포함)는 완전히 버리고, `frontendSample/busanbite-demo.html`
(팀원 데모)이랑 **똑같이** 만들어주세요. 어제 만드신 `AppButton`/`AppCard`
(부산블루 M3 하이브리드)는 이제 목표 스타일이 아닙니다 — 데모 색상/모양으로
다시 스타일링하거나 새로 만들어주세요.

`docs/ARCHITECTURE.md`의 "Design system: none — pixel-match the sample front"
섹션에 데모의 정확한 색상 토큰(`#f4b41a` 금색, `#2f6f63` 청록, `#c1432e`
빨강, `#fbf6ec`/`#10161f` 배경 등), 폰트(Song Myung + Noto Sans KR — 부산체는
이번 지시로 되돌림, 아래 참고), 컴포넌트 방향(Paper Button/Card 대신
View/Pressable 기반, 데모 모양 그대로) 다 정리해뒀으니 그대로 따라주세요.

**중요 — 기능 범위는 데모 전체가 아니라 지금 앱까지만**: 데모는 먹기+말하기+
챗봇 다 있지만, owner 지시는 "디자인만 똑같이, 없던 기능은 만들지 마라"
입니다. 즉:
- 만들 것: 지금 있는 화면들(스캔, 결과 목록+통화칩+알레르기그리드, 주문카드
  뒤집기)의 **모양**을 데모와 동일하게
- 만들지 말 것: 말하기 탭, AI 챗봇 플로팅 버튼/패널 — 이미 스코프 제외
  결정돼 있음(위 참고). 데모의 카메라 뷰파인더 모서리 브라켓은 **정적
  스타일 요소로서만** 재현(지금 사진 미리보기 박스에 브라켓 장식 추가하는
  정도) — 실제 라이브 카메라 프리뷰(`expo-camera`)는 별개 기능이라 이번에
  안 만듭니다(지금처럼 시스템 카메라 앱 그대로 사용).

**폰트 확정**: Song Myung으로 갑니다 (owner 확인 완료, 2026-09-19). 부산체는
이번엔 안 씀 — `assets/fonts/BusanFont_Provisional.ttf` 파일 자체는 지워도
되고 남겨둬도 상관없습니다(안 쓸 뿐).

## Backend
**⚠ 아래 두 "Now" 블록(가격 필드, 가게이름 null 처리 중 DB 관련 부분)은
DB 완전 제거 결정(맨 아래 새 블록 참고)으로 일부 무의미해졌습니다 — MySQL/
Redis 관련 지시는 무시하고, 맨 아래 "Now (2026-09-18, DB 완전 제거)" 블록을
최신 지시로 따라주세요.**

**Done:** `POST /menu/scan` — lock/cache/OpenAI vision/MySQL upsert 전부 구현,
`docs/API_CONTRACT.md`에 실제 스펙 기록 완료. OPENAI_API_KEY 이슈(시스템
환경변수가 .env를 가리던 문제)도 해결, 실제 OpenAI 호출까지 엔드투엔드 검증
완료 (`docs/STATUS.md` 참고).

**Now (2026-09-18):** 웹 지원 건은 CORS 이미 열려있어서 추가 작업 없음.
새 작업 하나: **가격 필드 추가** (owner가 팀원 데모 반영 결정, `docs/PRODUCT.md`
"지금 증분" 참고) —
- `docs/DB_SCHEMA.md`에 db 에이전트가 `menu_items.price_krw` 컬럼을 새
  마이그레이션으로 추가할 예정(아래 DB 섹션) — 그거 기다렸다가:
- `src/services/menuScan.ts`의 OpenAI 프롬프트에 `priceKrw` (원화 가격,
  숫자만, 메뉴판에 안 보이면 null) 항목 추가해서 스캔 결과에 포함
- `src/services/menuRepo.ts` upsert에 `price_krw` 컬럼 반영
- `docs/API_CONTRACT.md`의 `priceKrw` TODO 표시 제거하고 실제 동작으로 갱신
- 통화 변환 자체는 프론트에서 처리하니 백엔드는 원화 가격만 정확히 반환하면 됨

**Now (2026-09-18, owner 지적) — 가게 이름은 AI가 판단 (사용자 입력 제거):**
`docs/PRODUCT.md` "지금 증분" #2 참고. 구체적으로:
- `POST /menu/scan` 요청 바디에서 `restaurantName` **제거** — 이제 이미지만
  받음 (`{ "imageBase64": string }`). 지금 있는 `400 restaurantName is
  required` 에러도 제거.
- `src/services/menuScan.ts`의 OpenAI 프롬프트에 항목 추출과 함께
  `restaurantName` 도 같이 뽑도록 추가 (사진에 간판/상호가 보이면 그 이름,
  안 보이면 `null`).
- `src/services/menuRepo.ts` — `restaurantName`이 null이면 `restaurants`
  테이블 매칭/재사용 로직을 스킵하고 (캐시 재사용 없이) 그냥 새로 스캔한
  것처럼 처리. null을 어떻게 저장할지(예: restaurant row 자체를 안 만들고
  menu_items만 독립적으로? 아니면 "Unknown-{timestamp}" 같은 placeholder
  이름으로 새 row?)는 스키마 변경이 필요할 수 있어서 db 에이전트와 상의해서
  정해주세요 — 정한 내용은 `docs/DB_SCHEMA.md`에 기록.
- 응답에 결정된 `restaurantName: string | null` 필드 추가 (프론트가 사용자한테
  "OO식당 메뉴예요" 식으로 보여주는 용도).
- `docs/API_CONTRACT.md` 갱신 필수.
- Redis 캐시/락 키(`cache:menu:{restaurantNameNormalized}`,
  `lock:scan:{restaurantNameNormalized}`)도 이름이 null일 때 어떻게 할지
  같이 정해주세요 (예: null이면 캐시/락 스킵).

**Now (2026-09-18, DB 완전 제거 — owner 결정, 최신 지시, 위 블록들보다 우선):**
`docs/ARCHITECTURE.md`의 "No DB" 섹션 참고. 배포 비용(Railway 최저 $5/월,
무료 MySQL/Redis 대안 신뢰성 낮음) 때문에 DB를 아예 안 쓰기로 했습니다.
- `src/routes/menu.ts`, `src/services/menuRepo.ts`에서 MySQL/Redis 관련 코드
  전부 제거 (`mysqlPool`, `redis` import, upsert, `cache:menu:*`/
  `lock:scan:*`/`ratelimit:scan:*` 전부). `POST /menu/scan`은 이제: 이미지
  받기 → OpenAI vision 호출(항목 + 가격 + `restaurantName` 추출, 위 블록들의
  프롬프트 내용은 여전히 유효) → 결과 그대로 반환. 그게 다입니다 — 캐시도,
  락도, 저장도 없음.
- `mysql2`/`ioredis` 의존성 제거 (package.json), `src/config/mysql.ts`,
  `src/config/redis.ts` 삭제.
- `GET /health`에서 Redis 체크 제거 — 그냥 `{ "status": "ok" }` 정도로 단순화.
- 응답에서 `restaurantId` 필드 제거 (DB PK였던 거라 이제 의미 없음).
  `restaurantName`은 그대로 유지 (AI가 사진에서 추출한 값, 저장은 안 하지만
  응답엔 포함 — 프론트가 화면에 표시하는 용도).
- `docs/API_CONTRACT.md` 전체 갱신 (요청/응답 스펙 다시 쓰기, MySQL/Redis
  behavior 설명 삭제).
- 로컬 docker(Redis/MySQL 컨테이너)는 이제 안 써도 됩니다 — 끄셔도 되고,
  당장 안 끄셔도 상관없어요 (그냥 안 쓰는 것뿐).

## DB
**Now (2026-09-18): 이 역할은 당분간 보류입니다.** owner가 배포 비용 때문에
DB를 완전히 빼기로 결정했어요 (`docs/ARCHITECTURE.md` "No DB" 섹션,
`docs/PRODUCT.md` "지금 증분" #4). 지금까지 만드신 스키마/마이그레이션/
docker-compose 작업은 git 히스토리에 남아있고 수고 많으셨습니다 — 나중에
트래픽/예산이 생겨서 DB를 다시 붙이게 되면 그때 이어서 쓸 수 있을 거예요.

지금 당장은 새로 드릴 작업이 없어요. 대기해주시고, 혹시 여유 있으시면
`docs/DB_SCHEMA.md`(이미 "ON HOLD" 표시해뒀음)가 나중에 참고하기 좋게
정리가 더 필요한지 정도만 봐주시면 됩니다 — 필수는 아닙니다.

~~아래는 DB 제거 전 마지막 작업 지시 (참고용, 더 이상 진행 안 함)~~
**~~Now (2026-09-18):~~** 새 작업 — **`menu_items`에 `price_krw` 컬럼 추가**
(owner가 팀원 데모 반영 결정, `docs/PRODUCT.md`/`docs/DB_SCHEMA.md` 참고).
`db/migrations/001_init.sql`을 직접 고치지 말고 `002_add_price.sql` 같은 새
마이그레이션 파일로 추가해주세요 (컬럼: `price_krw INT UNSIGNED NULL`).
적용 방법은 기존 `db/README.md` 패턴 그대로 (`docker compose exec -T mysql
mysql ... < migrations/002_add_price.sql`). 끝나면 `docs/DB_SCHEMA.md`의
"⚠ NOT YET IN migration" 경고 문구 제거하고 실제 적용 확인 문구로 바꿔주세요.
이거 끝나야 backend가 가격 필드를 쓸 수 있어요 — 급합니다.
