# TODO

소유자(사람)가 직접 처리해야 하는 것들 위주. 에이전트가 대신 할 수 없는 항목만
여기 둔다 — 코드 작업 자체는 `docs/STATUS.md`에서 추적.

## 지금 막혀있는 것 (해야 시작 가능)
- [x] OpenAI API 키 `backend/.env`에 설정 완료

## 출시 전에 필요한 것 (지금 당장은 아님)
- [ ] **Android APK 빌드 → GitHub Release 업로드** (2026-09-18, owner 요청)
  — 로컬 Gradle 빌드 선호 (Android SDK 이미 설치 중, Expo 계정 불필요).
  빌드되면 `gh release create`로 `fruit8067/Bite-of-Busan` 저장소에 `.apk`
  첨부해서 올릴 것. **주의**: GitHub Release 생성은 공개적으로 보이는
  작업이라 매번 실행 전 owner 확인 필요.
- [x] ~~MySQL 운영 환경~~ — DB 자체를 완전히 뺐음 (2026-09-18, 배포 비용 이유,
  `docs/ARCHITECTURE.md` "No DB" 참고). 더 이상 해당 없음.
- [x] ~~가게(restaurant) 식별 방식 확정~~ — 사용자 입력 대신 AI가 사진에서
  추론하는 방식으로 확정, 이미 구현 완료 (`docs/PRODUCT.md` "지금 증분").
- [ ] OCR 정확도 실측 — GPT vision 한 번 호출로 시작 (`docs/ARCHITECTURE.md`).
  실제 메뉴판으로 테스트해보고 부정확하면 전용 OCR(네이버 클로바 OCR 등) 도입
  검토.
- [ ] Vercel 배포 — 백엔드 완전 무상태 전환 후 무료 배포 가능해짐, 코드 준비는
  backend에게 배정함(`docs/TASKS.md`), 실제 `vercel login`/배포는 owner 본인
  계정으로 직접 진행 필요.

## 로드맵 (v1 이후, docs/PRODUCT.md 참고)
- [ ] 읽기 — 안내문/키오스크/정류장 사진 설명 기능
- [ ] 말하기 — 상황별 한국어 카드 (택시, 결제 등)
- [ ] 사장님 모드 — 메뉴판 사진 1장으로 4개 국어 메뉴 + QR 자동 생성
- [ ] 분석 대시보드 — 상인용 / 부산시용
- [ ] 언어 확장 — 간체 중국어, 일본어 (v1은 영어 + 번체 중국어만)
- [ ] 로그인/회원가입 (v1은 비회원)
