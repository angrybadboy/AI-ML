import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { tossConfirmPayment } from "@/lib/toss";

/**
 * 글결 프리미엄 정가 (TRD §6, PRD Q-04 — ₩4,900 채택).
 * 변경 시 한 곳에서만 수정.
 */
export const PREMIUM_PRICE_KRW = 4900;
export const PREMIUM_PERIOD_DAYS = 30;
export const PREMIUM_ORDER_NAME = "글결 프리미엄 1개월";

type ReadyResult = {
  orderId: string;
  amount: number;
  orderName: string;
};

/**
 * 결제 시퀀스 1단계: order_id 발급 + payment_logs 'ready' 레코드 생성.
 * TRD §6.2의 Step 2. 서비스 롤로 INSERT (RLS는 service role 우회).
 */
export async function createPaymentOrder(userId: string): Promise<ReadyResult> {
  const orderId = `gg_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
  const amount = PREMIUM_PRICE_KRW;

  const admin = await createAdminClient();
  const { error } = await admin.from("payment_logs").insert({
    user_id: userId,
    order_id: orderId,
    amount,
    status: "ready",
  });

  if (error) {
    throw new Error(`payment_logs insert 실패: ${error.message}`);
  }

  return { orderId, amount, orderName: PREMIUM_ORDER_NAME };
}

type ConfirmInput = {
  userId: string;
  paymentKey: string;
  orderId: string;
  /** 클라가 보내온 amount — 서버는 신뢰하지 않고 DB와 비교. */
  amount: number;
};

type ConfirmOutcome =
  | { ok: true }
  | { ok: false; code: string; message: string };

/**
 * 결제 시퀀스 2단계: amount 재검증 + Toss confirm + 구독 갱신.
 * TRD §6.4 보안 포인트:
 *   1. 클라 amount 신뢰 금지 → DB의 ready 레코드와 비교
 *   2. order_id 의 user_id 가 현재 사용자와 일치하는지 확인
 *   3. 일치 시 Toss confirm 호출 → 성공이면 status='approved', subscription 갱신
 *   4. 불일치/실패 → status='failed' 기록 + 거절
 */
export async function confirmAndActivatePremium(
  input: ConfirmInput
): Promise<ConfirmOutcome> {
  const admin = await createAdminClient();

  // 1. 원본 ready 레코드 조회
  const { data: log, error: logErr } = await admin
    .from("payment_logs")
    .select("id, user_id, amount, status")
    .eq("order_id", input.orderId)
    .maybeSingle();

  if (logErr || !log) {
    return {
      ok: false,
      code: "ORDER_NOT_FOUND",
      message: "주문 정보를 찾지 못했습니다.",
    };
  }

  if (log.user_id !== input.userId) {
    await admin
      .from("payment_logs")
      .update({
        status: "failed",
        raw_response: { code: "USER_MISMATCH" },
      })
      .eq("id", log.id);
    return {
      ok: false,
      code: "USER_MISMATCH",
      message: "주문자 정보가 일치하지 않습니다.",
    };
  }

  if (log.status !== "ready") {
    return {
      ok: false,
      code: "ALREADY_PROCESSED",
      message: "이미 처리된 주문입니다.",
    };
  }

  // 2. amount 재검증 (★ TRD §6.4)
  if (log.amount !== input.amount) {
    await admin
      .from("payment_logs")
      .update({
        status: "failed",
        raw_response: {
          code: "AMOUNT_MISMATCH",
          requested: input.amount,
          recorded: log.amount,
        },
      })
      .eq("id", log.id);
    return {
      ok: false,
      code: "AMOUNT_MISMATCH",
      message: "결제 금액이 변조되었거나 일치하지 않습니다.",
    };
  }

  // 3. Toss confirm 호출
  const tossRes = await tossConfirmPayment({
    paymentKey: input.paymentKey,
    orderId: input.orderId,
    amount: input.amount,
  });

  if (!tossRes.ok) {
    await admin
      .from("payment_logs")
      .update({
        status: "failed",
        payment_key: input.paymentKey,
        raw_response: tossRes.error as Record<string, unknown>,
      })
      .eq("id", log.id);
    return {
      ok: false,
      code: tossRes.error.code ?? "TOSS_REJECTED",
      message: tossRes.error.message ?? "결제 승인이 거절되었습니다.",
    };
  }

  // 4. payment_logs approved + 구독 갱신
  const expiresAt = new Date(
    Date.now() + PREMIUM_PERIOD_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  // 카드번호 등 민감 필드 마스킹 (Toss는 이미 마스킹된 값을 주지만 추가 방어)
  const maskedResponse = maskSensitive(tossRes.data);

  const [updateLogRes, updateProfileRes] = await Promise.all([
    admin
      .from("payment_logs")
      .update({
        status: "approved",
        payment_key: input.paymentKey,
        raw_response: maskedResponse,
      })
      .eq("id", log.id),
    admin
      .from("profiles")
      .update({
        subscription_status: "premium",
        subscription_expires_at: expiresAt,
      })
      .eq("id", input.userId),
  ]);

  if (updateLogRes.error) {
    return {
      ok: false,
      code: "LOG_UPDATE_FAILED",
      message: updateLogRes.error.message,
    };
  }
  if (updateProfileRes.error) {
    return {
      ok: false,
      code: "PROFILE_UPDATE_FAILED",
      message: updateProfileRes.error.message,
    };
  }

  return { ok: true };
}

/**
 * 결제 실패/취소 시 호출 — 해당 ready 주문을 'failed' 또는 'canceled' 로 기록.
 */
export async function markPaymentFailed(
  orderId: string,
  payload: Record<string, unknown>,
  finalStatus: "failed" | "canceled" = "failed"
) {
  const admin = await createAdminClient();
  await admin
    .from("payment_logs")
    .update({
      status: finalStatus,
      raw_response: payload,
    })
    .eq("order_id", orderId)
    .eq("status", "ready");
}

/**
 * 카드번호·CVC 등 잠재적 민감 필드를 raw_response에서 제거.
 * Toss 응답엔 마스킹된 cardNumber 만 들어오긴 하나 안전 장치.
 */
function maskSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const SENSITIVE_KEYS = ["secret", "cardCode", "cvc", "number"];
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s.toLowerCase()))) {
      result[k] = "[masked]";
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      result[k] = maskSensitive(v as Record<string, unknown>);
    } else {
      result[k] = v;
    }
  }
  return result;
}
