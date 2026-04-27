import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/payment/status — 내 구독 상태 조회.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTH", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: "QUERY_FAILED", message: error.message } },
      { status: 500 }
    );
  }

  const isPremium =
    profile?.subscription_status === "premium" &&
    profile.subscription_expires_at !== null &&
    new Date(profile.subscription_expires_at) > new Date();

  return NextResponse.json({
    ok: true,
    data: {
      status: isPremium ? "premium" : "free",
      expiresAt: profile?.subscription_expires_at ?? null,
    },
  });
}
