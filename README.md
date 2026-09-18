# 부산한입 (BusanBite)

서비스 링크 : [부산 한 입](https://bite-of-busan-web.vercel.app/)

외국인 관광객이 한글 메뉴판을 찍으면 AI가 항목별로 설명(번역/맵기/알레르기/먹는 법/가격)해주고, 원하는 메뉴를 골라 **한국어 주문 카드**를 만들어 화면을 뒤집어 점원에게 보여줄 수 있는 여행 도우미 앱입니다.

번역만 해주는 게 아니라 "이해하기 + (한국어로) 전달하기"를 한 흐름으로 이어주는 것이 핵심입니다.

## 주요 기능 (현재 범위)

- 📷 **메뉴판 촬영** — 카메라 또는 갤러리에서 사진 선택
- 🤖 **AI 분석** — OpenAI 비전 모델이 사진 한 장으로 메뉴 항목별 이름/번역/설명/맵기/알레르기/먹는 법/가격/가게 이름까지 한 번에 추출
- 🌐 **다국어 지원** — 영어 / 繁體中文 / 日本語 / Español, 앱 UI 자체도 선택한 언어로 표시
- 💱 **통화 변환** — 원화 가격을 여행자의 통화(TWD/JPY/CNY/USD)로 즉시 환산
- ⚠️ **알레르기 정보** — AI 추정 알레르기 성분을 아이콘 그리드로 표시(참고용, 최종 확인은 점원에게)
- 🧾 **주문 카드 뒤집기** — 고른 메뉴로 카드를 만들고, 버튼을 누르면 카드가 180도 회전 — 손님 쪽에선 자신의 언어로, 점원 쪽으로 돌리면 한국어로 정확히 보이도록 되어 있습니다 (탁자 위에서 휴대폰을 통째로 돌려 보여주는 실제 동작을 그대로 시뮬레이션)

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프론트엔드 | React Native (Expo, managed) + TypeScript — Android APK와 웹을 하나의 코드로 |
| 백엔드 | Node.js + Express + TypeScript, **완전 무상태**(별도 DB 없음) |
| AI | OpenAI 비전 모델 — 메뉴 사진 한 장을 구조화된 항목 목록으로 변환 |
| 이미지 저장 | Vercel Blob (스캔 요청 시 업로드, 처리 후 삭제) |
| 디자인 | 커스텀 디자인 시스템 — `frontendSample/busanbite-demo.html` 샘플과 픽셀 단위로 맞춤 (Material Design 3 미사용) |

자세한 결정 배경과 이유는 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)에 정리되어 있습니다.

## 폴더 구조

```
frontend/   Expo 앱 (Android APK + 웹)
backend/    Express API 서버 (POST /menu/scan)
db/         현재 미사용 — 무상태 아키텍처 결정 이전에 만든 스키마/마이그레이션 (보류)
docs/       제품 기획, 아키텍처 결정, API 계약, 진행 상황 등 프로젝트 문서
frontendSample/  디자인 기준이 되는 정적 HTML 데모
```

## 시작하기

### 사전 준비
- Node.js 18+
- OpenAI API 키

### 백엔드
```bash
cd backend
npm install
cp .env.example .env   # OPENAI_API_KEY 채워넣기
npm run dev             # http://localhost:4000
```

### 프론트엔드
```bash
cd frontend
npm install
npm run web              # 브라우저에서 바로 확인 (개발용)
# 또는
npm start                 # Expo Go로 실제 기기에서 확인
```

기기(Expo Go)에서 테스트할 경우 `frontend/src/api/config.ts`의 API 주소를 `localhost` 대신 개발 PC의 LAN IP로 바꿔야 합니다.

## 더 알아보기

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — 제품 기획, 타겟 사용자, 전체 기능 로드맵
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — 기술 스택/디자인 결정과 그 배경
- [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) — 백엔드 API 스펙
- [`docs/STATUS.md`](docs/STATUS.md) — 현재까지 진행 상황
- [`TODO.md`](TODO.md) — 사람이 직접 처리해야 할 항목(배포, API 키 등)

## 상태

MVP(메뉴 스캔 → 결과 → 주문 카드) 단계이며, 사장님 모드·읽기/말하기 탭·AI 챗봇 등은 로드맵 상의 다음 단계입니다.
