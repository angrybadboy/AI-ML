import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { createPaymentOrder } from "@/lib/payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payment/ready
 * 1. 인증 확인
 * 2. 이미 프리미엄이면 거절
 * 3. order_id 발급 + payment_logs 'ready' 기록
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTH", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  // 프리미엄 중복 결제 방지
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profile?.subscription_status === "premium" &&
    profile.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date()
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "ALREADY_PREMIUM",
          message: "이미 프리미엄을 이용 중이세요.",
        },
      },
      { status: 409 }
    );
  }

  try {
    const { orderId, amount, orderName } = await createPaymentOrder(user.id);
    return NextResponse.json({
      ok: true,
      data: {
        orderId,
        amount,
        orderName,
        customerKey: user.id,
        customerEmail: user.email ?? "",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "주문 생성 실패";
    return NextResponse.json(
      { ok: false, error: { code: "READY_FAILED", message } },
      { status: 500 }
    );
  }
}
