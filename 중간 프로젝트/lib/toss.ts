import "server-only";
import { getServerEnv } from "@/lib/env/server";

const TOSS_API_BASE = "https://api.tosspayments.com/v1";

type ConfirmInput = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

type TossErrorBody = {
  code?: string;
  message?: string;
};

export type TossConfirmResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: TossErrorBody; status: number };

/**
 * Toss /v1/payments/confirm 호출.
 * Authorization: Basic base64(SECRET_KEY:)  ← Toss 표준
 * 서버 전용 — 시크릿 키 사용.
 */
export async function tossConfirmPayment(
  input: ConfirmInput
): Promise<TossConfirmResult> {
  const { TOSS_SECRET_KEY } = getServerEnv();
  const auth = Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64");

  const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const text = await res.text();
  let json: unknown = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    return {
      ok: false,
      error: { code: "PARSE_ERROR", message: "Toss 응답 파싱 실패" },
      status: res.status,
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: (json as TossErrorBody) ?? { code: "TOSS_ERROR" },
      status: res.status,
    };
  }
  return { ok: true, data: json as Record<string, unknown> };
}
