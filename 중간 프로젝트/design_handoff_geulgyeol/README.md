# Handoff — 글결(Geulgyeol) Web (v0.2)

> 하루 3–5분, 한 편의 글을 나만의 속도로 읽고 간직하는 공간

이 폴더는 **글결** 서비스의 첫 번째 디자인 라운드를 Claude Code로 옮기기 위한 핸드오프 패키지입니다.

---

## 0. 이 번들이 무엇이고, 무엇이 아닌가

이 폴더의 HTML/JSX 파일들은 **디자인 레퍼런스**입니다 — 의도한 외형과 호흡을 보여주는 React 기반 프로토타입이지, 그대로 프로덕션에 붙일 코드가 아닙니다.

**작업 방향:**
1. 타겟 코드베이스(예: Next.js + Tailwind, Vite + CSS Modules, SvelteKit 등)가 있다면, **그 환경의 패턴/라이브러리에 맞게 화면을 다시 구현**합니다.
2. 코드베이스가 아직 없다면, PRD/TRD를 보고 **가장 적합한 스택을 선택**해서 구현합니다 (PRD에는 React/Next + TypeScript + 디자인 시스템 권장이 암시되어 있어요).
3. 디자인 토큰(`styles/theme.css`)은 그대로 옮길 수 있습니다 — `data-theme` 기반 라이트/다크 시스템.

## 1. Fidelity

**Hi-fi.** 컬러·타이포·여백·일러스트레이션이 의도된 값입니다. 픽셀 단위로 따라 구현해주세요. 단, **실제 본문 텍스트는 placeholder**(샘플 글 「안개가 지나간 자리」)이며 실제 운영 시엔 AI 큐레이션 결과물로 대체됩니다.

---

## 2. 디자인 철학 (반드시 읽어주세요)

PRD가 강조하는 정서를 코드에서도 잃지 않도록, 다음 원칙을 지켜주세요:

1. **타이포그래피 퍼스트** — 글자 하나하나가 주인공. 본문은 21px / line-height 1.95.
2. **조용한 방** — 토스트·팝업·알림·뱃지 카운트 등을 **의도적으로 비웠습니다**. 개발 시 라이브러리 기본값으로 다시 끼워넣지 마세요.
3. **드러남의 모션** — 페이드인 0.8s ease-out, 잉크 번지듯 천천히. snappy/bouncy 모션 금지.
4. **반응형** — 1440 데스크탑 기준. 모바일 360 / 태블릿 768은 다음 페이즈에서 대응 예정. 단 컴포넌트는 처음부터 fluid하게 짜주세요.
5. **이모지 / 화려한 일러스트 금지** — 헤어라인·라틴 ― ·일련번호(No. 047) 등 시집/매거진 어휘만 사용.

---

## 3. 디자인 토큰

### 컬러 — `data-theme` 기반 라이트/다크

`styles/theme.css`에 전부 있습니다. CSS 변수로 옮기시거나 Tailwind config로 변환해주세요.

**Light (새벽 안개)**
```
--bg:        #F4F3EF   페이퍼 베이스
--bg-2:      #ECEAE3   surface
--bg-3:      #E1E5E9   mist
--bg-4:      #C9D0D6   fog
--ink:       #1F2630   본문
--ink-deep:  #0F141B   제목
--ink-2:     #4F5862   부텍스트
--ink-3:     #8D96A0   메타
--ink-4:     #C9D0D6   disabled
--accent:       #4A6B8A   차가운 블루
--accent-soft:  #6E8AA6
--rule:         rgba(31,38,48,0.10)   헤어라인
--rule-strong:  rgba(31,38,48,0.22)
--btn-bg: #0F141B  --btn-fg: #F4F3EF
```

**Dark (밤하늘 잉크)**
```
--bg:        #0B0F16
--bg-2:      #11171F
--bg-3:      #161D27
--bg-4:      #1E2632
--ink:       #B5BBC5   본문
--ink-deep:  #F0EEE8   제목 (달빛)
--ink-2:     #6B7585
--ink-3:     #4A5568
--ink-4:     #2A3340
--accent:       #8FA8C2   달빛 블루
--accent-soft:  #5C7390
--rule:         rgba(240,238,232,0.08)
--rule-strong:  rgba(240,238,232,0.20)
--btn-bg: #F0EEE8  --btn-fg: #0B0F16
```

### 타이포

- **Serif** (본문/제목): `Noto Serif KR` (300/400/500/600) → fallback Source Serif 4, Iowan Old Style, Georgia
- **Sans** (UI/메타): `Inter Tight` (300/400/500/600) → fallback Pretendard, Apple SD Gothic Neo
- **Mono** (eyebrow/일련번호): `JetBrains Mono` (400/500)

| 용도 | 패밀리 | 크기 | line-height | letter-spacing | weight |
|---|---|---|---|---|---|
| 페이지 타이틀 | Serif | 56–64px | 1.2 | -0.02em | 400 |
| 섹션 제목 | Serif | 36–46px | 1.35 | -0.015em | 400 |
| 카드 제목 | Serif | 22–24px | 1.35 | -0.01em | 400 |
| 본문 (읽기) | Serif | **21px** | **1.95** | 0 | 400 |
| 본문 (일반) | Serif | 14–16px | 1.7 | 0 | 400 |
| eyebrow | Mono | 11px | 1 | **0.18em** | 400, UPPERCASE |
| 메타/일련번호 | Mono | 11px | 1.6 | 0.12em | 400 |
| 버튼 라벨 | Sans | 13px | 1 | 0.10–0.12em | 400 |
| 인풋 라벨 | Mono | 11px | — | 0.18em | UPPERCASE |

### 스페이싱 (8px 기준)

`--s-1:4 / --s-2:8 / --s-3:12 / --s-4:16 / --s-5:24 / --s-6:32 / --s-7:48 / --s-8:64 / --s-9:96 / --s-10:128`

### 모션

- **페이드인**: `opacity 0→1, transform translateY(8px)→0`, **0.8s ease-out**
- **호버**: `0.15s` 컬러/배경 변경만, transform 변경 금지
- **테마 전환**: 모든 `var()`에 `transition: background-color 0.4s ease, color 0.4s ease`

### 라운드 / 그림자

- **Border-radius**: 거의 0. 버튼·카드 모두 직각. 아바타·작은 토글만 `50%`.
- **Shadow**: 거의 없음. 풀스크린 포커스 모달 한 곳에만 `0 20px 80px rgba(0,0,0,0.4)`.

---

## 4. 컴포넌트 / 화면

각 화면은 `scripts/v2/` 안에 React 컴포넌트로 있습니다. 공통 컴포넌트(GGNav, GGIcon, GGMark, GGStars)는 `shared.jsx`에 있어요.

### 4.1 공통 컴포넌트

| 컴포넌트 | 파일 | 역할 |
|---|---|---|
| `GGMark` | shared.jsx | 로고 (원 + "결" 글자) |
| `GGNav` | shared.jsx | 상단 네비. items: 오늘 / 발견 / 아카이브 / 쓰기 / 마이 |
| `GGIcon` | shared.jsx | 인라인 SVG 아이콘 세트 (bookmark, heart, share, pen, search, arrow-*, moon, sun, plus) |
| `GGStars` | shared.jsx | 다크모드용 별 배경 (라이트모드에선 `--is-dark`로 자동 hidden) |

> **중요:** `.skin` / `.grain` / `.fog` / `.eyebrow` / `.hairline` 유틸리티 클래스는 `theme.css`에 정의되어 있고, 모든 화면 루트에 `className="skin grain"`이 붙어있습니다. Tailwind로 옮길 때 동등한 패턴(예: `bg-[--bg] text-[--ink]`)으로 재현해주세요.

### 4.2 화면 목록

| # | 화면 | 파일 | 사이즈 | 비고 |
|---|---|---|---|---|
| 00 | System Card | `system-card.jsx` | 1440×1200 | 디자인 시스템 요약 (구현 불필요) |
| 01 | Landing — Hybrid ★ | `landing-hybrid.jsx` | 1440×2820 | **메인 랜딩** |
| 01a | Landing — 아카이브 인덱스 | `landings.jsx` | 1440×1500 | 대안 1 |
| 01b | Landing — 숨 쉬는 한 문장 | `landings.jsx` | 1440×980 | 대안 2 |
| 02 | Login / Signup | `core-screens.jsx` `UScreenLogin` | 1440×980 | 좌(인용) + 우(폼) 분할 |
| 03 | Today (오늘의 글, 읽기) | `core-screens.jsx` `UScreenToday` | 1440×1460 | **핵심 시나리오** |
| 04 | Feed (발견 피드) | `core-screens.jsx` `UScreenFeed` | 1440×1570 | 2-column grid, 카테고리 필터 |
| 05 | Editor (글귀 작성) | `core-screens.jsx` `UScreenEditor` | 1440×980 | 제목 ≤40자, 본문 ≤600자 |
| 06 | Profile (마이페이지) | `core-screens.jsx` `UScreenProfile` | 1440×1100 | 4-stat, 3-tab |

### 4.3 메인 랜딩 (Hybrid) — 3단 호흡

**① 첫 화면 = 오늘의 글 그 자체** (PRD의 "0.5초 안에 첫 화면" 정신)
- 헤어라인 한 줄 헤더만 (로고 + 환영 문구 + 로그인/가입)
- 곧바로 No.047 「안개가 지나간 자리」 본문이 펼쳐짐
- 헤드라인·CTA·마케팅 카피 없음

**② 갈림길 = 두 페르소나 (읽는 지연 / 쓰는 민호)**
- 큰 카피: "오늘 당신은 *읽는 사람*인가요, 아니면 *쓰는 사람*인가요"
- 좌·우 50:50 분할, 오른쪽은 살짝 다른 surface(`--bg-2`)
- 각 방마다 페르소나 아바타 + 한 줄 헤드라인 + 설명 + CTA + 기능 3개 메타

**③ 합류 = 발견 피드 미리보기**
- "누군가의 한 문장은, 또 다른 누군가의 새벽이 됩니다."
- 3-column 카드 프리뷰 (No / 카테고리 / 제목 / 발췌 / 작성자 / 분량)

### 4.4 핵심 화면: Today (읽기)

가장 신경써서 구현해주세요. PRD의 모든 정서가 여기에 응축됩니다.

- **max-width: 780px**, 가운데 정렬, 96px 상단 여백
- 상단 메타 row: `No. 047` · `― 고요 ―` · `2026 · 04 · 27` (Mono 11px, eyebrow 스타일)
- 제목 (Serif 56px) → byline (Sans 13px, ink-3) → hairline → 본문 (Serif 21/1.95)
- **첫 단락**은 `text-indent: 0`, **2번째부터** `text-indent: 2em` (시집 어휘)
- 본문 끝에 `· · ·` (Mono, letter-spacing 0.5em, ink-4) — 마침표 3개의 호흡
- 태그 → **3등분 액션 row** (간직하기 / 감상 남기기 / 조용히 보내기) — 1px 구분선, 토스트 없음
- "1,284명이 오늘 함께 읽었어요" — 가운데 정렬, 단 하나의 사회적 표시
- 하단 어제/내일 글 nav (`var(--rule)` 1px 구분선)

---

## 5. 인터랙션 & 동작

### 5.1 라우팅

| Path | 화면 | 비고 |
|---|---|---|
| `/` | Landing (Hybrid) | 비로그인 |
| `/login`, `/signup` | Login | |
| `/today` | Today (No.047 = 오늘의 글) | 로그인 후 기본 진입 |
| `/feed` | Feed | |
| `/write` | Editor | |
| `/me` | Profile | |
| `/g/:no` | 특정 일련번호 글 | Today과 같은 컴포넌트, 다른 데이터 |

### 5.2 핵심 인터랙션

| 위치 | 동작 | 결과 |
|---|---|---|
| Today / 간직하기 | 클릭 | 잉크 번지듯 페이드 0.8s, 라벨 → "간직됨", 토스트 없음 |
| Today / 감상 남기기 | 클릭 | 우측 사이드 시트 슬라이드인 (다음 페이즈) |
| Today / 조용히 보내기 | 클릭 | 링크 클립보드 복사, 헤어라인 한 줄 인라인 메시지 (토스트 X) |
| Editor / 발행 | 클릭 | 페이드아웃 후 `/g/:no` 본인 글로 이동 |
| 어디든 / 테마 토글 | 클릭 | `<html data-theme>` 전환, 0.4s 색 트랜지션 |
| Feed / 카드 호버 | hover | 배경만 `--bg-2`로 0.15s 페이드. transform 변경 금지 |

### 5.3 폼 검증

- 제목: 1–40자, **공백만은 불가**
- 본문: 1–600자
- 카운터는 입력 옆에 항상 노출 (`187 / 600자`), 제한 도달 시 `--accent`로 색만 변함
- 에러는 빨간색 박스가 아니라 **헤어라인 1px + Mono 11px 메시지**로 표현

---

## 6. 상태 관리 (제안)

PRD/TRD 기반으로 다음 상태가 필요합니다 — 라이브러리 선택은 자유 (Zustand / Redux Toolkit / Jotai 등).

```ts
// User
type User = { id, email, name, joinedAt, membership: 'free' | 'plus' }

// Post (글결)
type Post = {
  no: number          // 047
  date: string        // 2026-04-27
  category: '고요'|'위로'|'사랑'|'용기'|'그리움'|'사색'
  title: string       // ≤ 40
  body: string        // ≤ 600
  byline: string
  tags: string[]
  author: User | 'curated'
  likes: number
  reads: number
  visibility: 'public' | 'private'
  isAiAssisted: boolean
}

// User actions on post
type UserPostState = {
  saved: boolean
  liked: boolean
  diaryEntry?: { text, createdAt }
}

// Theme
type Theme = 'light' | 'dark'   // localStorage에 저장
```

### 데이터 fetching (TRD 기반)

- `GET /api/today` → 오늘의 큐레이션 1편
- `GET /api/posts/:no` → 특정 일련번호
- `GET /api/feed?cat=&cursor=` → 무한 스크롤
- `POST /api/posts/:no/save` / `DELETE`
- `POST /api/posts/:no/like` / `DELETE`
- `POST /api/posts` (에디터)
- `GET /api/me/saved` / `/written` / `/diary`

자세한 스펙은 TRD 참고. SWR 또는 React Query 권장.

---

## 7. 모바일 대응 (다음 페이즈)

이번 라운드는 1440 데스크탑이지만, 다음 페이즈 모바일 대응을 위해 **처음부터 다음 원칙으로 짜주세요**:

- 컨테이너에 `max-width: 780px` (Today) / `1200px` (Feed) 같은 hard cap만 두고 그 외엔 fluid
- Today 화면은 모바일에서 좌우 패딩 24px, 본문 18px / 1.85로 축소
- Feed 2-col → 모바일 1-col, 카드 그리드는 미리부터 CSS Grid로
- Hybrid 랜딩의 ② 갈림길은 모바일에선 **세로 스택** (좌→상, 우→하), 그 사이 hairline 추가
- GGNav는 모바일에선 하단 탭바 (5개 아이콘)로 전환

---

## 8. 파일 매니페스트

```
design_handoff_geulgyeol/
├── README.md                        ← 이 문서
├── PRD.md                           ← 원본 PRD
├── 글결 디자인 탐색 v2.html         ← 메인 프리뷰 (브라우저로 열어 확인)
├── design-canvas.jsx                ← 디자인 캔버스 셸 (구현 불필요)
├── styles/
│   └── theme.css                    ← ★ 디자인 토큰 — 이 파일은 그대로 이식 권장
└── scripts/v2/
    ├── shared.jsx                   ← 공통 컴포넌트 (Nav, Icon, Mark, Stars) + 샘플 데이터
    ├── system-card.jsx              ← 디자인 시스템 카드 (구현 불필요)
    ├── landings.jsx                 ← 대안 랜딩 2개
    ├── landing-hybrid.jsx           ← ★ 메인 랜딩
    └── core-screens.jsx             ← Today / Feed / Editor / Profile / Login
```

브라우저에서 `글결 디자인 탐색 v2.html`을 열면 캔버스 위에 모든 화면이 펼쳐지고, 우측 상단 토글로 라이트/다크를 전환할 수 있어요. 풀스크린(아트보드 라벨 클릭) 모드에서 화면별로 픽셀을 확인하실 수 있습니다.

---

## 9. 첫 작업 추천 순서

1. `theme.css`를 코드베이스 컨벤션에 맞게 이식 (CSS 변수 또는 Tailwind config)
2. `GGMark`, `GGIcon`, `GGNav` 공통 컴포넌트 구현
3. **Today 화면** 먼저 구현 (가장 정서가 응축된 곳)
4. Login → Hybrid Landing → Feed → Editor → Profile 순
5. 테마 토글 (`<html data-theme>` + localStorage 동기화)
6. 모션 — 페이드인만 먼저, 잉크 번짐은 다음 페이즈

좋은 결로 옮겨주세요. 🌫️
