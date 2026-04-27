import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env/public";
import { CheckoutButton } from "@/components/payment/CheckoutButton";
import { PREMIUM_PRICE_KRW, PREMIUM_PERIOD_DAYS } from "@/lib/payment";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "프리미엄 — 글결",
};

export default async function PremiumPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, subscription_status, subscription_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  const isPremium =
    profile?.subscription_status === "premium" &&
    profile.subscription_expires_at !== null &&
    new Date(profile.subscription_expires_at) > new Date();

  if (isPremium) {
    return <AlreadyPremium expiresAt={profile.subscription_expires_at!} />;
  }

  const env = getPublicEnv();
  const clientKey = env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  return (
    <main
      style={{
        padding: "120px 24px 80px",
        maxWidth: 720,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div className="eyebrow accent" style={{ marginBottom: 24 }}>
        ― 글결 프리미엄
      </div>
      <h1
        className="heading"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 56,
          fontWeight: 400,
          lineHeight: 1.2,
          margin: "0 0 24px",
          letterSpacing: "-0.018em",
        }}
      >
        결을 더 깊이
        <br />새기고 싶다면.
      </h1>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 18,
          color: "var(--ink-2)",
          lineHeight: 1.85,
          margin: "0 auto 64px",
          maxWidth: 480,
        }}
      >
        무료로도 하루 한 편을 읽고 간직할 수 있어요.<br />
        프리미엄은 더 많은 결을 펼치고, AI 맞춤 큐레이션을 받아보고 싶은 분께 권합니다.
      </p>

      <hr className="hairline" style={{ margin: "0 auto 56px", maxWidth: 320 }} />

      <div
        style={{
          marginBottom: 16,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          color: "var(--ink-3)",
        }}
      >
        한 달
      </div>
      <div
        className="heading"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 88,
          fontWeight: 300,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        ₩{PREMIUM_PRICE_KRW.toLocaleString("ko-KR")}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-3)",
          letterSpacing: "0.18em",
          marginBottom: 56,
        }}
      >
        ― {PREMIUM_PERIOD_DAYS}일 동안 ―
      </div>

      {clientKey ? (
        <CheckoutButton
          clientKey={clientKey}
          customerEmail={user.email}
          customerName={profile?.nickname}
        />
      ) : (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--accent)",
            letterSpacing: "0.12em",
          }}
        >
          ― NEXT_PUBLIC_TOSS_CLIENT_KEY 미설정 ―
        </div>
      )}

      <ul
        style={{
          marginTop: 80,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          fontFamily: "var(--font-serif)",
          fontSize: 15,
          color: "var(--ink-2)",
          lineHeight: 1.7,
          textAlign: "left",
          maxWidth: 360,
          margin: "80px auto 0",
        }}
      >
        <li style={{ display: "flex", gap: 14 }}>
          <span style={{ color: "var(--accent)" }}>·</span>
          하루 한 편을 넘어, 원할 때 더 많은 결을 펼칠 수 있어요.
        </li>
        <li style={{ display: "flex", gap: 14 }}>
          <span style={{ color: "var(--accent)" }}>·</span>
          저장한 결 위에 자라는 AI 맞춤 큐레이션 (단계적 도입).
        </li>
        <li style={{ display: "flex", gap: 14 }}>
          <span style={{ color: "var(--accent)" }}>·</span>
          언제든 가만히 떠나실 수 있어요. 별 다른 절차는 두지 않습니다.
        </li>
      </ul>

      <div
        style={{
          marginTop: 96,
          paddingTop: 24,
          borderTop: "1px solid var(--rule)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-3)",
          letterSpacing: "0.12em",
        }}
      >
        샌드박스 결제입니다. 실결제는 일어나지 않아요.
      </div>
    </main>
  );
}

function AlreadyPremium({ expiresAt }: { expiresAt: string }) {
  const date = new Date(expiresAt).toISOString().slice(0, 10).replaceAll("-", " · ");
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
        ― 이미 함께 하고 계세요
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
        프리미엄 이용 중입니다.
      </h1>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 18,
          color: "var(--ink-2)",
          lineHeight: 1.85,
          margin: "0 auto 48px",
          maxWidth: 420,
        }}
      >
        다음 결까지 — {date}
      </p>
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
