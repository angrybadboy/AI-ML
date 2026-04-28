"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * 프리미엄 해지 버튼.
 * 두 단계 확인 패턴 (alert/confirm 대신):
 *   1차 클릭 → 인라인 "한 번 더 누르면 해지" 색상 변경
 *   2차 클릭 → 실제 /api/payment/cancel 호출 → 페이지 새로고침
 */
export function CancelButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onClick() {
    setError(null);
    if (!confirming) {
      setConfirming(true);
      return;
    }
    start(async () => {
      try {
        const res = await fetch("/api/payment/cancel", { method: "POST" });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error?.message ?? "해지에 실패했어요.");
          setConfirming(false);
          return;
        }
        router.refresh();
      } catch {
        setError("연결이 잠시 끊겼어요. 다시 시도해 주세요.");
        setConfirming(false);
      }
    });
  }

  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        style={{
          padding: "12px 22px",
          background: confirming ? "var(--accent)" : "transparent",
          border: `1px solid ${confirming ? "var(--accent)" : "var(--rule-strong)"}`,
          color: confirming ? "var(--btn-fg)" : "var(--ink-2)",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          letterSpacing: "0.10em",
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.6 : 1,
          transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
        }}
      >
        {pending
          ? "해지 중…"
          : confirming
            ? "한 번 더 누르면 해지"
            : "조용히 해지하기"}
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
