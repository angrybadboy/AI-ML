"use client";

import { useState, useTransition } from "react";
import { GGIcon } from "@/components/shared/GGIcon";

type Props = {
  itemId: string;
  itemType: "daily" | "user";
  initialSaved: boolean;
  size?: number;
};

/**
 * 피드 카드 등 작은 영역에서 사용하는 인라인 북마크 토글.
 * QuoteActions의 SaveIcon보다 단순한 버전.
 */
export function SaveBookmark({
  itemId,
  itemType,
  initialSaved,
  size = 16,
}: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    start(async () => {
      try {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_type: itemType, item_id: itemId }),
        });
        const json = await res.json();
        if (json.ok) setSaved(json.data.saved);
      } catch {
        // 조용히 무시 — 다음 클릭에서 재시도
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={saved ? "간직 해제" : "간직하기"}
      style={{
        background: "transparent",
        border: 0,
        padding: 4,
        cursor: pending ? "default" : "pointer",
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          opacity: saved ? 0 : 1,
          transition: "opacity 0.6s ease-out",
          color: "var(--ink-2)",
        }}
      >
        <GGIcon name="bookmark" size={size} />
      </span>
      <span
        style={{
          position: "absolute",
          inset: 0,
          opacity: saved ? 1 : 0,
          transition: "opacity 0.6s ease-out",
          color: "var(--accent)",
        }}
      >
        <GGIcon name="bookmark-fill" size={size} color="var(--accent)" />
      </span>
    </button>
  );
}
