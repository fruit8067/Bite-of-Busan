# TODO

소유자(사람)가 직접 처리해야 하는 것들 위주. 에이전트가 대신 할 수 없는 항목만
여기 둔다 — 코드 작업 자체는 `docs/STATUS.md`에서 추적.

## 지금 막혀있는 것 (해야 시작 가능)
- [x] OpenAI API 키 `backend/.env`에 설정 완료

## 출시 전에 필요한 것 (지금 당장은 아님)
- [ ] Android APK 서명/빌드 설정 (`eas build -p android` 또는 로컬 Gradle) —
  Expo 계정 필요
- [ ] MySQL 운영 환경 — 지금 `db/docker-compose.yml`의 `MYSQL_ROOT_PASSWORD:
  changeme`는 로컬 개발용. 배포 전 반드시 교체.
- [ ] 가게(restaurant) 식별 방식 확정 — v1은 사용자가 가게 이름을 직접 입력하는
  것으로 임시 제안해뒀음 (`docs/DB_SCHEMA.md`). GPS 기반 매칭 등으로 바꿀지
  backend/db 에이전트가 실제 작업하면서 정할 것.
- [ ] OCR 정확도 실측 — GPT vision 한 번 호출로 시작 (`docs/ARCHITECTURE.md`).
  실제 메뉴판으로 테스트해보고 부정확하면 전용 OCR(네이버 클로바 OCR 등) 도입
  검토.

## 로드맵 (v1 이후, docs/PRODUCT.md 참고)
- [ ] 읽기 — 안내문/키오스크/정류장 사진 설명 기능
- [ ] 말하기 — 상황별 한국어 카드 (택시, 결제 등)
- [ ] 사장님 모드 — 메뉴판 사진 1장으로 4개 국어 메뉴 + QR 자동 생성
- [ ] 분석 대시보드 — 상인용 / 부산시용
- [ ] 언어 확장 — 간체 중국어, 일본어 (v1은 영어 + 번체 중국어만)
- [ ] 로그인/회원가입 (v1은 비회원)
