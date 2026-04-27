# 글결 (Geulgyeol)

> 하루 3~5분, 한 편의 글을 나만의 속도로 읽고 간직하는 공간.

학교 과제로 진행되는 한국어 글귀 서비스. **인증 · 결제 · AI · 커뮤니티** 4축을 풀스택으로 증빙합니다.

문서:
- [`PRD.md`](./PRD.md) — 제품 요구사항
- [`TRD.md`](./TRD.md) — 기술 요구사항
- [`CLAUDE.md`](./CLAUDE.md) — Claude Code 작업 규칙 (v2)
- [`DEMO.md`](./DEMO.md) — 시연 스크립트 (3~5분)
- [`VERCEL.md`](./VERCEL.md) — 배포 가이드
- [`design_handoff_geulgyeol/`](./design_handoff_geulgyeol/) — 디자인 핸드오프 (hi-fi)

---

## 기술 스택

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4** (디자인 토큰은 `styles/theme.css`)
- **Framer Motion** (Phase 2 부터)
- **Supabase** (PostgreSQL, Auth, Storage, RLS)
- **Toss Payments** Sandbox (Phase 4)
- **Anthropic Claude API** `claude-sonnet-4-6` (Phase 2)
- **Zod** + React Hook Form
- **TanStack Query v5**
- **Vercel** 배포

---

## 로컬 셋업

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) → New Project
2. **Project URL · anon key · service role key** 메모 (Project Settings → API)
3. SQL Editor에서 `supabase/migrations/0001_init.sql` 전체를 복사·실행
4. Authentication → Providers → **Email** 활성화 (Confirm email 옵션은 개발 시 끄는 걸 추천)
5. Authentication → Providers → **Google** 활성화 (아래 OAuth 가이드 참고)

### 3. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. **OAuth 2.0 Client ID** 생성 (Web application)
3. Authorized redirect URIs에 다음을 추가:
   - `https://<your-project>.supabase.co/auth/v1/callback`
4. 발급된 Client ID / Client Secret을 Supabase Dashboard → Authentication → Providers → Google 에 입력
5. Supabase Dashboard → Authentication → URL Configuration → **Site URL**: `http://localhost:3000`
6. **Redirect URLs**에 `http://localhost:3000/auth/callback` 추가

### 4. 환경변수

```bash
cp .env.local.example .env.local
# .env.local 을 열어 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY 채우기
```

### 5. 타입 자동 생성 (선택, 권장)

```bash
npm install -g supabase
supabase login
supabase gen types typescript --project-id <your-project-id> > types/db.ts
```

> Phase 1 동안은 [`types/db.ts`](./types/db.ts)의 수동 스키마로 작동하지만, CLI로 자동 생성한 결과로 교체하면 정확도가 올라갑니다.

### 6. 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속.

---

## 개발 명령어

```bash
npm run dev        # 개발 서버 (Turbopack)
npm run build      # 프로덕션 빌드
npm run start      # 빌드된 서버 실행
npm run lint       # ESLint
npx tsc --noEmit   # 타입 체크
```

---

## 폴더 구조

```
app/
  (auth)/login, signup        # 인증 화면
  (app)/                      # 인증된 사용자 영역 (proxy로 보호)
    today, feed, write, me, premium, g/[no]
  api/                        # Route Handlers (Phase 2+)
  auth/callback               # OAuth 콜백
components/shared/            # GGMark, GGIcon, GGNav, GGStars, ThemeToggle
lib/
  env/{public,server}.ts      # env 검증 (Zod). server.ts는 server-only.
  supabase/{client,server,middleware}.ts
styles/theme.css              # 디자인 토큰 (라이트/다크)
supabase/migrations/          # SQL 마이그레이션
types/db.ts                   # Supabase 타입 (CLI 자동생성)
proxy.ts                      # Next 16 proxy (구 middleware) — 보호 라우트
design_handoff_geulgyeol/     # 디자인 핸드오프 (참조용, lint 제외)
```

---

## 보안 메모

- `SUPABASE_SERVICE_ROLE_KEY`, `TOSS_SECRET_KEY`, `ANTHROPIC_API_KEY` 는 **서버 코드에서만** 사용
- `lib/env/server.ts` 가 `import "server-only"` 로 클라이언트 import 차단
- 클라이언트 번들에 `SERVICE_ROLE` 문자열 포함 여부 확인:
  ```bash
  grep -l "SERVICE_ROLE" .next/static/chunks/*.js
  # (출력 없어야 함)
  ```
- 모든 사용자 데이터 테이블에 **RLS 활성화** + 정책 적용 (`supabase/migrations/0001_init.sql`)

---

## 결제 샌드박스 (Phase 4) — 테스트 카드

`/premium` 에서 결제 시 토스 테스트 결제창이 뜨고, 다음 테스트 카드로 시연 가능합니다 (실결제 X).

| 항목 | 값 |
|---|---|
| 카드번호 | `4111 1111 1111 1111` (Visa) 또는 `5365 5025 8019 1222` |
| 만료일 (MM/YY) | 임의 미래 날짜 (예: `12/30`) |
| CVC | `123` |
| 비밀번호 앞 2자리 | 임의 (예: `00`) |
| 생년월일 | 임의 (예: `990101`) |

> 전부 토스가 공식 안내하는 샌드박스 더미 값. 실제 카드는 절대 사용하지 말 것 (TRD §6.3).

성공 시 `profiles.subscription_status='premium'`, `subscription_expires_at = now() + 30일` 갱신.

---

## RLS 침투 테스트 (TRD R-03)

Phase 1 종료 전 반드시 수행.

1. 두 개의 테스트 계정으로 가입 (A, B)
2. A로 로그인 후 글 작성 (Phase 3 까지는 SQL Editor에서 직접 INSERT)
3. B로 로그인 후 다음 SQL을 SQL Editor (★ anon key가 아닌 PostgREST 통해서 ★) 실행:
   ```sql
   select * from user_posts where visibility='private' and user_id != auth.uid();
   -- 결과: 0 rows
   select * from saved_items where user_id != auth.uid();
   -- 결과: 0 rows
   ```
4. 모두 비어있어야 통과.

자세한 절차는 Phase 1 종료 시 별도 문서화.

---

## 디자인 원칙 (조용한 방)

`CLAUDE.md` §7.3 + `design_handoff_geulgyeol/README.md` §2 를 따릅니다. 요약:

- ❌ 이모지, 토스트, 알림 다이얼로그, 빨간색 에러 박스 사용 금지
- ❌ 호버 시 `transform`, `scale`, `translateY` 변경 금지 (배경/색상만)
- ❌ `border-radius` 기본 0, `box-shadow` 거의 없음
- ❌ 하드코드 색상 (`#hex`, `rgb()`) 금지 — `var(--ink)` 같은 토큰만
- ✅ 본문 `Serif 21px / line-height 1.95` 가 정서의 핵심
- ✅ 페이드인 `0.8s ease-out`, 호버 `0.15s` 색상 변경

---

## 라이선스 / 저작권

학교 과제. 외부 글귀 시드 데이터 사용 금지 (PRD §8.1). AI 생성 또는 사용자 작성만 사용.
