# VERCEL.md — 글결 Vercel 배포 가이드

> Phase 5 Exit Criterion: **`npm run build` 성공, Vercel 배포 성공**.
> 첫 배포 20~30분, 두 번째부터는 git push 한 번이면 자동 배포.

---

## 1. Git 초기화 + GitHub 푸시 (5분)

지금까지 git 없이 작업했으므로 첫 푸시.

```bash
cd "/Users/admin/Desktop/글결-프로젝트"
git init
git branch -M main
git add -A
git status   # .env.local 이 빠져있는지 확인 (.gitignore가 막아줌)
git commit -m "Initial commit — Phase 1~5 complete"
```

GitHub에서 새 private repo 생성 (예: `geulgyeol`). README 추가하지 말 것 (이미 있음).

```bash
git remote add origin https://github.com/<your-username>/geulgyeol.git
git push -u origin main
```

---

## 2. Vercel 가입 + 프로젝트 import (5분)

1. [vercel.com](https://vercel.com) 접속 → **Sign Up** → **Continue with GitHub** (가장 매끄러움)
2. 가입 후 대시보드 → **Add New… → Project** → 방금 만든 repo `geulgyeol` 선택
3. Configure Project 화면:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: 그대로 (프로젝트 루트)
   - **Build Command** / **Output Directory**: 기본값 그대로
4. **Environment Variables** 섹션 펼치기 — 7개 추가:

| Key | Value (각자 .env.local 에서 복사) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | `test_ck_...` |
| `TOSS_SECRET_KEY` | `test_sk_...` |
| `NEXT_PUBLIC_APP_URL` | (비워둠 — 4단계 후 채움) |

5. **Deploy** 클릭. 첫 빌드 약 2~3분.

---

## 3. 도메인 확인 + 후속 환경변수 갱신 (5분)

배포 완료 화면에 노출되는 도메인 확인 — 보통 `geulgyeol-<해시>.vercel.app` 형태.

### (a) NEXT_PUBLIC_APP_URL 채우기

대시보드 → **Settings → Environment Variables** → `NEXT_PUBLIC_APP_URL` 편집:

```
https://geulgyeol-xxxxx.vercel.app
```

저장 후 **Deployments** 탭 → 최신 배포 옆 메뉴 → **Redeploy** (env 반영).

### (b) Supabase Site URL + Redirect URLs 추가

Supabase 대시보드 → **Authentication → URL Configuration**:

- **Site URL**: `https://geulgyeol-xxxxx.vercel.app` 으로 변경 (또는 두 개 모두 허용 시 그대로 둔 채 Redirect URLs만 추가)
- **Redirect URLs** 에 한 줄 추가:
  ```
  https://geulgyeol-xxxxx.vercel.app/auth/callback
  ```

저장.

### (c) Google OAuth Authorized redirect URIs 갱신

[Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → 글결 OAuth client ID:

기존 `https://<project>.supabase.co/auth/v1/callback` 한 줄 그대로 두면 됩니다 — Supabase가 중계하므로 Google 쪽은 수정 불필요.

> 만약 OAuth consent screen이 아직 **Testing** 모드라면, 본인 이메일이 **Test users** 에 등록되어 있는지 확인. 외부 사용자가 시연을 보려면 **Publishing status** 를 **In production** 으로 올려야 함 (Google 검수 필요. 검수 안 받아도 본인 + test users는 가능).

---

## 4. 배포 검증 (5분)

배포 도메인에서 다음을 차례로:

- [ ] `/` (랜딩) 200 — Hybrid 랜딩 노출, 오늘의 글 미리보기
- [ ] `/login` → 가입 → `/today` 진입
- [ ] Today 화면에 오늘의 글 정상 노출 (Claude API 호출 성공)
- [ ] `/write` → 글 작성 → 발행 → `/p/[no]` 이동
- [ ] `/feed` 에 작성한 글 노출 (public)
- [ ] `/me` 4-stat + 3-tab 동작
- [ ] `/premium` → 결제창 (Toss 샌드박스) → 테스트 카드 → `/payment/success`
- [ ] 다크모드 토글 → 0.4s 페이드 색 전환
- [ ] 모바일 (Chrome DevTools → 360 / 768 모드) 에서 레이아웃 미파손

---

## 5. 그 다음에 할 일 (선택)

### 사용자 도메인 연결

Vercel → **Settings → Domains** → Add → 본인 도메인 입력 → DNS A 레코드 또는 CNAME 등록 안내대로.

도메인 연결 후엔 위 (a), (b) 의 URL 을 새 도메인으로 갱신.

### 자동 배포

이후 `git push` 만 하면 Vercel 이 자동으로 빌드·배포. PR마다 Preview 환경도 자동 생성됨.

### Logs / Observability

Vercel → **Logs** 탭에서 최근 요청·에러 확인. AI/결제 에러는 여기로 흐름.

---

좋은 결로 띄우시길. 🌫️
