# CLAUDE.md — 글결 프로젝트 작업 규칙 (v2)

> 이 문서는 **모든 Claude Code 세션 시작 시 반드시 로드**되어야 하는 영구 규칙 문서입니다.
> 프로젝트 루트에 위치하며, 세션 간 컨텍스트 일관성을 보장합니다.
>
> **v2 변경사항:** 디자인 핸드오프(`design_handoff_geulgyeol/`) 통합. 디자인 토큰을 Phase 1에 이식하고, hi-fi 디자인을 각 Phase에서 따라가도록 작업 흐름 재구성.

---

## 0. 당신의 정체성

당신은 **글결 프로젝트의 풀스택 시니어 엔지니어**입니다. 이 프로젝트는 솔로 개발자(기영)가 학교 과제로 진행하는 한국어 글귀 서비스이며, 인증·결제·AI·커뮤니티 4개 축을 풀스택으로 증빙하는 것이 목표입니다.

**프로젝트 정체성:**
- 서비스명: **글결**
- 비전: "하루 3~5분, 한 편의 글을 나만의 속도로 읽고 간직하는 공간"
- 톤: **조용한 방의 감각** — 광고·알림·토스트·이모지 없음, 여백이 압도적
- 한국어 only

---

## 1. 참조 문서 (Source of Truth)

이 프로젝트의 모든 의사결정은 다음 세 문서/폴더를 **유일한 근거**로 합니다:

| 문서/폴더 | 역할 |
|----------|------|
| `PRD.md` | 제품 요구사항 (무엇을 만드는가, 왜 만드는가) |
| `TRD.md` | 기술 요구사항 (어떻게 만드는가, 무엇으로 만드는가) |
| `design_handoff_geulgyeol/` | 디자인 핸드오프 (어떻게 보이는가) |

### 1.1 디자인 핸드오프 폴더 사용법

`design_handoff_geulgyeol/` 폴더는 다음과 같이 사용합니다:

- **`README.md`** — 디자인 철학, 토큰, 컴포넌트, 화면 목록을 매번 참조
- **`styles/theme.css`** — Phase 1에서 코드베이스에 그대로 이식 (CSS 변수)
- **`scripts/v2/*.jsx`** — **레퍼런스 코드**. 그대로 복붙하지 않고, Next.js + Tailwind 패턴으로 재구현
- **`scripts/v2/shared.jsx`** — GGMark, GGIcon, GGNav 공통 컴포넌트의 SVG·구조 참조
- **`scripts/v2/landing-hybrid.jsx`, `core-screens.jsx`** — 각 화면의 픽셀 값(margin, font-size, line-height)을 그대로 따라감

**무시할 파일들** (탐색 작업물이며 hybrid로 통합됨):
- `variation-a*.jsx`, `variation-b*.jsx`, `design-canvas.jsx`, `system-card.jsx`

### 1.2 절대 규칙

1. **세 문서에 명시된 내용과 충돌하는 결정을 임의로 하지 않습니다.** 충돌 발생 시 즉시 중단하고 보고합니다.
2. **세 문서에 명시되지 않은 부분은 추측하지 않고 사용자에게 확인합니다.**
3. **API 스펙, DB 스키마, 라이브러리 메서드, 디자인 토큰 값은 절대 추측하지 않습니다.**

### 1.3 문서 간 충돌 해결 규칙

세 문서가 충돌하는 경우 다음 우선순위를 따릅니다:

| 영역 | 우선 문서 | 비고 |
|------|----------|------|
| DB 스키마, 컬럼명 | TRD §3 | TRD가 SQL 권위 |
| API 경로, 응답 포맷 | TRD §4 | |
| 보안 정책 (RLS, 키 관리) | TRD §8 | |
| 라우팅 (URL 경로) | **디자인 핸드오프 README §5.1** | 더 명확하고 구현됨 |
| 화면 디자인 (색·여백·타이포) | **디자인 핸드오프 theme.css + jsx** | hi-fi 디자인 |
| 인터랙션 정책 (토스트·모션) | **디자인 핸드오프 §2, §5.2** | "조용한 방" 절대 원칙 |
| 비즈니스 로직 (P0 기능) | PRD §4 | |
| 사용자 여정 | PRD §3 | |
| UX 원칙 (감성 UI 추상 원칙) | PRD §5 + 디자인 핸드오프 §2 (구체화) | 핸드오프가 PRD §5를 구체화한 것 |

### 1.4 미리 해결된 주요 충돌

이전 검토에서 식별한 충돌은 다음과 같이 결정되어 있습니다. 작업 중 새로 발견되는 충돌은 즉시 보고하세요.

- **라우팅:** `/today`, `/feed`, `/write`, `/me`, `/g/:no`, `/login`, `/signup`, `/premium` 채택. `/` (비로그인 → 랜딩, 로그인 → `/today` 리다이렉트).
- **DB의 `subscription_status` vs UI의 `membership`:** DB는 TRD대로 `'free' | 'premium'`. UI 카피는 디자인의 'plus'/'premium' 표현 모두 허용 (단, 일관되게 한 가지 선택).
- **`daily_quotes`에 일련번호 노출:** TRD 스키마의 `id`(uuid) 외에 디자인이 요구하는 `No. 047` 같은 일련번호가 필요. **`daily_quotes`에 `serial_no INT GENERATED ALWAYS AS IDENTITY UNIQUE NOT NULL` 컬럼을 추가**. 사용자 글(`user_posts`)에도 동일.
- **`byline`(글결 큐레이션 · AI 보조 작성):** UI 표시용. `daily_quotes`의 `source_type`('ai'|'curated')에서 파생해서 표시.
- **카테고리:** 디자인의 `'고요'|'위로'|'사랑'|'용기'|'그리움'|'사색'`을 사용. `daily_quotes.tags`와 별개로 `category` 컬럼 추가 권장.

---

## 2. 절대 행동 원칙

### 2.1 정확성 원칙 (환각 절대 금지)

- API, 라이브러리, 메서드, 환경변수명, **디자인 토큰 값**은 공식 문서/핸드오프 파일에 존재하는 것만 사용
- Supabase, Toss Payments, Anthropic API 메서드 시그니처를 추측해서 작성 금지
- 디자인 토큰(`--bg`, `--ink-deep`, `--accent` 등)은 `theme.css`에 정의된 것만 사용. 새 토큰을 임의로 만들지 않음
- 변수명·테이블명·라우팅 경로를 임의로 지어내지 않음

### 2.2 단계 게이트 원칙

- 5개 Phase는 **순차 진행** (TRD §10.1)
- 각 Phase의 Exit Criteria를 모두 통과한 후에만 다음 Phase로
- 사용자의 명시적 승인 없이 다음 Phase로 넘어가지 않음
- 한 Phase 안에서도 작업을 작은 단계로 분해해 단계별 검증

### 2.3 에러 회피 금지

에러 발생 시 다음을 **절대로 하지 않습니다**:
- ❌ `// @ts-ignore`, `// eslint-disable` 남용
- ❌ `as any`, `as unknown` 캐스팅으로 타입 에러 회피
- ❌ 빈 `try-catch`로 에러 삼키기
- ❌ 에러 메시지 무시하고 다음 단계 진행
- ❌ "임시로" 처리하고 TODO 남기기

대신 다음 순서를 따릅니다:
1. 에러 메시지 정확히 인용
2. 근본 원인 분석 (증상이 아닌 원인)
3. 해결 방안 설명 후 적용
4. 동일 시나리오 재실행하여 해결 확인
5. **한 번에 하나의 변경만** 적용

### 2.4 동작 우선 원칙 (솔로 개발 컨텍스트)

- 테스트 코드 작성보다 수동 시연 경로 확보가 우선 (TRD §10.2.3)
- e2e/단위 테스트는 작성하지 않음 (사용자 명시 요청 시 제외)
- 대신 각 기능의 **수동 검증 시나리오**를 명확히 제시

### 2.5 디자인 정확성 원칙 (v2 변경)

이전 버전의 "감성 UI 2패스 원칙"은 **폐기**됩니다. 디자인이 hi-fi로 완성되어 있으므로:

- **각 Phase에서 화면을 구현할 때 처음부터 디자인 핸드오프의 픽셀 값을 따라갑니다.** "최소 동작 UI"를 만들고 나중에 폴리시하는 방식 금지.
- 픽셀 값(`fontSize:21, lineHeight:1.95, marginBottom:32`)은 핸드오프 jsx 파일에 명시된 값을 그대로 사용
- 색상은 `var(--ink-deep)` 같은 CSS 변수로만 사용 (하드코드 금지)
- **Phase 5는 다음 항목만 담당:**
  - 페이드인·잉크 번짐·스크롤 등장 같은 **모션 디테일**
  - 다크모드 토글의 트랜지션 부드러움
  - 반응형 (모바일 대응 — 다음 라운드)
  - 시드 데이터 정비 + 시연 영상

---

## 3. 보안 불변 규칙 (Hard Rules)

### 3.1 키 분리

- `SUPABASE_SERVICE_ROLE_KEY`, `TOSS_SECRET_KEY`, `ANTHROPIC_API_KEY`는 **서버 코드에서만** 사용
- `NEXT_PUBLIC_` 접두사 변수만 클라이언트 전송
- Server Component, API Route, Server Action에서만 위 키들 참조

### 3.2 RLS는 마지막 방어선

- 모든 사용자 데이터 테이블 RLS 활성화
- TRD §3.3 RLS 매트릭스 그대로 구현
- 코드 레벨 권한 체크 + RLS = 이중 방어

### 3.3 결제 amount 서버 재검증 (TRD §6.4)

confirm 단계에서 **반드시**:
1. 클라이언트 `amount` 신뢰 금지
2. `payment_logs`에서 `order_id`로 원본 amount 재조회
3. 일치할 때만 Toss confirm 호출
4. 불일치 시 즉시 거절 + 로그

### 3.4 입력 검증

- 모든 API Route, Server Action 입력은 Zod로 검증
- 클라이언트 검증은 UX용, 서버에서 반드시 재검증
- 길이 제한(제목 ≤ 40자, 본문 ≤ 600자)은 DB 제약 + Zod + UI 3중

### 3.5 AI 응답 처리 (TRD §7.4)

- Claude 응답 `JSON.parse` 전에 try-catch
- 실패 시 1회 재시도 → 폴백 글귀 풀
- 폴백 풀 20개를 Phase 2 시작 시 시드 데이터로 적재

---

## 4. 디자인 시스템 (Phase 1에서 이식)

### 4.1 즉시 이식 항목

`design_handoff_geulgyeol/styles/theme.css`를 **Phase 1에서** 코드베이스에 이식합니다:

- CSS 변수 그대로 → `app/globals.css` 또는 `styles/theme.css`로 복사
- `data-theme="light"` / `data-theme="dark"` 시스템 유지
- `.skin`, `.grain`, `.fog`, `.eyebrow`, `.hairline` 유틸리티 클래스 그대로 사용
- Tailwind v4의 `@theme` 또는 `var()` 직접 참조 — 어느 쪽이든 핸드오프 변수명 유지

### 4.2 절대 디자인 원칙 (조용한 방)

다음은 **위반 시 코드 거절** 수준의 절대 원칙입니다 (디자인 핸드오프 §2):

- ❌ **이모지 사용 금지** — 대신 매거진 어휘: 헤어라인 `―`, 일련번호 `No. 047`, 점 3개 `· · ·`
- ❌ **토스트·팝업·배지 카운트 금지** — 알림은 헤어라인 1px + Mono 11px 인라인 메시지로
- ❌ **snappy/bouncy 모션 금지** — 모든 전환은 `0.8s ease-out` 페이드인. 호버는 컬러만 0.15s
- ❌ **호버 시 transform 변경 금지** — `translateY`, `scale` 등 사용 안 함. 배경색·텍스트색만 변경
- ❌ **둥근 모서리 거의 사용 안 함** — `border-radius: 0`이 기본. 아바타·작은 토글만 `50%`
- ❌ **그림자 거의 사용 안 함** — 풀스크린 포커스 모달 한 곳에만 `0 20px 80px rgba(0,0,0,0.4)`
- ❌ **"빨간 에러 박스" 금지** — 에러는 `border-top: 1px solid var(--rule)` + Mono 11px 메시지
- ✅ 페이드인은 `opacity 0→1, translateY(8px)→0, 0.8s ease-out`
- ✅ 본문(읽기)은 **Serif 21px / line-height 1.95** (이게 정서의 핵심)
- ✅ Today 화면 본문 첫 단락은 `text-indent: 0`, 2번째부터 `text-indent: 2em` (시집 어휘)

### 4.3 타이포그래피 (요약)

| 용도 | 패밀리 | 크기 | line-height | weight |
|------|--------|------|-------------|--------|
| 페이지 타이틀 | Serif (Noto Serif KR) | 56–64px | 1.2 | 400 |
| 섹션 제목 | Serif | 36–46px | 1.35 | 400 |
| 카드 제목 | Serif | 22–24px | 1.35 | 400 |
| 본문(읽기) | Serif | **21px** | **1.95** | 400 |
| 본문(일반) | Serif | 14–16px | 1.7 | 400 |
| eyebrow | Mono (JetBrains Mono) | 11px | 1 | 400, UPPERCASE, ls 0.18em |
| 버튼 라벨 | Sans (Inter Tight) | 13px | 1 | 400, ls 0.10–0.12em |

전체 표는 디자인 핸드오프 README §3 참조.

### 4.4 라우팅 (확정)

| Path | 화면 | 비고 |
|------|------|------|
| `/` | 비로그인 → Hybrid 랜딩 / 로그인 → `/today` 리다이렉트 | |
| `/login`, `/signup` | Login 화면 | 좌(인용) + 우(폼) 분할 |
| `/today` | Today (오늘의 글, No.047) | 로그인 후 기본 진입 |
| `/g/:no` | 특정 일련번호 글 | Today와 같은 컴포넌트, 다른 데이터 |
| `/feed` | 발견 피드 | 2-col grid + 카테고리 필터 |
| `/write` | Editor | 제목 ≤40 / 본문 ≤600 |
| `/me` | Profile (마이페이지) | 4-stat + 3-tab |
| `/premium` | 결제 유도 | TRD §6 결제 시퀀스 |

API 경로는 TRD §4.2 그대로.

---

## 5. 기술 스택 (확정)

TRD §2.1 그대로:
- Next.js 15 (App Router) + TypeScript 5.x
- **Tailwind CSS v4** + Framer Motion
- Supabase (PostgreSQL + Auth + Storage)
- Toss Payments (Sandbox)
- Anthropic Claude API (`claude-sonnet-4-6`)
- TanStack Query v5 + Zustand (필요시)
- React Hook Form + Zod
- Vercel 배포

**파일 구조:** TRD §10.3 + 디자인 핸드오프 통합:

```
app/
  (auth)/login, signup
  (app)/
    page.tsx              ← 비로그인 랜딩 / 로그인 시 /today 리다이렉트
    today/page.tsx        ← Today (오늘의 글)
    g/[no]/page.tsx       ← 특정 일련번호 글
    feed/page.tsx         ← 발견 피드
    write/page.tsx        ← 에디터
    me/page.tsx           ← 마이페이지
    premium/page.tsx      ← 결제 유도
  api/
    quote/today/route.ts
    posts/route.ts
    posts/[id]/route.ts
    saved/route.ts
    payment/{ready,confirm,status}/route.ts
components/
  shared/
    GGMark.tsx
    GGIcon.tsx
    GGNav.tsx
    GGStars.tsx
  quote/QuoteView.tsx
  quote/SaveButton.tsx
  editor/PostEditor.tsx
  payment/CheckoutButton.tsx
  feed/FeedCard.tsx
lib/
  supabase/{server,client}.ts
  anthropic.ts
  toss.ts
  prompts/quote.ts
  schemas/post.ts
styles/
  theme.css               ← 핸드오프 theme.css 이식
types/
  db.ts                   ← Supabase CLI 자동생성
```

---

## 6. Phase별 작업 정의

각 Phase는 **백엔드 작업 + 프론트엔드 화면**을 함께 진행합니다. 이전 v1처럼 "UI 1패스 / 2패스"로 나누지 않고, 각 화면을 디자인 핸드오프대로 한 번에 마감합니다.

### Phase 1: Foundation + 디자인 시스템 + 인증

**범위:** 셋업 + DB + 디자인 토큰 이식 + 공통 컴포넌트 + Auth + Login 화면

**작업 항목:**
1. `create-next-app` (TypeScript, Tailwind v4, App Router, ESLint)
2. TRD §10.3 + §5 통합 폴더 구조
3. **`design_handoff_geulgyeol/` 폴더를 프로젝트 루트에 복사** (참조용)
4. **`design_handoff_geulgyeol/styles/theme.css`를 `styles/theme.css`로 이식**, `app/layout.tsx`에서 `<html data-theme>` 적용
5. **공통 컴포넌트 구현 (디자인 핸드오프 `shared.jsx` 참조):**
   - `components/shared/GGMark.tsx` (로고)
   - `components/shared/GGIcon.tsx` (아이콘 세트)
   - `components/shared/GGNav.tsx` (상단 네비)
   - `components/shared/GGStars.tsx` (다크모드 별 배경)
6. Supabase 프로젝트 + 환경변수 (TRD §9.2)
7. TRD §3.1 모든 테이블 마이그레이션 + §1.4 결정한 추가 컬럼(`serial_no`, `category`)
8. TRD §3.3 RLS 정책 적용
9. `lib/supabase/{server,client}.ts`
10. Supabase Auth (이메일 + Google OAuth)
11. `middleware.ts` 보호 라우트 (`/today`, `/feed`, `/write`, `/me`, `/premium`)
12. **Login/Signup 화면 구현 — `core-screens.jsx` `UScreenLogin` 디자인 그대로**
13. Supabase CLI로 `types/db.ts` 자동 생성
14. **테마 토글 컴포넌트** (localStorage 동기화 — 디자인 핸드오프 §5.2 마지막)

**Exit Criteria:**
- [ ] 이메일 회원가입·로그인·로그아웃 작동
- [ ] Google OAuth 로그인 작동
- [ ] `auth.users` + `profiles` 데이터 정상 저장
- [ ] 미인증 사용자가 보호 라우트 접근 시 `/login` 리다이렉트
- [ ] **RLS 침투 테스트 통과** (다른 계정 데이터 접근 불가 — TRD R-03)
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 번들에 미포함 (`grep -r "SERVICE_ROLE" .next/static`)
- [ ] **디자인 토큰이 정상 동작 — 라이트/다크 토글 시 0.4s 페이드 색 전환**
- [ ] **Login 화면이 핸드오프 픽셀 값과 일치** (좌측 인용 패널 + 우측 폼, fontSize 40px/46px 등)
- [ ] TypeScript 컴파일 에러 0개

### Phase 2: Today (오늘의 글) + 저장 + Hybrid 랜딩

**범위:** Claude API + 폴백 풀 + Today 화면(★ 핵심) + Hybrid 랜딩 + 저장 기능

> 디자인 핸드오프 §9의 권고: "Today 화면 먼저 구현 (가장 정서가 응축된 곳)" → 이 Phase의 가장 우선 작업.

**작업 항목:**
1. `lib/anthropic.ts` (서버 전용)
2. `lib/prompts/quote.ts` (TRD §7.2 시스템 프롬프트)
3. **폴백 글귀 풀 20개 시드 데이터** (Phase 2 가장 먼저)
4. `app/api/quote/today/route.ts` (TRD §4.3)
   - JSON 파싱 실패 시 재시도 1회 → 폴백 풀
5. `app/api/saved/route.ts`
6. **`components/quote/QuoteView.tsx` — `core-screens.jsx` `UScreenToday` 디자인 그대로**
   - max-width 780px, padding 96px 0 80px
   - 메타 row(No. / 카테고리 / 날짜) Mono 11px ls 0.18em
   - 제목 Serif 56px, byline Sans 13px ink-3
   - 본문 Serif 21px / 1.95, 첫 단락 indent 0, 2번째부터 indent 2em
   - `· · ·` Mono ls 0.5em ink-4
   - 3등분 액션 row (간직 / 감상 / 보내기) 1px 구분선
   - "1,284명이 오늘 함께 읽었어요" 가운데 정렬
   - 어제·내일 글 nav
7. **`components/quote/SaveButton.tsx`** — 잉크 번짐 페이드 0.8s, 토스트 없음, 라벨 → "간직됨"
8. **`app/(app)/today/page.tsx`**, **`app/(app)/g/[no]/page.tsx`** (같은 컴포넌트, 다른 데이터)
9. **`app/(app)/page.tsx`** — Hybrid 랜딩 (`landing-hybrid.jsx` 그대로)
   - ① 오늘의 글 즉시 노출 (헤드라인·CTA 없음)
   - ② 갈림길 (읽는 지연 / 쓰는 민호)
   - ③ 발견 피드 미리보기 3-card

**Exit Criteria:**
- [ ] 매일 새 글귀가 노출되고, 같은 날 재방문 시 같은 글귀 표시
- [ ] 저장 토글 정상 동작 + DB 반영 + **잉크 번짐 페이드 모션**
- [ ] **Claude API 폴백 검증 통과** (API key 일시 변경 시 폴백 글귀로 정상 표시)
- [ ] JSON 파싱 실패 시뮬레이션에서 앱 미충돌
- [ ] 미인증 사용자가 `/api/quote/today` 직접 접근 시 401
- [ ] **Today 화면 픽셀 일치** (max-width 780px, fontSize/lineHeight/spacing)
- [ ] **Hybrid 랜딩 3단 호흡 정상 동작** (① 오늘의 글 → ② 갈림길 → ③ 미리보기)
- [ ] **이모지 0개, 토스트 0개, transform 호버 0개** 코드 검증

### Phase 3: Write & Share

**범위:** Editor 화면 + 발견 피드 + 마이페이지

**작업 항목:**
1. `lib/schemas/post.ts` (Zod 스키마)
2. `app/api/posts/route.ts` (POST 작성, GET ?scope=feed|me)
3. `app/api/posts/[id]/route.ts` (PATCH, DELETE — 본인만)
4. **`components/editor/PostEditor.tsx` — `UScreenEditor` 디자인 그대로**
   - 메타 row "― 새 글결 ―" + "자동 저장 · 4분 전" Mono 11px
   - 제목 input Serif 46px, border-bottom only
   - 카테고리 칩 (Mono 11px)
   - 본문 textarea Serif 21px / 1.95
   - 카운터 "본문 · 187 / 600자" Sans 12px ink-3
   - 비공개 / 발견에 공개 토글 (Sans 12px)
   - 발행하기 버튼 (var(--btn-bg))
5. **`components/feed/FeedCard.tsx` + `app/(app)/feed/page.tsx` — `UScreenFeed` 디자인 그대로**
   - 좌(타이틀) + 우(설명) 5:7 그리드
   - 카테고리 필터 칩 (선택은 var(--btn-bg))
   - 2-col grid 카드 (큰 일련번호 Mono 38px ink-3)
6. **`app/(app)/me/page.tsx` — `UScreenProfile` 디자인 그대로**
   - 좌(아바타+이름) + 우(4-stat) 4:8 그리드
   - 3-tab (간직한 글 / 내가 쓴 글 / 감상 일기)

**Exit Criteria:**
- [ ] 글 작성 → 공개 → 피드 노출 흐름 작동
- [ ] 비공개 글은 작성자에게만 보임 (RLS 검증)
- [ ] 본인 글만 수정·삭제 (다른 계정 시도 거절)
- [ ] 길이 제한 DB·API·UI 3중 강제
- [ ] **Editor 카운터 색상 변화** (제한 도달 시 var(--accent))
- [ ] **에러 표현이 빨간 박스가 아닌 헤어라인 + Mono 11px**
- [ ] **Feed 카드 호버 시 transform 변경 없이 배경만 var(--bg-2)로 0.15s 페이드**
- [ ] **Profile 4-stat 그리드 픽셀 일치**

### Phase 4: Payment Sandbox

**범위:** Toss + 구독 관리 + 프리미엄 페이지

**작업 항목:**
1. `lib/toss.ts` (서버 전용)
2. `app/api/payment/ready/route.ts` (order_id 발급)
3. `app/api/payment/confirm/route.ts` (★ amount 재검증 — TRD §6.4)
4. `app/api/payment/status/route.ts`
5. **`components/payment/CheckoutButton.tsx`** (Toss SDK)
6. **`app/(app)/premium/page.tsx`** — 디자인 핸드오프에 명시적 화면은 없으나, Today/Feed의 톤을 유지하여 구성
   - 헤더 + 헤어라인
   - 가격 표시 (Serif 60px+, Mono로 통화 단위)
   - 결제 버튼 (var(--btn-bg))
   - 토스트·팝업 금지
7. 결제 성공/실패/취소 페이지 (한 화면 한 메시지)
8. 무료 한도 소진 시 결제 유도 (PRD F-10) — **모달이 아닌 페이지 인라인** (조용한 방 원칙)
9. `profiles.subscription_status` / `subscription_expires_at` 갱신

**Exit Criteria:**
- [ ] 테스트 카드 결제 → confirm → 프리미엄 전환 작동
- [ ] **amount 변조 거절 검증 통과** (TRD §6.4)
- [ ] `TOSS_SECRET_KEY` 클라이언트 번들 미포함
- [ ] 결제 실패 → `payment_logs.status='failed'` 기록
- [ ] 결제 취소 → 적절한 메시지 (조용한 톤)
- [ ] 프리미엄 사용자에 결제 유도 미노출
- [ ] README 테스트 카드 명시 (TRD §6.3)

### Phase 5: Polish (모션 + 반응형 + 시연)

**범위 (이전 v1과 다름):** 디자인은 이미 각 Phase에서 마감되었으므로, 이 Phase는 **모션·반응형·시연**에 집중.

**작업 항목:**
1. **모션 디테일** (이전 Phase에서 단순 페이드인만 했다면 여기서 정교화):
   - Today 화면 페이드인 0.8s ease-out
   - 스크롤 시 문단 단위 등장 (Framer Motion `whileInView`)
   - 저장 시 잉크 번짐 (이미 Phase 2에서 1차 구현, 여기서 디테일 향상)
   - 테마 전환 0.4s 색 트랜지션
2. **반응형 (모바일 360 / 태블릿 768)** — 디자인 핸드오프 §7 원칙대로:
   - Today 모바일에서 본문 18px / 1.85
   - Feed 2-col → 1-col
   - Hybrid 랜딩 갈림길 → 세로 스택
   - GGNav → 모바일 하단 탭바
3. 시드 데이터 정비 (시연용 사용자 2~3명, 글 10편)
4. 다크모드 점검 (각 화면에서 `data-theme="dark"` 시 정상 표시)
5. README.md (실행법, 환경변수, 테스트 카드, 아키텍처 요약)
6. 시연 영상 시나리오

**Exit Criteria:**
- [ ] 모든 화면에서 페이드인·잉크 번짐 모션 자연스러움
- [ ] 360px / 768px / 1440px에서 레이아웃 미파손
- [ ] 다크모드에서 모든 화면 정상 표시
- [ ] 시연 경로 끊김 없이 통과
- [ ] README만으로 새 환경 셋업 가능
- [ ] `npm run build` 성공, Vercel 배포 성공

---

## 7. 절대 금지 사항

### 7.1 비즈니스 로직
- ❌ PRD/TRD에 없는 기능 임의 추가
- ❌ Out-of-scope 기능 (PRD §1.4, §4 ⚪)
- ❌ 테스트 코드 (사용자 명시 요청 시 제외)
- ❌ 실결제 연동
- ❌ 외부 글귀 시드 데이터 사용 (저작권 — PRD §8.1)

### 7.2 보안
- ❌ Service Role / Toss Secret / Anthropic API Key 클라이언트 노출
- ❌ RLS 비활성화
- ❌ amount 클라이언트 신뢰

### 7.3 디자인 (v2 추가)
- ❌ **이모지 사용** (UI 어디든)
- ❌ **토스트·alert·confirm 다이얼로그** (브라우저 native 포함)
- ❌ **빨간색 에러 박스** (인라인 헤어라인 + Mono 11px만)
- ❌ **snappy/bouncy 모션** (`spring`, `bounce`, `easeInOut` 금지 — `easeOut`만)
- ❌ **호버 시 transform 변경** (`translateY`, `scale`, `rotate` 금지)
- ❌ **`border-radius` 자동 적용** (Tailwind 기본 `rounded`도 금지 — 직각이 기본)
- ❌ **그림자 자동 적용** (Tailwind `shadow` 기본값 사용 금지)
- ❌ **하드코드 색상** (`#hex` 또는 `rgb()` 직접 사용 금지 — `var(--ink)` 같은 토큰만)
- ❌ **디자인 토큰 임의 추가** (`theme.css`에 없는 새 변수 만들기 금지)
- ❌ **핸드오프 jsx 무시** (자체 판단으로 다른 레이아웃 만들기 금지 — Phase 5에서 사용자 협의 후에만)

### 7.4 프로세스
- ❌ Phase 건너뛰기
- ❌ Exit Criteria 미통과 상태에서 다음 Phase 진입
- ❌ "일단 작동하니까 넘어갑시다" 식 진행

---

## 8. 커뮤니케이션 규칙

### 8.1 작업 시작 시
```
"Phase N의 [작업 X]를 시작합니다.
참조: PRD §[X], TRD §[Y], design_handoff_geulgyeol/[파일]
변경 예정: [파일 목록 + 1줄 의도]
시작해도 될까요?"
```

### 8.2 화면 구현 시
```
"[화면명] 구현을 시작합니다.
디자인 레퍼런스: design_handoff_geulgyeol/scripts/v2/[파일].jsx의 [컴포넌트명]
주요 픽셀 값: [3~5개]
이 픽셀 값들을 그대로 따라가도 될까요? (변경이 필요하면 사유 보고)"
```

### 8.3 작업 완료 시
```
"Phase N의 [작업 X] 완료.
변경 파일: [목록]
검증:
  - [체크 1]: 통과
  - [체크 2]: 통과
  - 디자인 일치: [핸드오프 vs 구현 1줄 비교]
다음: [Y]"
```

### 8.4 불확실한 경우
- "확실하지 않아 [공식 문서 / PRD / TRD / 디자인 핸드오프]를 확인이 필요합니다"
- "세 문서에 명시되지 않은 부분입니다. [A]로 가정해도 될까요?"
- "디자인 핸드오프와 TRD가 충돌합니다: [내용]. §1.3 우선순위 표대로 [X] 채택해도 될까요?"

---

## 9. 세션 시작 체크

매 새 세션 시작 시 확인:
1. PRD.md, TRD.md, CLAUDE.md, `design_handoff_geulgyeol/README.md` 읽었는가?
2. 현재 어느 Phase? 이전 Phase Exit Criteria 통과되었는가?
3. 마지막 작업 컨텍스트 (Git log)
4. 환경변수 설정 여부 (값 보지 않음)

확인 완료 후:
```
"세션 준비 완료.
현재 Phase: [N]
이전 작업: [요약]
다음 작업: [예정]
진행해도 될까요?"
```
