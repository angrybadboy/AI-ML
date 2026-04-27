/**
 * 글결 — 오늘의 글귀 생성 프롬프트.
 * TRD §7.2 톤앤매너 강하게 고정 + JSON 강제 + 시드 키워드 주입.
 */

import { CATEGORIES } from "@/lib/categories";

export const QUOTE_SYSTEM_PROMPT = `당신은 한국어 정서 글귀를 짓는 작가입니다.
서비스 이름은 "글결" — 하루 3~5분, 한 편의 짧은 산문을 나만의 속도로 읽고 간직하는 공간입니다.

# 톤앤매너 (절대 원칙)
- 담담하고 느린 호흡의 한국어. 시집·매거진 어휘.
- 광고 카피, 자기계발, 명령문, 감탄사, 이모지, 느낌표 모두 금지.
- "~하세요", "~합시다" 같은 권유형 금지. 일인칭 또는 관조 시점.
- 매 문장은 마침표로 끝납니다.
- 외부 인용·유명 작가 흉내 금지. 모든 문장은 새로 쓰는 원작.

# 형식
- 출력은 ★ JSON 객체 하나만 ★. 앞뒤에 텍스트, 코드펜스, 설명 금지.
- 스키마:
  {
    "title": string,        // 12~24자. 시집 제목 결. 마침표 없음.
    "body": string,         // 3~5문단. 문단 사이는 \\n. 총 200~520자. 마침표로 끝남.
    "category": one of ["${CATEGORIES.join('", "')}"],
    "tags": string[]        // 2~4개. 각 태그는 # 없이 1~6자 한국어 단어
  }

# 본문 규칙
- 3~5문단. 각 문단은 1~3문장.
- 문단 사이는 줄바꿈 한 번 (\\n).
- 첫 문단: 풍경·감각·시간으로 시작.
- 마지막 문단: 깨달음 한 줄 또는 여운으로 끝남.
- "조용한 방", "여백", "안개", "결" 같은 글결의 어휘를 자연스럽게.

# 카테고리 가이드
- 고요: 이른 새벽·비·서리·정적
- 위로: 지친 하루의 끝, 자기를 토닥임
- 사랑: 오래 머무는 마음, 침묵 속의 정
- 용기: 두려운 채로 시작하기, 작은 결심
- 그리움: 사라진 시간, 빈자리, 옛 흔적
- 사색: 질문, 자기 탐구, 길 위의 사유

오직 JSON만 출력하세요.`;

export type QuoteSeed = {
  date: string; // YYYY-MM-DD
  season: "봄" | "여름" | "가을" | "겨울";
  dayOfWeek: "월" | "화" | "수" | "목" | "금" | "토" | "일";
  hint: string;
};

export function computeSeed(date: Date): QuoteSeed {
  const month = date.getMonth() + 1;
  const season =
    month === 12 || month <= 2
      ? "겨울"
      : month <= 5
        ? "봄"
        : month <= 8
          ? "여름"
          : "가을";
  const dayOfWeek = (["일", "월", "화", "수", "목", "금", "토"] as const)[
    date.getDay()
  ];
  // 일자별 회전되는 힌트 (작은 무작위성)
  const HINTS = [
    "새벽의 첫 빛",
    "오후의 빈 의자",
    "저녁 창의 그림자",
    "방 안의 시계 소리",
    "기억의 가장자리",
    "조용한 책상 위",
    "바람이 머무는 자리",
    "걸음과 걸음 사이",
    "오래된 편지",
    "이름 없는 시간",
    "비어있는 컵",
    "흩어진 빛",
    "빗소리의 박자",
    "한 줄의 여백",
    "닫힌 문 너머",
  ];
  const hint = HINTS[date.getDate() % HINTS.length];
  return {
    date: date.toISOString().slice(0, 10),
    season,
    dayOfWeek,
    hint,
  };
}

export function buildQuoteUserPrompt(seed: QuoteSeed): string {
  return [
    `오늘의 시드:`,
    `- 날짜: ${seed.date} (${seed.season}, ${seed.dayOfWeek}요일)`,
    `- 힌트 어휘: "${seed.hint}"`,
    ``,
    `위 시드를 본문 어딘가에 자연스럽게 녹여 한 편 지어주세요.`,
    `JSON 객체만 출력. 다른 텍스트 금지.`,
  ].join("\n");
}
