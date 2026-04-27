# Design × Phase 매트릭스 — 글결

> 디자인 핸드오프 화면 ↔ Phase 매핑 한 페이지 요약. 어떤 화면을 어떤 Phase에서 만들지, 각 화면의 핵심 디자인 포인트가 무엇인지 한눈에 보이게.

---

## 화면-Phase 매트릭스

| # | 화면 | 디자인 파일 | Phase | 우선순위 |
|---|------|-------------|-------|---------|
| 01 | **공통 컴포넌트** (GGMark, GGIcon, GGNav, GGStars) | `shared.jsx` | **1** | 최우선 (모든 화면이 의존) |
| 02 | **Login / Signup** | `core-screens.jsx` `UScreenLogin` | **1** | 인증 동시 |
| 03 | **Today (오늘의 글, 읽기) ★** | `core-screens.jsx` `UScreenToday` | **2** | ★ 정서적 핵심 — Phase 2 가장 먼저 |
| 04 | **Hybrid 랜딩** | `landing-hybrid.jsx` `LandingHybrid` | **2** | Today 컴포넌트 재활용 가능 |
| 05 | **Editor (글귀 작성)** | `core-screens.jsx` `UScreenEditor` | **3** | |
| 06 | **Feed (발견 피드)** | `core-screens.jsx` `UScreenFeed` | **3** | |
| 07 | **Profile (마이페이지)** | `core-screens.jsx` `UScreenProfile` | **3** | |
| 08 | **Premium (결제 유도)** | (디자인 없음) | **4** | Today/Feed 톤 따라 자체 구성 |
| 09 | **Payment 결과 페이지** | (디자인 없음) | **4** | 한 화면 한 메시지 |
| - | **모션 디테일 + 반응형 + 다크모드** | README §5.2, §7 | **5** | 통합 폴리시 |

**무시 (구현 불필요):**
- `system-card.jsx` — 디자인 시스템 요약 카드
- `landings.jsx` — 대안 랜딩 (hybrid로 통합됨)
- `variation-a/b*.jsx`, `design-canvas.jsx` — 초기 탐색 작업물

---

## 화면별 핵심 픽셀 값 (빠른 참조)

### Today ★
```
컨테이너: width 1440 / minHeight 1460 / "skin grain fog"
main: padding "96px 0 80px" / maxWidth 780 / 가운데 정렬
메타 row: Mono 11px / ls 0.16em / UPPERCASE / marginBottom 56px
제목 h1: Serif 56px / weight 400 / lineHeight 1.25 / ls -0.018em
byline: Sans 13px / ink-3 / marginBottom 64px
hairline: marginBottom 56px
본문 p: Serif 21px / lineHeight 1.95 / margin "0 0 32px"
  ★ 첫 단락 textIndent 0 + className="heading"
  ★ 2번째부터 textIndent 2em
"· · ·" 구분: Mono / ls 0.5em / ink-4 / margin "48px 0"
태그: 6px 12px padding / border 1px rule-strong / Sans 12px
액션 row: grid 1fr 1fr 1fr / borderTop borderBottom 1px rule
  각 버튼: GGIcon 20px / 라벨 Serif 16px / 서브 Sans 11px ink-3
"N명이 오늘 함께 읽었어요": Sans 12px / ink-3 / 가운데
어제·내일 nav: marginTop 96px / borderTop 1px rule / Serif 18px
```

### Hybrid 랜딩
```
컨테이너: width 1440 / minHeight 2680 / "skin grain"
헤더: padding "22px 56px" / borderBottom 1px rule / Mono 11px ink-3
본문: maxWidth 760 / paddingTop 104px (Today와 동일 구조)
갈림길 ②: maxWidth 1040 / padding "112px 0 80px" / 가운데
  - h2: Serif 72px / weight 400 / lineHeight 1.15 / ls -0.025em
  - "읽는 사람" / "쓰는 사람" em italic + var(--accent)
두 방: gridTemplateColumns "1fr 1fr" / 좌(--bg) 우(--bg-2) / minHeight 560
  각 방 padding "64px 64px"
  아바타 48x48 / borderRadius 50% / Serif 20px
  헤드라인 Serif 36px
  CTA: Sans 13px / ls 0.12em
③ 미리보기: maxWidth 1200 / 3-col grid / 카드 padding "32px 28px"
푸터: padding "40px 56px 48px" / Mono 11px ink-3
```

### Login
```
컨테이너: width 1440 / minHeight 980 / grid 1fr 1fr / "skin fog"
GGStars count 70, w 720, h 980 (좌측만)
좌 패널: padding "56px 64px" / borderRight 1px rule
  로고 (GGMark 24) + 글결
  중간: 인용 Serif 40px / lineHeight 1.5
  하단: 날짜 Mono 11px ls 0.16em
우 패널: padding "56px 64px" / maxWidth 520 / 가운데
  eyebrow "― 다시 만났네요"
  h2: Serif 46px / 2줄
  input: borderBottom 1px rule-strong / Serif 18px / outline none
  로그인 버튼: btn-bg / Sans 13px / ls 0.12em
  Google 버튼: 투명 + border 1px rule-strong
```

### Editor
```
컨테이너: width 1440 / minHeight 980 / "skin grain"
main: padding "72px 0" / maxWidth 780 / 가운데
메타: Mono 11px / ls 0.18em / "― 새 글결 ―" + "자동 저장 · N분 전"
제목 input: Serif 46px / weight 400 / borderBottom 1px rule / outline none
카테고리 칩: padding "4px 10px" / border 1px rule-strong / Sans 11px
textarea: Serif 21px / lineHeight 1.95 / outline none / resize none / height 280px
카운터: Sans 12px / ink-3
공개/비공개 토글: padding "8px 14px" / Sans 12px
발행 버튼: btn-bg / padding "16px 32px" / Sans 13px / ls 0.12em
```

### Feed
```
컨테이너: width 1440 / minHeight 1570 / "skin grain"
타이틀 영역: gridTemplateColumns "5fr 7fr" / gap 64
  h2: Serif 60px / weight 400 / lineHeight 1.1
필터 칩: padding "10px 18px" / Sans 12px / ls 0.06em
  선택: btn-bg / btn-fg
  비선택: 투명 / border 1px rule-strong
카드 그리드: 2-col / gap 1 / background var(--rule) (구분선 효과)
  카드: padding 36px / minHeight 220 / 큰 일련번호 Mono 38px ink-3
  타이틀 Serif 24px / weight 400
  발췌 Serif 14px / lineHeight 1.7 / ink-2
  메타 Sans 11px / ink-3
호버: background만 var(--bg-2)로 0.15s 페이드 (transform 절대 금지)
```

### Profile
```
컨테이너: width 1440 / minHeight 1100 / "skin grain"
상단 섹션: gridTemplateColumns "4fr 8fr" / gap 64 / paddingBottom 64
  아바타 148x148 / borderRadius 50% / Serif 60px
  이름 h1: Serif 42px / weight 400
  바이오 Serif 15px / ink-2
  4-stat 그리드: repeat(4, 1fr) / gap 1 / background rule
    각 stat: padding "28px 24px" / 라벨 eyebrow / 값 Serif 36px
  3-tab: Serif 16px / 활성탭 borderBottom 1px var(--accent)
6-card 그리드: 3-col / gap 1 / 각 카드 padding 32px / minHeight 200
```

---

## 디자인 토큰 빠른 참조

### 컬러 (light)
- `--bg` `#F4F3EF` 페이퍼 / `--bg-2` `#ECEAE3` surface
- `--ink` `#1F2630` 본문 / `--ink-deep` `#0F141B` 제목 / `--ink-3` `#8D96A0` 메타
- `--accent` `#4A6B8A` 차가운 블루
- `--rule` `rgba(31,38,48,0.10)` 헤어라인

### 컬러 (dark)
- `--bg` `#0B0F16` / `--ink-deep` `#F0EEE8` (달빛)
- `--accent` `#8FA8C2` 달빛 블루

### 타이포 핵심
- 본문 (읽기) = **Serif 21px / lineHeight 1.95**
- 제목 = Serif 56–64px / weight 400
- eyebrow = Mono 11px / UPPERCASE / ls 0.18em
- 버튼 = Sans 13px / ls 0.10–0.12em

### 모션
- 페이드인: `opacity 0→1, translateY(8px)→0, 0.8s ease-out`
- 호버: `0.15s` 컬러만 (transform 금지)
- 테마 전환: `0.4s ease`

---

## 절대 금지 (한눈에)

| 카테고리 | 금지 |
|---------|------|
| 시각 요소 | 이모지 / 빨간 에러 박스 / 둥근 모서리 / 그림자 |
| 알림 | 토스트 / popup / alert / confirm / 배지 카운트 |
| 모션 | spring / bounce / easeInOut / transform 호버 |
| 코드 | 하드코드 #hex / 임의 토큰 추가 / 핸드오프 jsx 무시 |

---

## 추천 작업 순서 (한 줄 요약)

```
Phase 1: theme.css 이식 → 공통 컴포넌트 → Auth/DB → Login 화면 → 테마 토글
Phase 2: 폴백 풀 시드 → Today (★ 가장 먼저) → /api/quote/today → SaveButton → Hybrid 랜딩
Phase 3: Editor → Feed → Profile (RLS 검증 필수)
Phase 4: Toss SDK → /api/payment/* → Premium → 성공/실패 페이지 (amount 변조 검증 필수)
Phase 5: 모션 정교화 → 반응형 (360/768/1440) → 다크모드 점검 → README → 시연 영상
```
