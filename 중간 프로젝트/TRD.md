# TRD — 글결(가칭)
> Technical Requirements Document · 솔로 개발 + Claude Code 전제

---

## 0. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.1 (Draft) |
| 작성자 | 기영 |
| 작성일 | 2026-04-22 |
| 관련 문서 | `글결_PRD.md` |
| 개발 방식 | Claude Code 단독 / Git 단일 브랜치 기반 |

---

## 1. 아키텍처 개요

### 1.1 구조 다이어그램 (텍스트)

```
┌──────────────────────────────────────────────────────────┐
│                    Client (Next.js App)                  │
│   - App Router / RSC / Server Actions                    │
│   - Tailwind + Framer Motion                             │
└──────────────┬───────────────────────────┬───────────────┘
               │                           │
               │ HTTPS                     │ HTTPS
               ▼                           ▼
   ┌──────────────────────┐   ┌───────────────────────────┐
   │  Supabase            │   │  Next.js API Route        │
   │  - PostgreSQL        │   │  (Server-side only)       │
   │  - Auth              │   │  - /api/quote/today       │
   │  - Storage           │   │  - /api/payment/...       │
   │  - Row Level Security│   │  - /api/ai/generate       │
   └──────────────────────┘   └──┬──────────────────┬─────┘
                                 │                  │
                        Claude API          Toss Payments
                        (Anthropic)         (Sandbox)
```

### 1.2 핵심 설계 원칙

1. **단일 Repo / 단일 배포 대상** — 솔로 + Claude Code 개발 속도 최우선
2. **Server Action 우선, API Route는 외부 연동·보안 민감 영역에만** — AI 호출, 결제 검증은 반드시 서버
3. **Supabase RLS로 권한 경계를 DB에서 강제** — 코드 실수로 인한 권한 누출 방지
4. **상태 관리 최소화** — 서버 상태는 `TanStack Query`, 클라이언트 상태는 `Zustand` (선택적)

---

## 2. 기술 스택

### 2.1 선정 스택

| 레이어 | 선택 | 선정 근거 |
|---|---|---|
| Frontend Framework | **Next.js 15 (App Router)** | RSC 기반 빠른 첫 페인트, 풀스택 단일화 |
| Language | **TypeScript 5.x** | 타입 안전성, Claude Code 생성 코드 품질 향상 |
| Styling | **Tailwind CSS v4** | 디자인 토큰 관리 용이, 감성 UI 빠른 반복 |
| Animation | **Framer Motion** | 페이드/스크롤 기반 감성 모션 표준 |
| Typography | **Pretendard / Noto Serif KR** | 한글 세리프 감성 최상급 |
| Database | **Supabase (PostgreSQL)** | Auth + DB + Storage 통합, 솔로 개발 최적 |
| Auth | **Supabase Auth** | 이메일/OAuth 통합, RLS와 자연 연동 |
| Payment | **Toss Payments (Sandbox)** | 국내 표준, 문서 품질 우수, 정기결제 지원 |
| AI | **Anthropic Claude API** (`claude-sonnet-4-6`) | 한국어 감성 문체 생성 우수 |
| State (Server) | **TanStack Query v5** | 캐싱·리페칭 표준 |
| State (Client) | **Zustand** (필요 시에만) | 작성 에디터 드래프트 등 로컬 상태 |
| Form | **React Hook Form + Zod** | 검증 일원화 |
| Deployment | **Vercel** | Next.js 네이티브, 환경변수 관리 |

### 2.2 고려했으나 채택하지 않은 것

| 대안 | 기각 이유 |
|---|---|
| FastAPI + React 분리 | 솔로 개발 맥락에서 오버엔지니어링 |
| Turso + Drizzle | Supabase Auth가 없어 Auth 직접 구축 부담 |
| Stripe | 국내 프로젝트 맥락 낮음, 한국어 문서 약함 |
| OpenAI GPT | 한국어 감성 문체에서 Claude가 정량적으로 우위 |

---

## 3. 데이터 모델

### 3.1 주요 테이블

```sql
-- 사용자 확장 정보 (auth.users는 Supabase 기본)
profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id),
  nickname      text NOT NULL,
  created_at    timestamptz DEFAULT now(),
  subscription_status text CHECK (subscription_status IN ('free','premium')) DEFAULT 'free',
  subscription_expires_at timestamptz
)

-- 시스템/AI가 제공하는 오늘의 글귀
daily_quotes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date          date UNIQUE NOT NULL,           -- 하루 1편 고정
  title         text NOT NULL,
  body          text NOT NULL,
  source_type   text CHECK (source_type IN ('ai','curated')),
  tags          text[] DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
)

-- 사용자가 저장한 글귀 (daily_quotes OR user_posts 모두 가능)
saved_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type     text CHECK (item_type IN ('daily','user')),
  item_id       uuid NOT NULL,                  -- FK는 trigger로 검증
  saved_at      timestamptz DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
)

-- 사용자가 작성한 글귀
user_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text NOT NULL CHECK (char_length(title) <= 40),
  body          text NOT NULL CHECK (char_length(body) <= 600),
  visibility    text CHECK (visibility IN ('public','private')) DEFAULT 'private',
  tags          text[] DEFAULT '{}',
  like_count    int DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
)

-- (P1) 좋아요
post_likes (
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id       uuid REFERENCES user_posts(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
)

-- 결제 이력 (샌드박스)
payment_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id),
  order_id      text UNIQUE NOT NULL,
  payment_key   text,
  amount        int NOT NULL,
  status        text CHECK (status IN ('ready','approved','failed','canceled')),
  raw_response  jsonb,
  created_at    timestamptz DEFAULT now()
)
```

### 3.2 관계 요약

- `auth.users 1 — 1 profiles`
- `auth.users 1 — N saved_items`
- `auth.users 1 — N user_posts`
- `daily_quotes 1 — N saved_items (item_type='daily')`
- `user_posts 1 — N saved_items (item_type='user')`
- `user_posts 1 — N post_likes`

### 3.3 Row Level Security 전략

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | own or public fields | own | own | ❌ |
| daily_quotes | all authenticated | service role only | ❌ | ❌ |
| saved_items | own only | own only | ❌ | own only |
| user_posts | visibility='public' OR own | own only | own only | own only |
| post_likes | own | own | ❌ | own |
| payment_logs | own | service role only | service role only | ❌ |

> RLS는 **코드 실수로도 타인 데이터가 노출되지 않게 하는 마지막 방어선**. 솔로 개발에서 특히 중요.

---

## 4. API 명세 (주요 엔드포인트)

### 4.1 Convention
- Base URL: `/api/*`
- 인증: Supabase 쿠키 기반 세션
- 응답 포맷: `{ ok: boolean, data?: T, error?: { code, message } }`

### 4.2 주요 엔드포인트

| Method | Path | 설명 | 인증 |
|---|---|---|---|
| `GET` | `/api/quote/today` | 오늘의 글귀 조회 (없으면 생성 트리거) | ✅ |
| `POST` | `/api/ai/generate` | AI 글귀 생성 (관리자/크론 전용) | ✅ service role |
| `POST` | `/api/saved` | 저장 토글 | ✅ |
| `GET` | `/api/saved` | 내 저장 목록 | ✅ |
| `POST` | `/api/posts` | 글귀 작성 | ✅ |
| `GET` | `/api/posts?scope=feed` | 발견 피드 | ✅ |
| `GET` | `/api/posts?scope=me` | 내 글 목록 | ✅ |
| `PATCH` | `/api/posts/:id` | 수정 | ✅ own |
| `DELETE` | `/api/posts/:id` | 삭제 | ✅ own |
| `POST` | `/api/payment/ready` | 결제 요청 초기화 (order_id 발급) | ✅ |
| `POST` | `/api/payment/confirm` | Toss confirm callback | ✅ |
| `GET` | `/api/payment/status` | 내 구독 상태 | ✅ |

### 4.3 예시 — 오늘의 글귀

```ts
// GET /api/quote/today
// 1. 오늘 날짜의 daily_quotes 조회
// 2. 없으면 Claude API 호출 → 저장 → 반환
// 3. 사용자의 saved 여부를 함께 반환

Response 200:
{
  "ok": true,
  "data": {
    "id": "uuid",
    "title": "아침의 방식",
    "body": "...",
    "tags": ["잔잔함","아침"],
    "isSaved": false,
    "isPremium": false
  }
}
```

---

## 5. 인증 / 인가

### 5.1 Auth Flow

```
[Client] ──signUp/signIn──▶ [Supabase Auth]
                                 │
                                 └──session cookie──▶ [Next.js middleware]
                                                           │
                                             server-side session 검증
                                                           │
                                                    RSC / API Route
```

### 5.2 구현 포인트

- `middleware.ts`에서 보호 라우트(`/my`, `/write`) 접근 시 세션 검증 → 미인증 시 `/login` 리디렉션
- Server Component에서 `createServerClient()`로 세션 읽기
- **클라이언트에서는 절대로 service role key를 노출하지 않음** — `.env.local`의 `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용

### 5.3 소셜 로그인

- Google OAuth 1종만 구현
- Supabase Dashboard에서 OAuth 설정 → redirect URL 등록

---

## 6. 결제 연동 (Toss Payments Sandbox)

### 6.1 목표

- 실결제 없이, 정기결제 프로세스를 **기술적으로 완전히 시연**
- 결제 요청 → 인증 → 승인 → DB 반영 → 구독 상태 변경 → 만료 갱신 로직까지

### 6.2 결제 시퀀스

```
1. [Client]  "프리미엄 구독하기" 클릭
2. [Server]  POST /api/payment/ready
             - order_id 발급 (uuid)
             - payment_logs에 status='ready' 저장
3. [Client]  Toss SDK로 결제창 호출 (테스트 카드)
4. [Toss]    결제 성공 → successUrl 리디렉션 + paymentKey 전달
5. [Server]  POST /api/payment/confirm
             - Toss API 호출: paymentKey + orderId + amount로 confirm 요청
             - 성공 시 payment_logs 업데이트 + profiles.subscription_status='premium'
             - subscription_expires_at = now() + 30일
6. [Client]  성공 페이지 → 마이페이지로 이동
```

### 6.3 테스트 카드

- Toss 문서의 테스트 카드 번호 사용
- **중요**: 실제 카드 번호를 절대 입력하지 않음. README에 테스트 카드 명시

### 6.4 보안 포인트

- `TOSS_SECRET_KEY`는 서버 환경변수에만
- `amount` 금액 검증은 반드시 **서버에서 order_id로 재조회**하여 비교 (변조 방지)
- 샌드박스여도 실제 PG 연동과 동일한 검증 플로우를 구축

---

## 7. AI 연동 (Claude API)

### 7.1 사용처

| 용도 | 모델 | 호출 시점 |
|---|---|---|
| 오늘의 글귀 생성 | `claude-sonnet-4-6` | 매일 00:00 Cron 또는 첫 요청 시 |
| (P1) 맞춤 큐레이션 | `claude-sonnet-4-6` | 프리미엄 유저의 마이페이지 진입 시 |

### 7.2 프롬프트 설계 원칙

- 시스템 프롬프트에 **톤앤매너**를 강하게 고정
  - 예: "담담하고 느린 호흡의 한국어로, 600자 이내, 마침표로 끝나는 3~5문단"
- JSON 응답 강제 (`{title, body, tags}`)
- 매일 시드 키워드를 하나 주입 (계절/요일/시간)하여 중복 회피

### 7.3 호출 예시 (서버)

```ts
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  system: SYSTEM_PROMPT_FOR_QUOTE,
  messages: [{
    role: "user",
    content: `오늘의 키워드: "${todayKeyword}". JSON만 반환하세요.`
  }]
});
const parsed = JSON.parse(response.content[0].text);
```

### 7.4 리스크 대응

- **JSON 파싱 실패** → 재시도 1회, 실패 시 미리 저장해둔 폴백 글귀 사용
- **API 장애** → 최근 7일치 글귀 중 랜덤 노출
- **요금 폭주** → 일일 생성 횟수 제한 (1일 1편 원칙 고수)

---

## 8. 보안 고려사항

| 카테고리 | 조치 |
|---|---|
| 비밀키 관리 | `.env.local` + Vercel 환경변수, 절대 클라이언트 번들 포함 금지 |
| RLS | 모든 사용자 데이터 테이블에 RLS 활성화 |
| 입력 검증 | Zod 스키마로 모든 API 요청 바디 검증 |
| XSS | React 기본 이스케이프 + 사용자 입력 HTML 미허용(텍스트 only) |
| CSRF | Supabase SSR 쿠키 + Next.js Server Action 기본 토큰 |
| Rate Limit | Upstash Ratelimit (옵션) — AI/결제 엔드포인트 보호 |
| 결제 변조 | amount/order_id 서버 재검증 (6.4 참고) |
| 로그 민감정보 | payment_logs.raw_response에서 카드번호 등 마스킹 필드만 저장 |

---

## 9. 배포 & 운영

### 9.1 환경

| 환경 | 용도 | URL 예시 |
|---|---|---|
| Local | 개발 | `localhost:3000` |
| Preview | PR/시연 | `글결-*.vercel.app` |
| Production | 제출용 | `글결.vercel.app` |

### 9.2 환경 변수

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Toss Payments (Sandbox)
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

### 9.3 관측

- Vercel Analytics (기본)
- 에러 추적: 과제 범위이므로 `console.error` + Vercel Log로 충분
- (옵션) Amplitude 이벤트 로깅 — *기영 님 포트폴리오 갭 메꾸기 차원에서 강력 추천*

---

## 10. 개발 단계 & Claude Code 활용 전략

### 10.1 전체 마일스톤 (PRD와 동기화)

| Phase | 주요 산출물 |
|---|---|
| 1. Foundation | 프로젝트 셋업, DB 스키마 마이그레이션, Auth |
| 2. Core Reading | Claude API 연동, 오늘의 글귀, 읽기 UI 모션 |
| 3. Write & Share | 에디터, 발견 피드, 마이페이지 |
| 4. Payment Sandbox | Toss 연동, 결제 시퀀스 완성 |
| 5. Polish | UI 마감, 문서, 시연 영상 |

### 10.2 Claude Code 활용 원칙

1. **스키마부터 생성 → 타입 자동 추론** — Supabase CLI로 types 생성 후 Claude Code가 참조
2. **한 번에 한 기능** — Phase별로 컨텍스트 분리, 여러 Phase를 한 번에 요청하지 않음
3. **테스트 우선 아님, 동작 우선** — 과제 맥락이므로 e2e보다 수동 시연 경로 확보 우선
4. **공통 모듈부터** — `lib/supabase.ts`, `lib/anthropic.ts`, `lib/toss.ts`를 초반에 고정 후 기능 작업
5. **커밋 단위 = PR 단위** — Phase 하나 = 브랜치 하나 원칙 유지하면 롤백 안전

### 10.3 파일 구조 (권장)

```
app/
  (auth)/login, signup
  (app)/
    page.tsx                  # 오늘의 글귀
    discover/page.tsx         # 발견 피드
    write/page.tsx            # 에디터
    my/page.tsx               # 마이페이지
    premium/page.tsx          # 결제 유도
  api/
    quote/today/route.ts
    ai/generate/route.ts
    saved/route.ts
    posts/route.ts
    payment/
      ready/route.ts
      confirm/route.ts
components/
  quote/QuoteView.tsx
  quote/SaveButton.tsx
  editor/PostEditor.tsx
  payment/CheckoutButton.tsx
lib/
  supabase/server.ts, client.ts
  anthropic.ts
  toss.ts
  prompts/quote.ts
types/
  db.ts                       # Supabase 자동생성
```

---

## 11. 리스크 & 대응

| # | 리스크 | 영향 | 대응 |
|---|---|---|---|
| R-01 | Claude API 응답 품질 편차 | 오늘의 글귀 퀄리티 불균등 | 프롬프트 시스템 고정 + 폴백 글귀 풀 20개 미리 저장 |
| R-02 | Toss Sandbox API 스펙 변경 | 결제 플로우 파손 | 시연 1주 전 기준 스펙으로 고정, 시연 전일 재테스트 |
| R-03 | Supabase RLS 설정 실수로 데이터 누출 | 과제 감점, 보안 평가 불이익 | Phase 1 마지막에 RLS 테스트 스크립트 작성 (다른 계정으로 접근 시도) |
| R-04 | 솔로 일정 지연 | MVP 미완성 | Phase 5 분량을 줄이고 P0만 확실히 완성, P1은 과감히 컷 |
| R-05 | 감성 UI 과설계로 시간 소진 | 기능 미완성 | UI는 Phase별로 "최소 동작" → "폴리시" 2패스 전략 |
| R-06 | Claude Code 컨텍스트 손실로 일관성 붕괴 | 코드 패턴 혼재 | `CLAUDE.md`에 규칙·패턴 고정, 매 세션 로드 |

---

## 12. 문서화 산출물 (제출·시연용)

- [ ] `README.md` — 실행법, 환경변수, 테스트 카드, 아키텍처 요약
- [ ] `CLAUDE.md` — Claude Code용 규칙 문서
- [ ] PRD / TRD (본 문서)
- [ ] 시연 영상 3~5분 (가입 → 오늘의 글 → 저장 → 작성 → 결제 샌드박스)
- [ ] 발표 슬라이드 (문제 정의 → 솔루션 → 데모 → 기술 스택 → 회고)

---

## 13. 부록 — Claude Code 프롬프트 템플릿 예시

### A. Phase 시작 시
```
지금부터 Phase 2 (Core Reading) 작업을 시작합니다.
관련 문서: PRD 3.1, TRD 4.2 /api/quote/today, TRD 7 AI 연동
이번 작업 범위:
  1) /api/quote/today 엔드포인트 구현
  2) lib/anthropic.ts 클라이언트
  3) app/(app)/page.tsx의 QuoteView 컴포넌트 연결
제약: Framer Motion 페이드인 0.8s, 실패 시 폴백 글귀 사용.
기존 파일 수정 전 반드시 현재 상태를 확인해 주세요.
```

### B. 리팩토링 시
```
components/quote/QuoteView.tsx가 서버/클라이언트 책임이 섞여 있습니다.
RSC로 데이터 페치, Client Component로 모션 분리하는 구조로 리팩토링해 주세요.
기존 동작은 그대로 유지.
```
