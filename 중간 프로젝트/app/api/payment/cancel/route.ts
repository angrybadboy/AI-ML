import { NextResponse } from "next/server";
import { createAdminClient, getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payment/cancel — 본인 구독을 'free' 로 되돌림.
 *
 * 샌드박스 한정:
 *   - 실제 환불 호출 X (Toss cancel API 미사용)
 *   - 단순히 profiles.subscription_status='free', subscription_expires_at=null
 *   - payment_logs 는 보존 (이력 추적용)
 *
 * RLS bypass 가 필요해서 admin client 사용 (단, user_id == auth.uid() 체크 강제).
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTH", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({
      subscription_status: "free",
      subscription_expires_at: null,
    })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: "CANCEL_FAILED", message: error.message } },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_FOUND", message: "프로필을 찾지 못했습니다." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data: { canceled: true } });
}
