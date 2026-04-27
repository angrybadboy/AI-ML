import Link from "next/link";

export type ProfileTab = "saved" | "written" | "diary";

type Props = {
  active: ProfileTab;
  counts: {
    saved: number;
    written: number;
    diary: number;
  };
};

const ITEMS: { key: ProfileTab; label: string }[] = [
  { key: "saved", label: "간직한 글" },
  { key: "written", label: "내가 쓴 글" },
  { key: "diary", label: "감상 일기" },
];

export function ProfileTabs({ active, counts }: Props) {
  return (
    <div
      style={{
        marginTop: 36,
        display: "flex",
        gap: 32,
        fontFamily: "var(--font-serif)",
        fontSize: 16,
        paddingBottom: 14,
        borderBottom: "1px solid var(--rule)",
        flexWrap: "wrap",
      }}
    >
      {ITEMS.map((it) => {
        const isActive = it.key === active;
        return (
          <Link
            key={it.key}
            href={`/me?tab=${it.key}`}
            style={{
              color: isActive ? "var(--ink-deep)" : "var(--ink-2)",
              borderBottom: isActive ? "1px solid var(--accent)" : "1px solid transparent",
              paddingBottom: 14,
              marginBottom: -15,
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
          >
            {it.label} ({counts[it.key]})
          </Link>
        );
      })}
    </div>
  );
}
