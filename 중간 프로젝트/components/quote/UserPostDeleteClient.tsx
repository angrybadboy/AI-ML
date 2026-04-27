"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  postId: string;
};

/**
 * /p/[no] 본인 글 하단의 삭제 버튼.
 * 두 단계 확인: 1차 클릭 → 인라인 "정말 삭제할까요?" 노출, 2차 클릭에서 실제 DELETE.
 * 토스트·alert·confirm() 모두 금지 — 디자인 원칙.
 */
export function UserPostDeleteClient({ postId }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    start(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error?.message ?? "삭제에 실패했어요.");
          setConfirming(false);
          return;
        }
        router.replace("/me?tab=written");
        router.refresh();
      } catch {
        setError("연결이 잠시 끊겼어요. 다시 시도해 주세요.");
        setConfirming(false);
      }
    });
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        style={{
          padding: "8px 14px",
          background: confirming ? "var(--accent)" : "transparent",
          border: `1px solid ${confirming ? "var(--accent)" : "var(--rule-strong)"}`,
          color: confirming ? "var(--btn-fg)" : "var(--ink-2)",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          letterSpacing: "0.04em",
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.6 : 1,
          transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
        }}
      >
        {pending ? "삭제 중…" : confirming ? "한 번 더 누르면 삭제" : "삭제"}
      </button>
      {error && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--accent)",
            letterSpacing: "0.12em",
          }}
        >
          {error}
        </span>
      )}
    </span>
  );
}
