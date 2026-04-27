type Props = {
  eyebrow: string;
  title: string;
  phase: 2 | 3 | 4 | 5;
};

/**
 * Phase 1 단계의 placeholder 페이지에 사용.
 * "조용한 방" 톤을 깨지 않으면서 다음 Phase 안내만 한다.
 */
export function PhasePlaceholder({ eyebrow, title, phase }: Props) {
  return (
    <main
      style={{
        padding: "120px 56px 80px",
        maxWidth: 780,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div className="eyebrow accent" style={{ marginBottom: 24 }}>
        ― {eyebrow}
      </div>
      <h1
        className="heading"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 56,
          fontWeight: 400,
          lineHeight: 1.25,
          letterSpacing: "-0.018em",
          margin: "0 0 32px",
        }}
      >
        {title}
      </h1>
      <hr className="hairline" style={{ marginBottom: 32 }} />
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 18,
          lineHeight: 1.85,
          color: "var(--ink-2)",
          margin: 0,
        }}
      >
        이 화면은 Phase {phase}에서 구현됩니다. 지금은 조용히 비워두었어요.
      </p>
    </main>
  );
}
