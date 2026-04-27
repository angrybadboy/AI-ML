import Link from "next/link";
import { GGStars } from "@/components/shared/GGStars";
import { StaggeredParagraphs } from "@/components/motion/StaggeredParagraphs";
import { QuoteActions } from "./QuoteActions";
import type { Database } from "@/types/db";

type DailyQuote = Database["public"]["Tables"]["daily_quotes"]["Row"];

type NavItem = {
  serial_no: number;
  title: string;
} | null;

type Props = {
  quote: DailyQuote;
  isSaved: boolean;
  reads: number;
  prev: NavItem;
  next: NavItem;
};

/**
 * 핵심 화면 — UScreenToday 디자인 그대로.
 * Today (/today)와 특정 일련번호 (/g/:no)에서 같은 컴포넌트를 사용한다.
 * 부모 layout이 .skin .grain 을 이미 적용한 상태에서 main만 렌더.
 */
export function QuoteView({ quote, isSaved, reads, prev, next }: Props) {
  const paragraphs = quote.body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const dateStr = formatKoreanDate(quote.date);
  const serial = `No. ${String(quote.serial_no).padStart(3, "0")}`;
  const byline =
    quote.source_type === "ai"
      ? "글결 큐레이션 · AI 보조 작성"
      : "글결 큐레이션";

  return (
    <div className="fog" style={{ position: "relative" }}>
      <GGStars count={50} w={1440} h={1460} />
      <main
        className="gg-quote-main"
        style={{
          padding: "96px 24px 80px",
          maxWidth: 780,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* 메타 row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 56,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <span>{serial}</span>
          <span style={{ color: "var(--accent)" }}>― {quote.category} ―</span>
          <span>{dateStr}</span>
        </div>

        <h1
          className="heading gg-h1-large"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 56,
            fontWeight: 400,
            lineHeight: 1.25,
            margin: "0 0 12px",
            letterSpacing: "-0.018em",
          }}
        >
          {quote.title}
        </h1>

        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "var(--ink-3)",
            marginBottom: 64,
            letterSpacing: "0.04em",
          }}
        >
          {byline}
        </div>

        <hr className="hairline" style={{ marginBottom: 56 }} />

        <StaggeredParagraphs paragraphs={paragraphs} />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "48px 0",
            fontFamily: "var(--font-mono)",
            color: "var(--ink-4)",
            letterSpacing: "0.5em",
          }}
        >
          · · ·
        </div>

        {quote.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 64,
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              flexWrap: "wrap",
            }}
          >
            {quote.tags.map((t, i) => (
              <span
                key={i}
                style={{
                  padding: "6px 12px",
                  border: "1px solid var(--rule-strong)",
                  color: "var(--ink-2)",
                  letterSpacing: "0.04em",
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <QuoteActions quoteId={quote.id} initialSaved={isSaved} />

        <div
          style={{
            textAlign: "center",
            marginTop: 48,
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--ink-3)",
            letterSpacing: "0.06em",
          }}
        >
          {reads === 0
            ? "조용히, 가장 먼저 읽고 계세요."
            : `${reads.toLocaleString("ko-KR")}명이 오늘 함께 읽었어요`}
        </div>

        {/* 이전/다음 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 96,
            paddingTop: 24,
            borderTop: "1px solid var(--rule)",
            fontFamily: "var(--font-serif)",
            gap: 24,
          }}
        >
          <PrevNext direction="prev" item={prev} />
          <PrevNext direction="next" item={next} />
        </div>
      </main>
    </div>
  );
}

function PrevNext({
  direction,
  item,
}: {
  direction: "prev" | "next";
  item: NavItem;
}) {
  const isNext = direction === "next";
  const align = isNext ? "right" : "left";
  const eyebrow = isNext ? "내일" : "어제의 글";
  const placeholder = isNext ? "새벽 5시에 도착합니다" : "아직 첫 결입니다";

  if (!item) {
    return (
      <div style={{ maxWidth: 300, textAlign: align }}>
        <div className="eyebrow faint" style={{ marginBottom: 8 }}>
          {eyebrow}
        </div>
        <div style={{ fontSize: 18, color: "var(--ink-3)" }}>
          {placeholder}
        </div>
      </div>
    );
  }

  const href = `/g/${item.serial_no}`;
  return (
    <Link
      href={href}
      style={{
        maxWidth: 300,
        textAlign: align,
        textDecoration: "none",
        color: "inherit",
        transition: "color 0.15s ease",
      }}
    >
      <div className="eyebrow faint" style={{ marginBottom: 8 }}>
        {eyebrow}
      </div>
      <div style={{ fontSize: 18, color: "var(--ink)" }}>{item.title}</div>
    </Link>
  );
}

function formatKoreanDate(isoDate: string): string {
  // "2026-04-27" → "2026 · 04 · 27"
  return isoDate.replaceAll("-", " · ");
}
