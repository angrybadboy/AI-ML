# DEMO.md — 글결 시연 스크립트

> 3~5분 안에 인증·AI·커뮤니티·결제 4축을 모두 보여주는 흐름.
> 시연 전 [supabase/seeds/demo-posts.sql](supabase/seeds/demo-posts.sql) 적용해서 발견 피드를 6편으로 채워두면 풍성합니다.

---

## 0. 시연 전 준비 체크 (5분)

- [ ] Supabase 두 계정 가입 완료 (예: 본인 + 본인+test1)
- [ ] [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) 적용
- [ ] [supabase/migrations/0002_fallback_quotes.sql](supabase/migrations/0002_fallback_quotes.sql) 적용 (폴백 풀 20편)
- [ ] [supabase/seeds/demo-posts.sql](supabase/seeds/demo-posts.sql) 적용 (시연용 글 6편)
- [ ] `.env.local` 7개 키 모두 채워짐 (`grep -c "^[A-Z_]*=." .env.local` → 7)
- [ ] 본인 계정 (시연 메인)은 `subscription_status='free'` 로 리셋 (이미 결제했다면 SQL Editor에서 되돌리기):
   ```sql
   update public.profiles set subscription_status='free', subscription_expires_at=null where id = (select id from auth.users where email='gs4oct@gmail.com');
   delete from public.payment_logs where user_id = (select id from auth.users where email='gs4oct@gmail.com');
   ```
- [ ] 오늘 날짜의 daily_quote 가 이미 있으면 흐름 빠름. 없으면 첫 진입 시 Claude API 호출로 약 5초 멈춤 — 시연 전에 한 번 미리 /today 들어가서 워밍업 권장.
- [ ] 다크모드 한 번 켰다가 끄기 (각 화면 색 트랜지션 워밍업)

---

## 1. 시연 흐름 (3~5분)

### 0:00 — 비로그인 랜딩 ① 첫 화면이 곧 글

> "글결의 첫 메시지는 텍스트가 아니라, 글 그 자체입니다."

- 시크릿창으로 [http://localhost:3000](http://localhost:3000) (또는 Vercel 도메인) 접속
- 헤어라인 헤더 한 줄. **CTA·헤드라인·마케팅 카피 없음.**
- 곧바로 오늘의 글 본문이 펼쳐짐. 페이드인 0.8s.
- 천천히 스크롤 — 각 문단이 viewport 안으로 들어올 때 차례로 페이드인 (`whileInView`).
- · · · 마침표 3개로 호흡 끊김.

### 0:30 — ② 갈림길

> "글이 끝난 자리에서, 두 페르소나가 등장합니다."

- 큰 카피: "오늘 당신은 *읽는 사람*인가요, 아니면 *쓰는 사람*인가요."
- 좌(지연 / 읽는 사람) — 우(민호 / 쓰는 사람) 분할
- 두 카드의 톤이 미세하게 다름 (오른쪽 surface = `--bg-2`)

### 0:50 — ③ 발견 피드 미리보기

- "누군가의 한 문장은, 또 다른 누군가의 새벽이 됩니다."
- 3-card 미리보기. 우상단 **로그인** 클릭.

### 1:00 — 로그인

- `/login` — 좌측 인용 패널 (No.047 「안개가 지나간 자리」 中) + 우측 폼
- 본인 이메일·비밀번호 → "글결로 들어가기"
- 또는 **Google 계정으로 계속하기** (4단계에서 등록한 test user)

### 1:20 — Today (오늘의 글)

> "Today 화면 — PRD §3.1의 정서가 응축된 곳."

- 메타 row: `No. 001` · `― 고요 ―` · `2026 · 04 · 28`
- 제목 Serif 56 → byline Sans 13 → hairline → 본문 Serif 21/1.95
- 첫 단락 들여쓰기 0, 둘째부터 2em (시집 어휘)
- 3등분 액션 row — 간직 / 감상 / 보내기

**간직하기 클릭** → bookmark 아이콘이 outline → fill 로 0.8초 잉크 번지듯 페이드.
"간직되었어요" 인라인 메시지 (Mono 11, 헤어라인 위. **토스트 X**).

### 2:00 — Write (쓰기)

- 상단 **쓰기** → `/write`
- 제목 / 카테고리 / 본문 카운터 — 길어지면 색이 var(--accent)로
- 비공개 / 발견에 공개 토글 → 발행하기

### 2:30 — Feed (발견 피드)

- 상단 **발견** → `/feed`
- "조용히 누군가가 / 남겨둔 문장들."
- 카테고리 칩 클릭 → URL `?cat=고요` 로 변경 + 필터링
- 호버 시 transform 변경 없이 배경만 부드럽게 (`--bg-2` 0.15s)

### 3:00 — Profile (마이)

- 상단 **마이** → `/me`
- 좌측 큰 아바타 + SINCE 날짜
- 우측 4-stat: **간직한 글 / 쓴 글결 / 연속 읽기 / 멤버십**
- 3-tab — 클릭하면 URL 변경, 콘텐츠 전환

### 3:30 — Premium 결제 (샌드박스)

- 우상단 / 또는 직접 `/premium`
- "결을 더 깊이 / 새기고 싶다면." Serif 56
- 가격 ₩4,900 — Serif 88, 큰 숫자
- "조용히 구독 시작하기" 클릭 → Toss 호스팅 결제창
- 테스트 카드 입력 (README 참고):
  - `4111 1111 1111 1111` / `12/30` / `123` / `00`
- 결제 완료 → `/payment/success`
- "환영합니다, 더 깊은 결로 / 프리미엄이 시작되었어요." (다음 결까지 30일)
- `/me` 다시 → 멤버십 stat 이 **무료 → 프리미엄** 으로 변경
- `/premium` 재방문 → "이미 함께 하고 계세요" — 중복 결제 차단

### 4:30 — 다크모드 + 마무리

- 우상단 달 아이콘 → 0.4s 페이드로 다크 톤 전환
- Today 페이지의 `· · ·` 와 별 배경 (`GGStars`) 이 다크에서 더 드러남
- 라이트로 다시 → 시연 종료

---

## 2. 강조 포인트 (발표 시)

### 학술 4축 증빙

- **인증**: Supabase Auth + Google OAuth + 이중 방어 (proxy + (app)/layout 모두에서 세션 검증)
- **결제**: Toss Sandbox + amount 변조 거절 + payment_logs 마스킹 raw_response
- **AI**: Claude `claude-sonnet-4-6` + 시스템 프롬프트 톤 고정 + JSON 강제 + 1회 재시도 → 폴백 풀
- **커뮤니티**: user_posts + 발견 피드 + 본인 글만 수정·삭제 (RLS + 코드 레벨 이중)

### 보안

- **RLS 침투 테스트** (TRD R-03) — `supabase/rls-smoke-test.sql` 4 PASS
- **클라이언트 번들에 `SERVICE_ROLE` 문자열 미포함** — `grep -l "SERVICE_ROLE" .next/static/chunks/*.js` 0 매치
- **amount 재검증**: 클라가 amount=1로 변조 시 → `payment_logs.status='failed'` + 화면에 헤어라인 + Mono 11px 메시지 (빨간 박스 X)

### 디자인 정합성

- 토스트 0개 / 이모지 0개 / `transform` 호버 변경 0개 / 빨간 에러 박스 0개
- 본문 Serif 21px / line-height 1.95 (PRD §5.1 정서의 핵심)
- 페이지 전환 0.8s ease-out / 호버 0.15s 색만 / 테마 0.4s

---

## 3. 시연 영상 녹화 시 권장

- 1440 × 900 풀스크린, 시크릿창 (북마크 바 숨김)
- macOS QuickTime → File → New Screen Recording → 영역 지정
- 마우스 클릭 강조 활성화
- 발표용 자막은 후처리 (CapCut 등). 영상 안엔 텍스트 오버레이 없음 — "조용한 방" 톤
- 길이: 3:30 ~ 4:30 권장

좋은 결로 흘러가시길. 🌫️
