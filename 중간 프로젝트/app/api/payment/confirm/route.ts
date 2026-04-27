import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/supabase/server";
import { confirmAndActivatePremium } from "@/lib/payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ConfirmBodySchema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().int().positive(),
});

/**
 * POST /api/payment/confirm
 * Toss 결제창에서 successUrl 로 돌아온 후 호출.
 * TRD §6.4 — 클라 amount 재검증, order_id 의 user 매칭, Toss confirm 호출.
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTH", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "BAD_JSON", message: "잘못된 요청 본문." } },
      { status: 400 }
    );
  }

  const parsed = ConfirmBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "BAD_INPUT",
          message: parsed.error.issues[0]?.message ?? "입력 검증 실패",
        },
      },
      { status: 400 }
    );
  }

  const result = await confirmAndActivatePremium({
    userId: user.id,
    paymentKey: parsed.data.paymentKey,
    orderId: parsed.data.orderId,
    amount: parsed.data.amount,
  });

  if (!result.ok) {
    const status = result.code === "AMOUNT_MISMATCH" || result.code === "USER_MISMATCH" ? 403 : 400;
    return NextResponse.json(
      { ok: false, error: { code: result.code, message: result.message } },
      { status }
    );
  }

  return NextResponse.json({ ok: true, data: { activated: true } });
}
