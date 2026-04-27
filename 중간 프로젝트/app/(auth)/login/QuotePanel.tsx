import { GGMark } from "@/components/shared/GGMark";
import { GGStars } from "@/components/shared/GGStars";

/**
 * Login/Signup 좌측 인용 패널.
 * 핸드오프 UScreenLogin의 좌측 section을 그대로 따른다.
 */
export function QuotePanel() {
  return (
    <section
      className="gg-auth-quote"
      style={{
        padding: "56px 64px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid var(--rule)",
        position: "relative",
        zIndex: 1,
        minHeight: 980,
      }}
    >
      <GGStars count={70} w={720} h={980} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "relative",
        }}
      >
        <GGMark size={24} color="var(--ink-deep)" />
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 19,
            color: "var(--ink-deep)",
            letterSpacing: "0.04em",
          }}
        >
          글결
        </span>
      </div>
      <div style={{ position: "relative" }}>
        <div className="eyebrow accent" style={{ marginBottom: 24 }}>
          ― 오늘의 글, No. 047
        </div>
        <p
          className="heading"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 40,
            lineHeight: 1.5,
            margin: "0 0 24px",
            maxWidth: 560,
            fontWeight: 400,
            letterSpacing: "-0.015em",
          }}
        >
          “사라진 것들이 사라졌음을
          <br />
          우리는, 그것이 사라지고
          <br />
          한참 뒤에야 안다.”
        </p>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "var(--ink-3)",
            letterSpacing: "0.04em",
          }}
        >
          ― 「안개가 지나간 자리」 中
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-3)",
          letterSpacing: "0.16em",
          position: "relative",
        }}
      >
        2026 · 04 · 27 — 04:12
      </div>
    </section>
  );
}
