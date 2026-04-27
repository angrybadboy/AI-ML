import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getFeedPosts, isCategoryParam } from "@/lib/feed";
import { CategoryFilter } from "@/components/feed/CategoryFilter";
import { FeedCard } from "@/components/feed/FeedCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "발견 — 글결",
};

type SP = Promise<{ cat?: string; cursor?: string }>;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const catRaw = sp.cat ?? null;
  const category = isCategoryParam(catRaw) ? catRaw : undefined;
  const cursor = sp.cursor ? Number.parseInt(sp.cursor, 10) : undefined;

  const { posts, nextCursor } = await getFeedPosts({
    userId: user.id,
    scope: "feed",
    category,
    cursor: Number.isFinite(cursor) ? cursor : undefined,
  });

  const nextHref = (() => {
    if (!nextCursor) return null;
    const params = new URLSearchParams();
    if (category) params.set("cat", category);
    params.set("cursor", String(nextCursor));
    return `/feed?${params.toString()}`;
  })();

  return (
    <main
      className="gg-page-main"
      style={{ padding: "72px 56px 0", maxWidth: 1200, margin: "0 auto" }}
    >
      {/* Header */}
      <section
        className="gg-grid-5fr-7fr"
        style={{
          display: "grid",
          gridTemplateColumns: "5fr 7fr",
          gap: 64,
          marginBottom: 56,
        }}
      >
        <div>
          <div className="eyebrow accent" style={{ marginBottom: 24 }}>
            ― 발견 / Discover
          </div>
          <h2
            className="heading"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 60,
              fontWeight: 400,
              lineHeight: 1.1,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            조용히 누군가가
            <br />
            <em style={{ fontStyle: "italic", color: "var(--accent)" }}>
              남겨둔 문장들.
            </em>
          </h2>
        </div>
        <div style={{ paddingTop: 48 }}>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              color: "var(--ink-2)",
              lineHeight: 1.7,
              margin: "0 0 24px",
            }}
          >
            매일 새벽, 글결의 사용자들이 다듬어 올린 글이 이곳에 머뭅니다. 마음에 드는 결을 발견하면 가만히 간직해두세요.
          </p>
          <div
            style={{
              display: "flex",
              gap: 24,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ink-3)",
              letterSpacing: "0.12em",
              flexWrap: "wrap",
            }}
          >
            <span>― {category ? `카테고리: ${category}` : "전체 보기"}</span>
            <span>― 한 페이지 {posts.length}편</span>
          </div>
        </div>
      </section>

      <CategoryFilter active={category ?? null} basePath="/feed" />

      {posts.length === 0 ? (
        <div
          style={{
            padding: "120px 0",
            textAlign: "center",
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            color: "var(--ink-3)",
            lineHeight: 1.7,
          }}
        >
          {category ? (
            <>
              아직 ‘{category}’ 결이 도착하지 않았어요.
              <br />가장 먼저 한 편을 남겨보시겠어요?
            </>
          ) : (
            <>
              아직 발견 피드에 글이 없어요.
              <br />첫 글결을 남겨주세요.
            </>
          )}
          <div style={{ marginTop: 32 }}>
            <Link
              href="/write"
              style={{
                background: "var(--btn-bg)",
                color: "var(--btn-fg)",
                border: 0,
                padding: "14px 32px",
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                letterSpacing: "0.12em",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              글결 쓰기
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div
            className="gg-grid-2col"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              background: "var(--rule)",
              border: "1px solid var(--rule)",
            }}
          >
            {posts.map((p) => (
              <FeedCard key={p.id} post={p} />
            ))}
          </div>

          <div style={{ padding: "56px 0", textAlign: "center" }}>
            {nextHref ? (
              <Link
                href={nextHref}
                style={{
                  background: "transparent",
                  border: "1px solid var(--rule-strong)",
                  padding: "14px 32px",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  letterSpacing: "0.1em",
                  color: "var(--ink)",
                  textDecoration: "none",
                  transition: "background 0.15s ease",
                }}
              >
                다음 결 펼치기 ↓
              </Link>
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  color: "var(--ink-3)",
                }}
              >
                ― 마지막 결입니다 ―
              </span>
            )}
          </div>
        </>
      )}
    </main>
  );
}
