import Link from "next/link";
import { CATEGORIES, type Category } from "@/lib/categories";

type Props = {
  active: Category | null;
  basePath: "/feed";
};

const ALL: { label: string; value: Category | null } = {
  label: "전체",
  value: null,
};
const ITEMS = [ALL, ...CATEGORIES.map((c) => ({ label: c, value: c }))] as {
  label: string;
  value: Category | null;
}[];

/**
 * 카테고리 필터 칩. 서버 컴포넌트로 렌더 — 클릭은 Link로 navigate.
 */
export function CategoryFilter({ active, basePath }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        marginBottom: 48,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {ITEMS.map((it) => {
        const selected = it.value === active;
        const href = it.value
          ? `${basePath}?cat=${encodeURIComponent(it.value)}`
          : basePath;
        return (
          <Link
            key={it.label}
            href={href}
            style={{
              padding: "10px 18px",
              background: selected ? "var(--btn-bg)" : "transparent",
              color: selected ? "var(--btn-fg)" : "var(--ink-2)",
              border: `1px solid ${selected ? "var(--btn-bg)" : "var(--rule-strong)"}`,
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              letterSpacing: "0.06em",
              textDecoration: "none",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
          >
            {it.label}
          </Link>
        );
      })}
      <span style={{ flex: 1 }} />
      <span
        style={{
          padding: "10px 18px",
          color: "var(--ink-3)",
          border: "1px solid var(--rule)",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          letterSpacing: "0.06em",
        }}
      >
        최신순
      </span>
    </div>
  );
}
