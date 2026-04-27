# Phase Prompts — 글결 프로젝트 (v2)

> 각 Phase 시작 시, 또는 특수 상황에서 Claude Code에 복붙할 프롬프트 모음.
> `CLAUDE.md` v2가 이미 로드되어 있다는 전제. 디자인 핸드오프(`design_handoff_geulgyeol/`) 통합.

---

## 사용 방법

1. 새 Claude Code 세션 시작 → `CLAUDE.md` 자동 로드
2. 첫 메시지로 `0. 세션 시작 점검` 프롬프트
3. 현재 Phase에 해당하는 프롬프트(`1.x`) 복붙
4. 특수 상황은 `2.x` 보조 프롬프트
5. 화면 단위 작업은 `3.x` 화면별 프롬프트

---

## 0. 세션 시작 점검

```
세션을 시작합니다. 다음을 순서대로 수행해 주세요:

1. CLAUDE.md, PRD.md, TRD.md, design_handoff_geulgyeol/README.md 읽음 확인
2. `git log --oneline -10`으로 최근 커밋 확인
3. `git status`로 작업 중인 변경사항 확인
4. .env.local의 환경변수 키 이름이 TRD §9.2와 일치하는지 확인 (값은 보지 않음)
5. 현재 어느 Phase에 있는지 판단해서 보고

위 5가지 확인 후 다음 형식으로 보고해 주세요:

  현재 Phase: [N]
  마지막 작업: [요약]
  미완료 Exit Criteria: [있다면 목록]
  다음 작업 제안: [무엇을]
  진행해도 될지 확인 요청

확인 전까지 코드 변경은 하지 말아 주세요.
```

---

## 1. Phase별 시작 프롬프트

### 1.1 Phase 1 — Foundation + 디자인 시스템 + 인증

```
Phase 1 (Foundation + 디자인 시스템 + 인증)을 시작합니다.

참조 문서:
  - PRD §4 F-01, F-02
  - TRD §1, §2, §3 (스키마 + §1.4 추가 컬럼), §3.3 (RLS), §5 (Auth), §10.3
  - design_handoff_geulgyeol/README.md §3 (디자인 토큰), §4 (공통 컴포넌트), §9 (작업 순서)
  - design_handoff_geulgyeol/styles/theme.css
  - design_handoff_geulgyeol/scripts/v2/shared.jsx (GGMark, GGIcon, GGNav, GGStars)
  - design_handoff_geulgyeol/scripts/v2/core-screens.jsx UScreenLogin

이번 Phase의 작업 범위 (CLAUDE.md §6 Phase 1 참고):
  1) Next.js 15 프로젝트 셋업 (TypeScript, Tailwind v4, App Router, ESLint)
  2) CLAUDE.md §5 폴더 구조 생성
  3) design_handoff_geulgyeol/ 폴더를 프로젝트 루트에 복사 (참조용으로 보관)
  4) styles/theme.css 이식 + app/layout.tsx에 <html data-theme="light"> 적용
  5) 공통 컴포넌트 4개 (GGMark, GGIcon, GGNav, GGStars) Next.js + TS로 재구현
  6) Supabase 프로젝트 + 환경변수
  7) DB 마이그레이션 (TRD §3.1 + §1.4 추가 컬럼: serial_no, category)
  8) RLS 정책
  9) lib/supabase/{server,client}.ts
  10) Supabase Auth (이메일 + Google OAuth)
  11) middleware.ts
  12) Login/Signup 화면 구현 (UScreenLogin 디자인 그대로)
  13) types/db.ts 자동 생성
  14) 테마 토글 (localStorage 동기화)

진행 방식:
  - 항목 1~5는 디자인 시스템 트랙
  - 항목 6~13은 백엔드/인증 트랙
  - 두 트랙을 작은 단위로 묶어서 진행. 한 번에 다 하지 말 것
  - 사용자가 직접 해야 하는 일(Supabase 프로젝트 생성, OAuth 설정 등)은 별도 가이드

주의:
  - 핸드오프 jsx는 vanilla React + 인라인 스타일. 우리는 Next.js + Tailwind/CSS modules로 재구현.
  - 단, 픽셀 값(fontSize, lineHeight, padding 등)은 그대로 유지.
  - 색상은 var(--ink-deep) 같은 CSS 변수만 사용. 하드코드 #hex 금지.

먼저 항목 1)부터 시작합시다. Next.js 프로젝트를 어떤 명령으로 셋업하고 어떤 옵션을 선택할지 제안해 주세요.
이때 Tailwind v4 (alpha/beta가 아닌 안정 버전 확인 후) 사용을 명시해 주세요.
```

### 1.2 Phase 2 — Today (★) + Hybrid 랜딩 + 저장

```
Phase 2 (Today + Hybrid 랜딩 + 저장)을 시작합니다.

전제 조건 확인:
  - Phase 1 Exit Criteria 모두 통과 여부 보고
  - 특히 RLS 침투 테스트 + 디자인 토큰 라이트/다크 토글 작동 확인

참조 문서:
  - PRD §4 F-03 (오늘의 글귀), F-04 (북마크), §3.1 (사용자 여정)
  - TRD §4.2~§4.3 (/api/quote/today), §7 (AI 연동), §7.4 (폴백)
  - design_handoff_geulgyeol/README.md §4.4 (Today 핵심 화면)
  - design_handoff_geulgyeol/scripts/v2/core-screens.jsx UScreenToday
  - design_handoff_geulgyeol/scripts/v2/landing-hybrid.jsx LandingHybrid

이번 Phase의 작업 범위 (CLAUDE.md §6 Phase 2 참고):

[백엔드 트랙]
  1) lib/anthropic.ts (서버 전용)
  2) lib/prompts/quote.ts (TRD §7.2)
  3) ★ 폴백 글귀 풀 20개 시드 데이터 — Phase 2의 가장 첫 작업
  4) /api/quote/today (JSON 파싱 실패 시 재시도 1회 → 폴백)
  5) /api/saved (POST 토글, GET 목록)

[프론트엔드 트랙 — 디자인 핸드오프 §9의 권고대로 Today를 가장 먼저]
  6) components/quote/QuoteView.tsx (UScreenToday 디자인 그대로)
  7) components/quote/SaveButton.tsx (잉크 번짐 페이드 0.8s, 토스트 없음)
  8) app/(app)/today/page.tsx + app/(app)/g/[no]/page.tsx
  9) app/(app)/page.tsx — Hybrid 랜딩 (LandingHybrid 디자인 그대로, 3단 호흡)

★ 절대 규칙:
  - 폴백 메커니즘은 "선택" 아닌 "필수" (TRD §7.4)
  - JSON 파싱 = try-catch + 재시도 1회 + 폴백 순서
  - Claude API 응답을 신뢰하지 말고 Zod로 검증
  - Today 본문 첫 단락은 text-indent: 0, 2번째부터 text-indent: 2em
  - 저장 시 토스트 절대 금지. 라벨이 "간직됨"으로 변하는 것만
  - 이모지·snappy 모션·border-radius·shadow 사용 금지

진행 순서 제안:
  먼저 [백엔드 트랙] 1~3 (특히 폴백 풀 시드 데이터부터),
  그 다음 [프론트엔드 트랙] Today 화면 (6~8),
  그 다음 백엔드 4~5,
  마지막으로 Hybrid 랜딩 (9).

먼저 폴백 글귀 풀 20개를 만들어야 합니다. PRD §5의 톤(고요·위로·사랑·용기·그리움·사색)에 맞는 한국어 글귀를,
디자인 핸드오프 shared.jsx의 GG_SAMPLE 형식(no, date, category, title, byline, body[], tags)으로 어떻게 작성할지 제안해 주세요.
외부 인용 금지 — 직접 작성 (PRD §8.1).
```

### 1.3 Phase 3 — Editor + 발견 피드 + 마이페이지

```
Phase 3 (Editor + Feed + Profile)을 시작합니다.

전제 조건 확인:
  - Phase 2 Exit Criteria 통과 여부 보고
  - 특히 폴백 메커니즘 검증 + Today 화면 픽셀 일치 확인

참조 문서:
  - PRD §4 F-06, F-07, F-08, §3.2 (글 공유 시나리오)
  - TRD §3.1 user_posts 스키마, §4.2 /api/posts
  - design_handoff_geulgyeol/scripts/v2/core-screens.jsx UScreenEditor, UScreenFeed, UScreenProfile

이번 Phase의 작업 범위 (CLAUDE.md §6 Phase 3 참고):

[백엔드 트랙]
  1) lib/schemas/post.ts (Zod 스키마 — 제목 ≤40, 본문 ≤600)
  2) /api/posts (POST 작성, GET ?scope=feed|me)
  3) /api/posts/[id] (PATCH, DELETE — 본인만)

[프론트엔드 트랙]
  4) components/editor/PostEditor.tsx (UScreenEditor 디자인 그대로)
     - 메타 row + 제목 input (Serif 46px) + 카테고리 칩 + textarea (Serif 21/1.95)
     - 카운터 "본문 · 187 / 600자" + 비공개/공개 토글 + 발행 버튼
  5) app/(app)/write/page.tsx
  6) components/feed/FeedCard.tsx (UScreenFeed 카드 디자인)
  7) app/(app)/feed/page.tsx (5:7 그리드 + 카테고리 필터 + 2-col)
  8) app/(app)/me/page.tsx (UScreenProfile 4-stat + 3-tab)

★ 절대 규칙:
  - 길이 제한 = DB 제약 + Zod + UI 3중
  - 비공개 글은 RLS로 본인만 조회
  - 외부 글귀 인용 금지
  - 카운터 제한 도달 시 var(--accent)로 색만 변경 (border 변경 금지)
  - 에러는 헤어라인 1px + Mono 11px (빨간 박스 금지)
  - Feed 카드 호버 = 배경만 var(--bg-2)로 0.15s 페이드 (transform 금지)

먼저 user_posts 테이블에 §1.4에서 결정한 serial_no, category 컬럼이 있는지 확인하고,
Zod 스키마를 TRD §3.1 user_posts 스키마와 정확히 일치하게 작성합시다.
```

### 1.4 Phase 4 — Payment Sandbox

```
Phase 4 (Payment Sandbox)를 시작합니다.

전제 조건 확인:
  - Phase 3 Exit Criteria 통과 여부 보고

참조 문서:
  - PRD §4 F-09, F-10
  - TRD §6 전체 (§6.2 결제 시퀀스, §6.4 amount 재검증 ★)
  - design_handoff_geulgyeol에는 결제 화면이 없음 — Today/Feed 톤을 그대로 따라 구성

이번 Phase의 작업 범위:

[백엔드]
  1) lib/toss.ts (서버 전용)
  2) /api/payment/ready (order_id 발급, payment_logs status='ready')
  3) /api/payment/confirm (★ amount 서버 재검증 → Toss confirm)
  4) /api/payment/status (구독 상태 조회)

[프론트엔드]
  5) components/payment/CheckoutButton.tsx (Toss SDK)
  6) app/(app)/premium/page.tsx
     - 디자인 핸드오프에 화면이 없음 → Today/Feed 톤으로 구성
     - 헤더 + 헤어라인 → 가격 표시 (Serif 60px+, Mono 통화 단위) → 결제 버튼 (var(--btn-bg))
     - 토스트 / 팝업 / 모달 절대 금지
  7) 결제 성공/실패/취소 페이지 (한 화면 한 메시지, 인라인 메시지 톤)
  8) 무료 한도 소진 시 결제 유도 (PRD F-10) — 모달 아닌 페이지 인라인
  9) profiles.subscription_status / subscription_expires_at 갱신 로직

★ 절대 규칙:
  - confirm에서 클라이언트 amount 신뢰 금지
  - payment_logs에서 order_id로 원본 amount 재조회 후 비교
  - 일치하지 않으면 즉시 거절 + 로그
  - TOSS_SECRET_KEY 절대 클라이언트 번들 포함 금지
  - 모든 결제 이력 (성공·실패·취소) payment_logs 기록
  - "결제 완료!" 같은 alert / toast 절대 금지 — 페이지 전환으로만 표현

작업 시작 전:
  Toss Payments Sandbox 공식 문서 URL과 사용할 SDK 버전을 먼저 보고해 주세요.
  스펙 변경이 있을 수 있으니 (TRD R-02), 시작 시점 기준 스펙을 명확히 한 후 진행합시다.
```

### 1.5 Phase 5 — Polish (모션 + 반응형 + 시연)

```
Phase 5 (Polish)을 시작합니다.

전제 조건 확인:
  - Phase 4까지 모든 P0 기능이 동작 가능한 상태여야 함
  - 미완성된 P0 항목이 있다면 먼저 보고

참조 문서:
  - PRD §5 감성 UI 원칙
  - design_handoff_geulgyeol/README.md §5.2 (인터랙션), §7 (모바일 대응)
  - PRD §7 Phase 5 Exit Criteria
  - TRD §12 문서화 산출물

★ v2 변경: 디자인 자체는 각 Phase에서 이미 마감되었음. 이 Phase는 모션·반응형·시연.

이번 Phase는 4개 트랙을 병렬 진행:

[트랙 A] 모션 디테일
  - Today 화면 페이드인 0.8s ease-out (전체 main 영역)
  - 스크롤 시 문단 단위 등장 (Framer Motion whileInView, threshold 0.3)
  - 저장 시 잉크 번짐 페이드 (Phase 2의 1차 구현을 더 정교하게)
  - 테마 전환 0.4s 색 트랜지션 (모든 var() 사용처에 transition: color 0.4s, background-color 0.4s)
  - 호버는 컬러만 0.15s, transform 변경 절대 금지

[트랙 B] 반응형 (디자인 핸드오프 §7)
  - Today: 모바일 좌우 패딩 24px, 본문 18px / 1.85
  - Feed: 2-col → 1-col (모바일)
  - Hybrid 랜딩 갈림길: 좌우 50:50 → 세로 스택 (모바일), 사이 hairline 추가
  - GGNav: 데스크톱 상단 → 모바일 하단 탭바 (5개 아이콘)
  - 브레이크포인트: 360px / 768px / 1440px

[트랙 C] 시연 준비
  - 시드 데이터 (시연용 사용자 2~3명, 글 10편) — PRD Q-05
  - 다크모드 점검 (모든 화면에서 data-theme="dark" 정상 표시 — GGStars 표시 포함)
  - 시연 시나리오 (PRD §3.1) 끊김 없이 통과
  - 시연용 결제 카드 번호 README 명시

[트랙 D] 문서화
  - README.md (실행법, 환경변수, 테스트 카드, 아키텍처 요약)
  - 시연 영상 시나리오 3~5분 (가입 → 오늘의 글 → 저장 → 작성 → 결제)

진행 순서 제안:
  먼저 [트랙 C] 시연 경로를 1회 통과시키며 발견 버그를 먼저 수정,
  그 다음 [트랙 A] 모션 → [트랙 B] 반응형 → [트랙 D] 문서.

이 순서로 가도 될까요?
```

---

## 2. 보조 프롬프트 (특수 상황)

### 2.1 RLS 침투 테스트 (Phase 1 마지막 필수)

```
RLS 침투 테스트를 수행합니다. (TRD R-03 대응)

목표: 코드의 권한 체크가 뚫려도 RLS가 막아주는지 검증.

테스트 시나리오:
  1) 계정 A로 로그인 → user_posts에 비공개 글 작성
  2) 계정 A로 saved_items에 글 저장
  3) 계정 B로 supabase.from('user_posts').select('*') 시도
     → 계정 A의 비공개 글이 보이면 SELECT 정책 실패
  4) 계정 B로 saved_items 시도 → 계정 A의 데이터가 보이면 실패
  5) 계정 B로 계정 A의 user_posts.id PATCH 시도 → 성공하면 UPDATE 정책 실패
  6) payment_logs도 동일

scripts/test-rls.ts에 자동화 스크립트 작성. 결과는 콘솔 표 형태로 출력.
TRD §3.3 RLS 매트릭스의 모든 행 검증.

각 시도가 거절되는지 표로 보고해 주세요.
하나라도 거절되지 않으면 즉시 중단.
```

### 2.2 결제 amount 변조 테스트 (Phase 4 마지막 필수)

```
Toss 결제 amount 변조 방어 검증. (TRD §6.4)

테스트 시나리오:
  1) 정상 결제 — order_id 발급, amount=4900
  2) 클라이언트에서 amount=1로 변조한 confirm 요청
     → 서버가 거절 (payment_logs amount와 불일치)
  3) 다른 사용자 order_id로 confirm 시도 → 거절
  4) 동일 order_id 두 번 confirm → 두 번째 거절 (이미 처리됨)

각 시나리오:
  - 응답 코드 + 에러 메시지
  - payment_logs 기록 상태
를 표로 보고. 하나라도 거절되지 않으면 즉시 중단.
```

### 2.3 Claude API 폴백 검증 (Phase 2 마지막 필수)

```
Claude API 폴백 메커니즘 검증. (TRD §7.4)

테스트 시나리오:
  1) 정상 호출 → DB 저장 확인
  2) ANTHROPIC_API_KEY를 일시적으로 잘못된 값으로 변경
     → /api/quote/today 호출 시 폴백 풀에서 글귀 노출
     → 앱 미충돌 + 에러 로그는 남되 사용자에게는 정상 글귀
  3) Claude가 JSON 파싱 불가 응답 mock
     → 1회 재시도 후 폴백 사용
  4) 폴백 풀이 비어있는 극단 상황 가정
     → 명확한 에러 메시지 (앱 미충돌)

각 시나리오 결과를 표로. ANTHROPIC_API_KEY 원상복구 잊지 말 것.
```

### 2.4 디자인 정합성 점검 (Phase 2/3/4 마지막 권장)

```
디자인 핸드오프 vs 구현 정합성 점검.

대상 화면: [화면명]
참조: design_handoff_geulgyeol/scripts/v2/[파일].jsx의 [컴포넌트명]

다음 항목을 확인하고 표로 보고해 주세요:

| 항목 | 핸드오프 값 | 구현 값 | 일치 |
|---|---|---|---|
| max-width | | | |
| 주요 padding | | | |
| 주요 margin | | | |
| 본문 fontSize | | | |
| 본문 lineHeight | | | |
| 메타 fontFamily/fontSize/letterSpacing | | | |
| 색상 (--ink, --accent 등 사용 위치) | | | |
| 호버 동작 (transform 사용 여부) | | | |
| 모션 (페이드 0.8s 사용 여부) | | | |
| 이모지/토스트/border-radius/shadow 사용 여부 | | | |

또한 다음 grep을 실행하고 결과 보고:
  - grep -r "border-radius:" --include="*.tsx" --include="*.css" (직각 원칙 점검)
  - grep -r "translate\|scale\|rotate" --include="*.tsx" (transform 호버 점검)
  - grep -r "toast\|alert(\|confirm(" --include="*.tsx" (토스트 점검)
  - grep -rE "[😀-🙏🌀-🗿]" --include="*.tsx" (이모지 점검)

위반 발견 시 위치를 보고하고 수정 제안.
```

### 2.5 에러 발생 시 디버깅

```
에러가 발생했습니다. CLAUDE.md §2.3 에러 회피 금지 원칙을 따라주세요.

[에러 메시지를 여기 붙여넣기]

요청 사항:
  1) 에러 메시지 정확 인용 + 의미 풀이
  2) 근본 원인 분석 (증상이 아닌 원인)
  3) 가능한 해결 방안 1~3개 + 각각의 트레이드오프
  4) 추천 방안 + 추천 이유
  5) 적용 전 확인 요청

코드 변경은 제가 승인한 후 한 번에 하나씩.
@ts-ignore, as any, 빈 try-catch 사용 금지.
```

### 2.6 리팩토링 요청

```
[파일 경로]가 다음 이유로 리팩토링이 필요: [이유]

요청 사항:
  1) 현재 파일의 책임 분석
  2) 리팩토링 후 구조 제안
  3) 외부 동작(API 시그니처, UI 결과)은 변경 금지
  4) 디자인 핸드오프 일치 여부 유지 (UI 컴포넌트인 경우)
  5) 적용 전 확인 요청

리팩토링 후 사용처 정상 작동 검증 시나리오도 함께 제시해 주세요.
```

### 2.7 새 기능 추가 요청 (PRD/TRD/디자인 핸드오프에 없는 경우)

```
세 문서에 명시되지 않은 새로운 요구가 생겼습니다: [요구]

요청 사항 (작업 시작 전 답변만):
  1) PRD §1.4 Non-goals 또는 §4 Out-of-scope 해당 여부
  2) 기존 P0 기능에 영향 분석
  3) Phase 일정 영향
  4) 디자인 핸드오프와의 정합성 (조용한 방 원칙 위반 여부)
  5) 추가하지 않을 경우 대안

위 5가지를 보고한 후 결정합시다. 임의로 코드 작업 시작 금지.
```

### 2.8 보안 점검 (Phase 5 또는 임의 시점)

```
보안 점검을 수행합니다. TRD §8 기준으로 표 보고:

| 카테고리 | 확인 항목 | 상태 | 비고 |
|---|---|---|---|
| 비밀키 | SUPABASE_SERVICE_ROLE_KEY 클라이언트 번들 미포함 | | |
| 비밀키 | TOSS_SECRET_KEY 클라이언트 번들 미포함 | | |
| 비밀키 | ANTHROPIC_API_KEY 클라이언트 번들 미포함 | | |
| RLS | profiles 활성화 + 정책 매트릭스 일치 | | |
| RLS | saved_items 동일 | | |
| RLS | user_posts 동일 | | |
| RLS | post_likes 동일 | | |
| RLS | payment_logs 동일 | | |
| 입력 검증 | 모든 API Route 바디 Zod 검증 | | |
| XSS | 사용자 입력 HTML 미허용 | | |
| 결제 변조 | confirm에서 amount 서버 재검증 | | |
| 로그 | payment_logs.raw_response에 카드번호 등 민감정보 없음 | | |

확인 방법:
  - 비밀키: grep -r "SUPABASE_SERVICE_ROLE_KEY\|TOSS_SECRET_KEY\|ANTHROPIC_API_KEY" .next/static
  - RLS: Supabase SQL Editor에서 정책 확인
  - 입력 검증: 각 route.ts에서 zod.parse() 호출 확인
  - 결제 변조: /api/payment/confirm 코드 확인

실패 항목이 있으면 즉시 중단 보고.
```

---

## 3. 화면별 시작 프롬프트

특정 화면 단위로 작업 시작할 때 사용. Phase 프롬프트보다 좁은 범위.

### 3.1 화면 구현 공통 템플릿

```
[화면명] 화면을 구현합니다.

레퍼런스:
  - design_handoff_geulgyeol/scripts/v2/[파일].jsx의 [컴포넌트명]
  - design_handoff_geulgyeol/styles/theme.css

작업 전 확인:
  1) 핸드오프 jsx 파일을 열어서 다음을 추출해 주세요:
     - 외곽 컨테이너 사이즈 (width / minHeight / maxWidth)
     - 주요 padding / margin / gap
     - 모든 fontSize / lineHeight / letterSpacing 값
     - 사용된 CSS 변수 목록 (--bg, --ink-deep 등)
     - 사용된 GGIcon 이름들
     - 호버/모션 동작이 명시된 경우 그 내용
  2) 위 추출값을 표로 보고
  3) 제가 확인한 후 구현 시작

구현 시 절대 규칙:
  - 픽셀 값은 핸드오프 그대로 (변경 시 반드시 사유 보고)
  - 색상은 var() CSS 변수만, #hex 직접 사용 금지
  - 이모지·토스트·border-radius·shadow·transform 호버 금지 (CLAUDE.md §7.3)
  - 핸드오프 jsx의 인라인 스타일을 그대로 복사하지 말고 Tailwind 또는 CSS modules로 재구현

기술 스택:
  - 'use client' 필요 여부 판단 (페이드인 모션·useState 있으면 client, 정적이면 RSC)
  - Framer Motion은 모션 화면에만 사용 (없는 화면엔 import 금지)
```

### 3.2 Today 화면 전용 (Phase 2의 핵심)

```
Today (오늘의 글) 화면을 구현합니다. — 이 프로젝트의 정서적 핵심.

레퍼런스: design_handoff_geulgyeol/scripts/v2/core-screens.jsx의 UScreenToday
보조 참조: README.md §4.4 핵심 화면, landing-hybrid.jsx의 main 영역

이 화면은 다른 화면보다 더 정밀하게 따라가야 합니다. 다음 디테일을 절대 놓치지 마세요:

  - max-width: 780px (가운데 정렬)
  - padding-top: 96px (상단 여백 압도적)
  - 메타 row (No. / 카테고리 / 날짜):
    * Mono 11px, ls 0.16em, UPPERCASE
    * marginBottom: 56px
    * 카테고리만 var(--accent), 양옆 ―
  - h1 제목: Serif 56px / weight 400 / lineHeight 1.25 / ls -0.018em / margin "0 0 12px"
  - byline: Sans 13px / ink-3 / ls 0.04em / marginBottom 64px
  - hairline: marginBottom 56px
  - 본문 p: Serif 21px / lineHeight 1.95 / margin "0 0 32px"
    * ★ 첫 단락 (i===0): className="heading" (var(--ink-deep)) + textIndent 0
    * ★ 두번째부터 (i>0): textIndent 2em
  - · · · 구분: Mono / ls 0.5em / ink-4 / margin "48px 0"
  - 태그 row: 8px gap, 6px 12px padding, border 1px var(--rule-strong), Sans 12px ink-2
  - 액션 row (3등분): grid 1fr 1fr 1fr, border-top/bottom 1px var(--rule), 각 버튼 사이 borderLeft 1px var(--rule)
    * 각 버튼: gap 14px, GGIcon size 20px var(--ink-deep), 라벨 Serif 16px var(--ink-deep), 서브 Sans 11px var(--ink-3)
  - "1,284명이 오늘 함께 읽었어요": Sans 12px / ink-3 / ls 0.06em / marginTop 48px / 가운데
  - 어제·내일 nav: marginTop 96px / borderTop 1px var(--rule) / 좌우 분할 / Serif 18px

저장 인터랙션:
  - 클릭 시 잉크 번지듯 페이드 0.8s
  - 라벨 "간직하기" → "간직됨" 변경
  - 토스트 절대 금지

먼저 위 스펙대로 구현 계획을 1줄씩 정리해서 제안해 주세요. 확인 후 시작.
```

### 3.3 Hybrid 랜딩 전용

```
Hybrid 랜딩을 구현합니다. — 비로그인 첫 방문 화면.

레퍼런스: design_handoff_geulgyeol/scripts/v2/landing-hybrid.jsx의 LandingHybrid

3단 구조 (각각 다른 호흡):
  ① 헤어라인 헤더 (1줄, 좌: 로고 / 중: 환영 메시지 / 우: 로그인·가입)
  ② 본문 = 오늘의 글 그 자체 (UScreenToday와 거의 동일하되 max-width 760px, padding-top 104px)
  ③ "오늘 당신은 읽는 사람인가요, 쓰는 사람인가요" 갈림길
     - 큰 카피 Serif 72px / em 태그로 "읽는 사람" "쓰는 사람" italic + var(--accent)
     - 좌(지연) / 우(민호) 50:50 분할
     - 우측은 background var(--bg-2)
     - 각 방: 아바타 48px (border-radius 50%) + 페르소나 정보 + 헤드라인 36px + 설명 16px + CTA + 메타 3개
  ④ 발견 피드 미리보기 — 3-card 그리드 (max-width 1200px)
  ⑤ 푸터 — 카탈로그 카드 식 메타 (Mono 11px)

주의:
  - "헤드라인·CTA·마케팅 카피 없음" — ②번 첫 화면에서 절대 보이지 말 것 (오늘의 글이 곧 첫 화면)
  - 모든 카피는 핸드오프 jsx의 텍스트 그대로 (임의 수정 금지)
  - 비로그인 사용자도 글 본문은 보이지만, 저장/감상은 로그인 후 가능 (CTA로 유도)

먼저 핸드오프 jsx에서 모든 카피·픽셀값을 추출해서 보고 후 구현 시작.
```

---

## 4. 시연 직전 최종 점검

```
시연 직전 최종 점검입니다.

1. 전체 시연 경로 1회 무중단 통과
   - 가입(이메일) → 로그아웃 → Google 로그인 → /today (오늘의 글)
   → 저장 (잉크 번짐 모션 확인) → /write 글 작성(공개)
   → /feed에서 본인 글 확인 → /me에서 저장 목록 확인
   → /premium → 결제 샌드박스 → 프리미엄 전환 확인

2. 각 단계 평균 응답 시간 측정 (3초 초과 없는지)

3. 360px 모바일 뷰에서 동일 경로 통과

4. 다크모드 토글로 전체 화면 점검 (라이트 ↔ 다크 0.4s 전환)

5. 콘솔 에러 0개 (네트워크 + 콘솔 탭)

6. README.md 실행법대로 새 환경에서 dry-run

7. .env.example 모든 키 (값 없이) 명시

8. 시연용 시드 사용자 2~3명 + 글 10편 정상 노출

9. 디자인 정합성: 이모지 0개, 토스트 0개, transform 호버 0개 (grep으로 점검)

위 9가지를 순서대로 확인 후 결과 표로 보고. 실패 시 즉시 중단.
```

---

## 부록: 자주 쓰는 짧은 지시

- `현재 Phase 진척도를 Exit Criteria 기준으로 표로 보여주세요.`
- `방금 변경한 파일을 git diff로 보여주고 변경 의도를 1줄씩 설명해 주세요.`
- `이 코드 작성 전에 디자인 핸드오프 [파일] [컴포넌트]의 픽셀 값을 먼저 인용해 주세요.`
- `이 작업의 영향 범위(어떤 파일이 영향받는지)를 먼저 알려주세요.`
- `더 작은 단계로 쪼개주세요. 한 번에 하나씩 진행하고 싶습니다.`
- `이 화면에서 디자인 핸드오프와 다르게 구현한 부분이 있는지 점검해 주세요.`
