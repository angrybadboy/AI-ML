"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GGMark } from "./GGMark";
import { GGIcon } from "./GGIcon";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = {
  label: string;
  href: string;
  /** 활성 매칭에 추가로 startsWith 검사할 경로들 */
  matchPrefixes?: string[];
};

const ITEMS: NavItem[] = [
  { label: "오늘", href: "/today", matchPrefixes: ["/g/"] },
  { label: "발견", href: "/feed" },
  { label: "쓰기", href: "/write" },
  { label: "마이", href: "/me" },
];

type Props = {
  /** 닉네임 첫 글자 (없으면 표시 안 함) */
  avatarLetter?: string;
};

export function GGNav({ avatarLetter }: Props) {
  const pathname = usePathname();

  function isActive(item: NavItem) {
    if (pathname === item.href) return true;
    if (item.matchPrefixes?.some((p) => pathname?.startsWith(p))) return true;
    return false;
  }

  return (
    <header
      className="gg-nav"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "22px 56px",
        borderBottom: "1px solid var(--rule)",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        color: "var(--ink-2)",
        position: "relative",
        zIndex: 5,
      }}
    >
      <Link
        href="/today"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "var(--ink-deep)",
          textDecoration: "none",
        }}
      >
        <GGMark size={22} color="var(--ink-deep)" />
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            letterSpacing: "0.04em",
          }}
        >
          글결
        </span>
      </Link>

      <nav
        className="gg-nav-items"
        style={{ display: "flex", gap: 32, letterSpacing: "0.04em" }}
      >
        {ITEMS.map((it) => {
          const active = isActive(it);
          return (
            <Link
              key={it.href}
              href={it.href}
              style={{
                color: active ? "var(--ink-deep)" : "var(--ink-2)",
                paddingBottom: 4,
                borderBottom: `1px solid ${active ? "var(--accent)" : "transparent"}`,
                textDecoration: "none",
                transition: "color 0.15s ease",
              }}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <ThemeToggle />
        <button
          type="button"
          aria-label="검색"
          style={{
            background: "transparent",
            border: 0,
            padding: 4,
            cursor: "pointer",
            color: "var(--ink-2)",
            display: "inline-flex",
          }}
        >
          <GGIcon name="search" size={15} />
        </button>
        {avatarLetter && (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--bg-2)",
              border: "1px solid var(--rule-strong)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-serif)",
              fontSize: 13,
              color: "var(--ink)",
            }}
          >
            {avatarLetter}
          </div>
        )}
      </div>
    </header>
  );
}
