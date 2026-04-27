import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { markPaymentFailed } from "@/lib/payment";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "결제 — 글결",
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const code = pickString(sp.code) ?? "UNKNOWN";
  const message = pickString(sp.message) ?? "결제를 완료하지 못했어요.";
  const orderId = pickString(sp.orderId);

  // 'ready' 상태로 남은 주문이 있다면 'failed' 또는 'canceled'로 마감
  if (orderId) {
    const finalStatus = code === "PAY_PROCESS_CANCELED" ? "canceled" : "failed";
    await markPaymentFailed(orderId, { code, message }, finalStatus);
  }

  const isCancel = code === "PAY_PROCESS_CANCELED" || code === "USER_CANCEL";

  return (
    <main
      style={{
        padding: "160px 24px",
        maxWidth: 640,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div className="eyebrow accent" style={{ marginBottom: 24 }}>
        ― {isCancel ? "조용히 멈췄어요" : "결제가 닿지 못했어요"}
      </div>
      <h1
        className="heading"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 46,
          fontWeight: 400,
          lineHeight: 1.25,
          margin: "0 0 32px",
          letterSpacing: "-0.015em",
        }}
      >
        {isCancel
          ? "결제를 취소하셨어요."
          : "결제 승인을 받지 못했어요."}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-3)",
          letterSpacing: "0.12em",
          marginBottom: 56,
          maxWidth: 480,
          margin: "0 auto 56px",
        }}
      >
        {message}
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href="/premium"
          style={{
            background: "var(--btn-bg)",
            color: "var(--btn-fg)",
            border: 0,
            padding: "14px 28px",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            letterSpacing: "0.10em",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          다시 시도
        </Link>
        <Link
          href="/today"
          style={{
            background: "transparent",
            color: "var(--ink-deep)",
            border: "1px solid var(--rule-strong)",
            padding: "14px 28px",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            letterSpacing: "0.10em",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          오늘의 글로
        </Link>
      </div>
    </main>
  );
}

function pickString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}
