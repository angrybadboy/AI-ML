import { GGStars } from "@/components/shared/GGStars";
import { StaggeredParagraphs } from "@/components/motion/StaggeredParagraphs";
import { QuoteActions } from "./QuoteActions";
import { UserPostDeleteClient } from "./UserPostDeleteClient";
import type { Database } from "@/types/db";

type UserPost = Database["public"]["Tables"]["user_posts"]["Row"];

type Props = {
  post: UserPost;
  authorNickname: string;
  isMine: boolean;
  isSaved: boolean;
  reads: number;
};

/**
 * /p/[no] 단일 사용자 글 뷰. QuoteView와 같은 골격이지만 byline·메타·액션이 사용자 글에 맞게.
 * is_mine 일 때만 편집·삭제 버튼 표시.
 */
export function UserPostView({
  post,
  authorNickname,
  isMine,
  isSaved,
  reads,
}: Props) {
  const paragraphs = post.body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const dateStr = post.created_at.slice(0, 10).replaceAll("-", " · ");
  const serial = `No. ${String(post.serial_no).padStart(3, "0")}`;
  const visibilityLabel =
    post.visibility === "private" ? "비공개" : "발견에 공개";

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
          <span style={{ color: "var(--accent)" }}>― {post.category} ―</span>
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
          {post.title}
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 64,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "var(--ink-3)",
            letterSpacing: "0.04em",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span>― {authorNickname} 가 남긴 결</span>
          <span
            style={{
              color: post.visibility === "public" ? "var(--accent)" : "var(--ink-3)",
            }}
          >
            {visibilityLabel}
          </span>
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

        {post.tags.length > 0 && (
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
            {post.tags.map((t, i) => (
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

        <QuoteActions quoteId={post.id} initialSaved={isSaved} itemType="user" />

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
            ? "아직 아무도 간직하지 않은 결입니다."
            : `${reads.toLocaleString("ko-KR")}명이 이 결을 간직했어요`}
        </div>

        {isMine && (
          <div
            style={{
              marginTop: 48,
              paddingTop: 24,
              borderTop: "1px solid var(--rule)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              alignItems: "center",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-3)",
                letterSpacing: "0.12em",
                marginRight: "auto",
              }}
            >
              ― 본인의 글
            </span>
            <UserPostDeleteClient postId={post.id} />
          </div>
        )}
      </main>
    </div>
  );
}
