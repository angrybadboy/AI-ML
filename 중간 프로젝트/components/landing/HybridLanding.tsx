import Link from "next/link";
import { GGMark } from "@/components/shared/GGMark";
import { GGIcon } from "@/components/shared/GGIcon";
import type { Database } from "@/types/db";

type DailyQuote = Database["public"]["Tables"]["daily_quotes"]["Row"];

type Props = {
  /** 오늘의 글 미리보기. 아직 생성되지 않았으면 null. */
  preview: DailyQuote | null;
};

/**
 * Hybrid 랜딩 — `landing-hybrid.jsx` 디자인 그대로.
 * 3단 호흡: ① 오늘의 글 즉시 펼쳐짐 → ② 갈림길 (지연/민호) → ③ 발견 피드 미리보기
 * CTA·헤드라인 없이 본문이 첫 화면. PRD "0.5초 안에 첫 화면" 정신.
 */
export function HybridLanding({ preview }: Props) {
  const sample = preview ?? STATIC_SAMPLE;
  const paragraphs = sample.body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const dateStr = sample.date.replaceAll("-", " · ");
  const serial = `No. ${String(sample.serial_no).padStart(3, "0")}`;
  const byline =
    sample.source_type === "ai"
      ? "글결 큐레이션 · AI 보조 작성"
      : "글결 큐레이션";

  return (
    <div className="skin grain" style={{ minHeight: "100dvh", position: "relative" }}>
      {/* ⓞ 헤어라인 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 56px",
          borderBottom: "1px solid var(--rule)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-3)",
          letterSpacing: "0.16em",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <GGMark size={18} color="var(--ink-deep)" />
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 14,
              color: "var(--ink-deep)",
              letterSpacing: "0.04em",
            }}
          >
            글결
          </span>
        </Link>
        <span style={{ display: "none", textAlign: "center" }} className="hidden md:inline">
          ― 글결에 오신 걸 환영합니다. 오늘의 글이 이미 펼쳐져 있어요.
        </span>
        <span style={{ display: "flex", gap: 16, fontFamily: "var(--font-sans)" }}>
          <Link
            href="/login"
            style={{ color: "var(--ink-deep)", textDecoration: "none" }}
          >
            로그인
          </Link>
          <span style={{ color: "var(--ink-3)" }}>·</span>
          <Link
            href="/signup"
            style={{ color: "var(--ink-2)", textDecoration: "none" }}
          >
            가입
          </Link>
        </span>
      </div>

      {/* ① 오늘의 글 그 자체 */}
      <main
        className="gg-page-main"
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "104px 24px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 64,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.18em",
          }}
        >
          <span>{serial}</span>
          <span style={{ color: "var(--accent)" }}>― {sample.category} ―</span>
          <span>{dateStr}</span>
        </div>
        <h1
          className="heading gg-h1-large"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 64,
            fontWeight: 400,
            lineHeight: 1.2,
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
          }}
        >
          {sample.title}
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
        {paragraphs.map((line, i) => (
          <p
            key={i}
            className={i === 0 ? "heading" : undefined}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 21,
              lineHeight: 1.95,
              margin: "0 0 32px",
              textIndent: i === 0 ? 0 : "2em",
            }}
          >
            {line}
          </p>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "56px 0 0",
            fontFamily: "var(--font-mono)",
            color: "var(--ink-4)",
            letterSpacing: "0.5em",
          }}
        >
          · · ·
        </div>
      </main>

      {/* ② 갈림길 */}
      <section
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "112px 24px 80px",
          textAlign: "center",
        }}
      >
        <div className="eyebrow accent" style={{ marginBottom: 32 }}>
          ― 그리고 이곳은
        </div>
        <h2
          className="heading"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 56,
            fontWeight: 400,
            lineHeight: 1.15,
            margin: "0 0 32px",
            letterSpacing: "-0.025em",
          }}
        >
          오늘 당신은{" "}
          <em style={{ fontStyle: "italic", color: "var(--accent)" }}>
            읽는 사람
          </em>
          인가요,
          <br />
          아니면{" "}
          <em style={{ fontStyle: "italic", color: "var(--accent)" }}>
            쓰는 사람
          </em>
          인가요.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            color: "var(--ink-2)",
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          글결은 두 가지 마음 모두를 위한 자리입니다.
          <br />
          어느 쪽이든 들어와서, 잠시 쉬어가세요.
        </p>
      </section>

      {/* 두 방 */}
      <section
        className="gg-grid-2col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderTop: "1px solid var(--rule)",
          borderBottom: "1px solid var(--rule)",
          minHeight: 560,
        }}
      >
        <PersonaCard
          letter="지"
          letterBg="var(--bg-3)"
          eyebrow="― 읽는 사람"
          name="지연 (28)"
          headline={
            <>
              스크린샷 폴더에 마음들이
              <br />
              흩어져 있어요.
            </>
          }
          description="SNS에서 만난 글귀가 1,000장의 스크린샷으로 잠들어 있다면 — 이곳에서 다시 찾을 수 있도록 옮겨드릴게요. 하루 한 편의 글이 도착하고, 마음에 들면 가만히 간직됩니다."
          ctaLabel="읽는 자리로 들어가기"
          ctaHref="/signup"
          ctaIcon="arrow-right"
          ctaInverse
          metas={["하루 1편 무료", "저장·아카이브", "감상 일기"]}
        />
        <PersonaCard
          letter="민"
          letterBg="var(--bg-4)"
          eyebrow="― 쓰는 사람"
          name="민호 (24)"
          headlineItalic
          headline={
            <>
              메모앱 속 문장들,
              <br />
              가벼운 자리로 옮겨봐요.
            </>
          }
          description="블로그는 부담스럽고, 인스타는 노출이 무서운 사람을 위한 미니 에디터. 제목 한 줄, 본문 600자. 익명으로 발견 피드에 띄우거나, 비공개로만 간직할 수도 있어요."
          ctaLabel="쓰는 자리로 들어가기"
          ctaHref="/signup"
          ctaIcon="pen"
          metas={["600자 미니 에디터", "공개 / 비공개", "익명 발행"]}
          surface
        />
      </section>

      {/* ③ 발견 피드 미리보기 */}
      <section style={{ padding: "96px 24px 64px", textAlign: "center" }}>
        <div className="eyebrow muted" style={{ marginBottom: 24 }}>
          ― 그리고 두 사람이 같은 자리에서 만나는 곳
        </div>
        <h2
          className="heading"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 46,
            fontWeight: 400,
            lineHeight: 1.35,
            margin: "0 0 16px",
            letterSpacing: "-0.015em",
          }}
        >
          누군가의 한 문장은,
          <br />또 다른 누군가의 새벽이 됩니다.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 16,
            color: "var(--ink-3)",
            margin: "0 auto 56px",
            maxWidth: 520,
            lineHeight: 1.7,
          }}
        >
          오늘 발견 피드에 도착한 글결을 잠시 둘러보세요.
        </p>

        <div
          className="gg-grid-3col"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1,
            background: "var(--rule)",
            border: "1px solid var(--rule)",
            textAlign: "left",
          }}
        >
          {FEED_PREVIEW.map((p) => (
            <article
              key={p.no}
              style={{
                padding: "32px 28px",
                background: "var(--bg)",
                minHeight: 240,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 14,
                  }}
                >
                  <span className="eyebrow accent">― {p.cat}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--ink-3)",
                    }}
                  >
                    No. {p.no}
                  </span>
                </div>
                <h3
                  className="heading"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 22,
                    fontWeight: 400,
                    margin: "0 0 14px",
                    lineHeight: 1.35,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "var(--ink-2)",
                    margin: 0,
                  }}
                >
                  {p.body}
                </p>
              </div>
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 16,
                  borderTop: "1px solid var(--rule)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                  letterSpacing: "0.06em",
                }}
              >
                <span>― {p.author}</span>
                <span>{p.time}</span>
              </div>
            </article>
          ))}
        </div>

        <div
          style={{
            marginTop: 48,
            display: "flex",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <Link
            href="/signup"
            style={{
              background: "transparent",
              color: "var(--ink-deep)",
              border: "1px solid var(--rule-strong)",
              padding: "14px 24px",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              letterSpacing: "0.10em",
              textDecoration: "none",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
          >
            발견 피드 둘러보기 →
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer
        style={{
          padding: "40px 56px 48px",
          borderTop: "1px solid var(--rule)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-3)",
          letterSpacing: "0.12em",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span>GLEUL · GYUL — 글결 © 2026</span>
        <span style={{ display: "flex", gap: 24 }}>
          <span>― 다음 글 / 새벽 5시</span>
        </span>
        <span>v0.2 / {serial.toLowerCase()}</span>
      </footer>
    </div>
  );
}

function PersonaCard({
  letter,
  letterBg,
  eyebrow,
  name,
  headline,
  description,
  ctaLabel,
  ctaHref,
  ctaIcon,
  ctaInverse,
  metas,
  surface,
  headlineItalic,
}: {
  letter: string;
  letterBg: string;
  eyebrow: string;
  name: string;
  headline: React.ReactNode;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  ctaIcon: "arrow-right" | "pen";
  ctaInverse?: boolean;
  metas: string[];
  surface?: boolean;
  headlineItalic?: boolean;
}) {
  const ctaStyle: React.CSSProperties = ctaInverse
    ? {
        background: "var(--btn-bg)",
        color: "var(--btn-fg)",
        border: 0,
      }
    : {
        background: "transparent",
        color: "var(--ink-deep)",
        border: "1px solid var(--ink-deep)",
      };

  return (
    <div
      style={{
        padding: "64px",
        background: surface ? "var(--bg-2)" : "transparent",
        borderRight: surface ? 0 : "1px solid var(--rule)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: letterBg,
              border: "1px solid var(--rule-strong)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-serif)",
              fontSize: 20,
              color: "var(--ink-deep)",
            }}
          >
            {letter}
          </div>
          <div>
            <div className="eyebrow accent">{eyebrow}</div>
            <div
              className="heading"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 22,
                marginTop: 4,
              }}
            >
              {name}
            </div>
          </div>
        </div>

        <h3
          className="heading"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 36,
            fontWeight: 400,
            lineHeight: 1.35,
            margin: "0 0 28px",
            letterSpacing: "-0.015em",
            fontStyle: headlineItalic ? "italic" : "normal",
          }}
        >
          {headline}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 16,
            color: "var(--ink-2)",
            lineHeight: 1.85,
            margin: 0,
            maxWidth: 480,
          }}
        >
          {description}
        </p>
      </div>

      <div style={{ marginTop: 48 }}>
        <Link
          href={ctaHref}
          style={{
            ...ctaStyle,
            padding: "16px 24px",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            letterSpacing: "0.12em",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            transition: "background 0.15s ease, color 0.15s ease",
          }}
        >
          {ctaLabel}{" "}
          <GGIcon
            name={ctaIcon}
            size={14}
            color={ctaInverse ? "var(--btn-fg)" : "var(--ink-deep)"}
          />
        </Link>
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 32,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.1em",
            flexWrap: "wrap",
          }}
        >
          {metas.map((m) => (
            <span key={m}>· {m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const FEED_PREVIEW = [
  {
    no: "047",
    cat: "고요",
    title: "안개가 지나간 자리",
    body: "안개는 소리 없이 마당을 건너갔다. 어떤 발자국도 남기지 않았다.",
    author: "지연",
    time: "3분",
  },
  {
    no: "046",
    cat: "위로",
    title: "오늘은 잘 지지 않아도 돼",
    body: "오늘의 당신을 토닥이는 한 마디, 가만히 두고 가요.",
    author: "민호",
    time: "2분",
  },
  {
    no: "045",
    cat: "사색",
    title: "나는 자주 질문이 된다",
    body: "사라진 것들이 사라졌음을, 우리는 한참 뒤에야 안다.",
    author: "글결",
    time: "4분",
  },
];

const STATIC_SAMPLE: DailyQuote = {
  id: "static-sample",
  serial_no: 47,
  date: "2026-04-27",
  title: "안개가 지나간 자리",
  body: [
    "새벽이 창을 두드릴 때, 나는 아직 잠의 끝자락을 붙들고 있었다.",
    "안개는 소리 없이 마당을 건너갔다. 어떤 발자국도 남기지 않았다.",
    "그러나 안개가 지나간 자리에는 분명, 무언가가 달라져 있었다.",
    "이파리 끝의 물방울. 흙의 냄새. 멀리서 우는 새의 음정.",
    "사라진 것들이 사라졌음을 우리는, 그것이 사라지고 한참 뒤에야 안다.",
  ].join("\n"),
  category: "고요",
  source_type: "curated",
  tags: ["고요", "새벽", "안개"],
  created_at: new Date().toISOString(),
};
