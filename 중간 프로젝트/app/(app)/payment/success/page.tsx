import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { confirmAndActivatePremium } from "@/lib/payment";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "결제 완료 — 글결",
};

const QuerySchema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.coerce.number().int().positive(),
});

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const parsed = QuerySchema.safeParse({
    paymentKey: sp.paymentKey,
    orderId: sp.orderId,
    amount: sp.amount,
  });

  if (!parsed.success) {
    return (
      <Result
        eyebrow="결제 정보가 비어 있어요"
        title="결제를 다시 시작해 주세요."
        sub="필요한 정보가 함께 도착하지 않았습니다."
        backHref="/premium"
        backLabel="프리미엄으로 돌아가기"
      />
    );
  }

  const result = await confirmAndActivatePremium({
    userId: user.id,
    paymentKey: parsed.data.paymentKey,
    orderId: parsed.data.orderId,
    amount: parsed.data.amount,
  });

  // 새로고침으로 두 번째 호출되는 경우엔 ALREADY_PROCESSED 가 떨어지지만,
  // 그 사이 구독은 이미 활성화되어 있을 수 있다. 현재 상태를 한 번 더 확인.
  if (!result.ok) {
    if (result.code === "ALREADY_PROCESSED") {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, subscription_expires_at")
        .eq("id", user.id)
        .maybeSingle();
      const isPremium =
        profile?.subscription_status === "premium" &&
        profile.subscription_expires_at &&
        new Date(profile.subscription_expires_at) > new Date();
      if (isPremium) {
        return <SuccessView expiresAt={profile.subscription_expires_at!} />;
      }
    }
    return (
      <Result
        eyebrow="결제 승인이 거절되었어요"
        title={friendlyTitle(result.code)}
        sub={result.message}
        backHref="/premium"
        backLabel="다시 시도"
      />
    );
  }

  // 성공 — 활성화된 구독의 만료일 다시 조회 (UI 표시용)
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  return <SuccessView expiresAt={profile?.subscription_expires_at ?? null} />;
}

function SuccessView({ expiresAt }: { expiresAt: string | null }) {
  const date = expiresAt
    ? new Date(expiresAt).toISOString().slice(0, 10).replaceAll("-", " · ")
    : null;
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
        ― 환영합니다, 더 깊은 결로
      </div>
      <h1
        className="heading"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 56,
          fontWeight: 400,
          lineHeight: 1.2,
          margin: "0 0 32px",
          letterSpacing: "-0.018em",
        }}
      >
        프리미엄이 시작되었어요.
      </h1>
      {date && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.18em",
            marginBottom: 56,
          }}
        >
          ― 다음 결까지 {date} ―
        </p>
      )}
      <Link
        href="/today"
        style={{
          background: "var(--btn-bg)",
          color: "var(--btn-fg)",
          border: 0,
          padding: "16px 32px",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          letterSpacing: "0.12em",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        오늘의 글로 돌아가기
      </Link>
    </main>
  );
}

function Result({
  eyebrow,
  title,
  sub,
  backHref,
  backLabel,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  backHref: string;
  backLabel: string;
}) {
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
        ― {eyebrow}
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
        {title}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-3)",
          letterSpacing: "0.12em",
          marginBottom: 56,
        }}
      >
        {sub}
      </p>
      <Link
        href={backHref}
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
        {backLabel}
      </Link>
    </main>
  );
}

function friendlyTitle(code: string): string {
  switch (code) {
    case "AMOUNT_MISMATCH":
      return "결제 금액이 변조되었거나 일치하지 않습니다.";
    case "USER_MISMATCH":
      return "주문자 정보가 일치하지 않습니다.";
    case "ORDER_NOT_FOUND":
      return "주문 정보를 찾지 못했습니다.";
    default:
      return "결제 승인을 완료하지 못했어요.";
  }
}
