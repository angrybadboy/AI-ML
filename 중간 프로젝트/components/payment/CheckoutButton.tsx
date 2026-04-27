"use client";

import { useState, useTransition } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

type Props = {
  clientKey: string;
  /** 표시용 — Toss 결제창에서 보일 고객 정보 */
  customerEmail?: string;
  customerName?: string;
};

/**
 * 프리미엄 구독 결제 버튼.
 * 흐름:
 *   1. POST /api/payment/ready → orderId 받음
 *   2. Toss SDK 로드 → payment.requestPayment 호출 (Toss 호스팅 페이지로 이동)
 *   3. 결제 완료 시 successUrl(/payment/success)로 돌아오고 그곳에서 confirm 처리
 * 디자인 원칙: 토스트·alert 금지. 에러는 헤어라인 + Mono 11px.
 */
export function CheckoutButton({
  clientKey,
  customerEmail,
  customerName,
}: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    start(async () => {
      try {
        const readyRes = await fetch("/api/payment/ready", { method: "POST" });
        const readyJson = await readyRes.json();
        if (!readyJson.ok) {
          setError(readyJson.error?.message ?? "결제 준비에 실패했어요.");
          return;
        }
        const { orderId, amount, orderName, customerKey } = readyJson.data;

        const tossPayments = await loadTossPayments(clientKey);
        const payment = tossPayments.payment({ customerKey });

        await payment.requestPayment({
          method: "CARD",
          amount: { currency: "KRW", value: amount },
          orderId,
          orderName,
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/payment/fail`,
          customerEmail: customerEmail || undefined,
          customerName: customerName || undefined,
          card: {
            useEscrow: false,
            flowMode: "DEFAULT",
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });
        // Toss 호스팅 페이지로 이동 — 이 코드 이후는 실행 안 됨
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "결제를 시작하지 못했어요.";
        // Toss SDK는 사용자가 결제창을 닫으면 PAY_PROCESS_CANCELED 같은 코드로 reject
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: unknown }).code)
            : null;
        if (code === "PAY_PROCESS_CANCELED" || code === "USER_CANCEL") {
          setError("결제를 취소하셨어요.");
        } else {
          setError(message);
        }
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        style={{
          background: "var(--btn-bg)",
          color: "var(--btn-fg)",
          border: 0,
          padding: "18px 48px",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          letterSpacing: "0.14em",
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.6 : 1,
          transition: "opacity 0.15s ease",
        }}
      >
        {pending ? "결제창을 여는 중…" : "조용히 구독 시작하기"}
      </button>
      {error && (
        <div
          style={{
            paddingTop: 12,
            borderTop: "1px solid var(--rule)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--accent)",
            textAlign: "center",
            maxWidth: 320,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
