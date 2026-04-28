import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PaymentLog = {
  id: string;
  order_id: string;
  amount: number;
  status: "ready" | "approved" | "failed" | "canceled";
  created_at: string;
};

/**
 * 본인 결제 이력 최근 N건. RLS 가 자동으로 본인만 select 허용.
 */
export async function getMyPaymentHistory(
  userId: string,
  limit = 5
): Promise<PaymentLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_logs")
    .select("id, order_id, amount, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as PaymentLog[];
}
