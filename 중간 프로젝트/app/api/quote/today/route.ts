import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { getOrCreateTodayQuote } from "@/lib/quotes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/quote/today (TRD §4.3)
 * 로직은 lib/quotes.ts에 모음.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTH", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const result = await getOrCreateTodayQuote(user.id);

  if ("error" in result) {
    return NextResponse.json(
      { ok: false, error: { code: "QUOTE_FAILED", message: result.error } },
      { status: 503 }
    );
  }

  const { quote, isSaved, reads, prev, next } = result;

  return NextResponse.json({
    ok: true,
    data: {
      ...quote,
      isSaved,
      reads,
      prev,
      next,
    },
  });
}
