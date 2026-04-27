import Link from "next/link";
import { GGIcon } from "@/components/shared/GGIcon";
import { SaveBookmark } from "./SaveBookmark";
import type { FeedPost } from "@/lib/feed";

type Props = {
  post: FeedPost;
};

/**
 * 발견 피드의 한 장의 카드 — UScreenFeed 디자인 그대로.
 * 호버: 배경만 var(--bg-2)로 0.15s 페이드. transform 변경 금지.
 */
export function FeedCard({ post }: Props) {
  const excerpt = excerptOf(post.body, 120);
  const noStr = String(post.serial_no).padStart(3, "0");
  const minutes = readingMinutes(post.body);

  return (
    <article
      className="feed-card"
      style={{
        padding: "36px",
        background: "var(--bg)",
        minHeight: 220,
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 32,
        alignItems: "center",
        transition: "background-color 0.15s ease",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 38,
          color: "var(--ink-3)",
          fontWeight: 300,
          letterSpacing: "-0.02em",
        }}
      >
        {noStr}
      </div>
      <div>
        <div className="eyebrow accent" style={{ marginBottom: 12 }}>
          ― {post.category}
          {post.visibility === "private" && (
            <span style={{ color: "var(--ink-3)", marginLeft: 12 }}>
              · 비공개
            </span>
          )}
        </div>
        <h3
          className="heading"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 24,
            fontWeight: 400,
            margin: "0 0 12px",
            lineHeight: 1.35,
            letterSpacing: "-0.01em",
          }}
        >
          <Link
            href={`/p/${post.serial_no}`}
            style={{
              color: "inherit",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
          >
            {post.title}
          </Link>
        </h3>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            lineHeight: 1.7,
            color: "var(--ink-2)",
            margin: "0 0 14px",
            maxWidth: 480,
          }}
        >
          {excerpt}
        </p>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.06em",
          }}
        >
          {post.author_nickname} · {minutes}분
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          alignItems: "center",
          color: "var(--ink-2)",
        }}
      >
        <SaveBookmark
          itemId={post.id}
          itemType="user"
          initialSaved={post.is_saved}
          size={16}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            color: "var(--ink-3)",
          }}
          aria-label="감응"
        >
          <GGIcon name="heart" size={16} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
            }}
          >
            {post.like_count}
          </span>
        </div>
      </div>
    </article>
  );
}

function excerptOf(body: string, max: number): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return flat.slice(0, max) + "…";
}

function readingMinutes(body: string): number {
  // 한국어 분당 약 350자 기준. 최소 1분.
  const chars = body.replace(/\s/g, "").length;
  return Math.max(1, Math.round(chars / 350));
}
