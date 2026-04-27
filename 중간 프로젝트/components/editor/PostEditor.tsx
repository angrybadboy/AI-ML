"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GGIcon } from "@/components/shared/GGIcon";
import { CATEGORIES, type Category } from "@/lib/categories";
import { PostCreateSchema } from "@/lib/schemas/post";

const TITLE_MAX = 40;
const BODY_MAX = 600;
const TAG_MAX_COUNT = 4;

/**
 * 글쓰기 에디터 — UScreenEditor 디자인 그대로.
 *
 * 디자인 원칙:
 *   - 토스트 / 빨간 박스 / alert 금지
 *   - 카운터는 항상 노출, 제한 도달 시 var(--accent) 색만 변함
 *   - 에러는 헤어라인 + Mono 11px 인라인
 */
export function PostEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>("고요");
  const [tagsInput, setTagsInput] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const titleLen = title.trim().length;
  const bodyLen = body.trim().length;
  const titleAtLimit = titleLen >= TITLE_MAX;
  const bodyAtLimit = bodyLen >= BODY_MAX;

  function parseTags(): string[] {
    return tagsInput
      .split(/[,\s]+/)
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean)
      .slice(0, TAG_MAX_COUNT);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const tags = parseTags();
    const parsed = PostCreateSchema.safeParse({
      title,
      body,
      category,
      visibility,
      tags,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "입력을 확인해 주세요.");
      return;
    }

    start(async () => {
      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error?.message ?? "발행에 실패했어요.");
          return;
        }
        router.push(`/p/${json.data.serial_no}`);
        router.refresh();
      } catch {
        setError("연결이 잠시 끊겼어요. 다시 시도해 주세요.");
      }
    });
  }

  return (
    <main
      style={{
        padding: "72px 24px",
        maxWidth: 780,
        margin: "0 auto",
      }}
    >
      <form onSubmit={onSubmit}>
        {/* 메타 row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 48,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.18em",
          }}
        >
          <span>― 새 글결 ―</span>
          <span>비공개로 시작 · 언제든 발행할 수 있어요</span>
        </div>

        {/* 제목 */}
        <input
          type="text"
          placeholder="제목 한 줄"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
          maxLength={TITLE_MAX}
          aria-label="제목"
          style={{
            width: "100%",
            border: 0,
            borderBottom: "1px solid var(--rule)",
            background: "transparent",
            padding: "12px 0",
            marginBottom: 32,
            fontFamily: "var(--font-serif)",
            fontSize: 46,
            fontWeight: 400,
            color: "var(--ink-deep)",
            outline: "none",
            letterSpacing: "-0.015em",
          }}
        />

        {/* 카테고리 */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span className="eyebrow faint" style={{ marginRight: 8 }}>
            ― 결
          </span>
          {CATEGORIES.map((c) => {
            const selected = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                style={{
                  padding: "4px 10px",
                  border: `1px solid ${selected ? "var(--accent)" : "var(--rule-strong)"}`,
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  color: selected ? "var(--accent)" : "var(--ink-2)",
                  letterSpacing: "0.04em",
                  background: "transparent",
                  cursor: "pointer",
                  transition: "color 0.15s ease, border-color 0.15s ease",
                }}
              >
                #{c}
              </button>
            );
          })}
        </div>

        {/* 태그 (선택) */}
        <div style={{ marginBottom: 40 }}>
          <input
            type="text"
            placeholder="태그 (선택, 콤마로 구분 — 최대 4개)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            aria-label="태그"
            style={{
              width: "100%",
              border: 0,
              borderBottom: "1px solid var(--rule)",
              background: "transparent",
              padding: "8px 0",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              color: "var(--ink-2)",
              outline: "none",
              letterSpacing: "0.04em",
            }}
          />
        </div>

        {/* 본문 */}
        <textarea
          placeholder="천천히 한 단락씩 펼쳐 보세요. 줄바꿈은 두 번."
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))}
          maxLength={BODY_MAX}
          aria-label="본문"
          style={{
            width: "100%",
            minHeight: 280,
            border: 0,
            background: "transparent",
            fontFamily: "var(--font-serif)",
            fontSize: 21,
            lineHeight: 1.95,
            color: "var(--ink)",
            outline: "none",
            resize: "vertical",
            padding: 0,
          }}
        />

        {/* 카운터 + 공개 토글 */}
        <div
          style={{
            padding: "24px 0",
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 32,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 24,
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              color: "var(--ink-3)",
            }}
          >
            <span style={{ color: bodyAtLimit ? "var(--accent)" : "var(--ink-3)" }}>
              본문 · {bodyLen} / {BODY_MAX}자
            </span>
            <span style={{ color: titleAtLimit ? "var(--accent)" : "var(--ink-3)" }}>
              제목 · {titleLen} / {TITLE_MAX}자
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              fontFamily: "var(--font-sans)",
              fontSize: 12,
            }}
          >
            <button
              type="button"
              onClick={() => setVisibility("private")}
              style={{
                padding: "8px 14px",
                background: visibility === "private" ? "var(--bg-2)" : "transparent",
                border: `1px solid ${visibility === "private" ? "var(--ink-deep)" : "var(--rule-strong)"}`,
                color: visibility === "private" ? "var(--ink-deep)" : "var(--ink-2)",
                cursor: "pointer",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              비공개
            </button>
            <button
              type="button"
              onClick={() => setVisibility("public")}
              style={{
                padding: "8px 14px",
                background: visibility === "public" ? "var(--accent)" : "transparent",
                color: visibility === "public" ? "var(--btn-fg)" : "var(--ink-2)",
                border: `1px solid ${visibility === "public" ? "var(--accent)" : "var(--rule-strong)"}`,
                cursor: "pointer",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              발견에 공개
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div
            style={{
              marginTop: 24,
              paddingTop: 12,
              borderTop: "1px solid var(--rule)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              color: "var(--accent)",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* 발행 */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
          <button
            type="submit"
            disabled={pending}
            style={{
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              border: 0,
              padding: "16px 32px",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              letterSpacing: "0.12em",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              cursor: pending ? "default" : "pointer",
              opacity: pending ? 0.6 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            {pending ? "발행 중…" : "발행하기"}
            {!pending && <GGIcon name="arrow-right" size={14} color="var(--btn-fg)" />}
          </button>
        </div>
      </form>
    </main>
  );
}
