import "server-only";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateDailyQuote } from "@/lib/anthropic";
import type { Database } from "@/types/db";

type DailyQuote = Database["public"]["Tables"]["daily_quotes"]["Row"];

type QuoteBundle = {
  quote: DailyQuote;
  isSaved: boolean;
  reads: number;
  prev: { serial_no: number; title: string } | null;
  next: { serial_no: number; title: string } | null;
};

/**
 * 오늘의 글귀를 반환. 없으면 AI 생성 → 실패 시 폴백 풀.
 * TRD §4.3 + §7.4
 */
export async function getOrCreateTodayQuote(
  userId: string
): Promise<QuoteBundle | { error: string }> {
  const today = new Date().toISOString().slice(0, 10);
  const supabase = await createClient();

  let { data: quote } = await supabase
    .from("daily_quotes")
    .select("*")
    .eq("date", today)
    .maybeSingle();

  if (!quote) {
    const created = await createTodayQuote(today);
    if ("error" in created) return created;
    quote = created.quote;
  }

  return await attachMetadata(quote, userId);
}

async function createTodayQuote(
  today: string
): Promise<{ quote: DailyQuote } | { error: string }> {
  const admin = await createAdminClient();
  const generated = await generateDailyQuote(new Date());

  if (generated) {
    const { data, error } = await admin
      .from("daily_quotes")
      .insert({
        date: today,
        title: generated.title,
        body: generated.body,
        category: generated.category,
        tags: generated.tags,
        source_type: "ai",
      })
      .select()
      .single();
    if (error || !data) {
      console.error("[quotes] AI INSERT 실패:", error);
      return { error: "글귀 저장에 실패했습니다." };
    }
    return { quote: data };
  }

  // 폴백 풀
  const { data: fallback } = await admin
    .from("fallback_quotes")
    .select("*")
    .order("used_count", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!fallback) {
    return { error: "폴백 풀이 비어있습니다. supabase/migrations/0002_fallback_quotes.sql 을 적용했는지 확인하세요." };
  }

  const { data: inserted, error: insErr } = await admin
    .from("daily_quotes")
    .insert({
      date: today,
      title: fallback.title,
      body: fallback.body,
      category: fallback.category,
      tags: fallback.tags,
      source_type: "curated",
    })
    .select()
    .single();

  if (insErr || !inserted) {
    console.error("[quotes] 폴백 INSERT 실패:", insErr);
    return { error: "글귀 저장에 실패했습니다." };
  }

  await admin
    .from("fallback_quotes")
    .update({ used_count: fallback.used_count + 1 })
    .eq("id", fallback.id);

  return { quote: inserted };
}

/**
 * 일련번호로 글귀 조회. /g/:no 에서 사용.
 */
export async function getQuoteBySerialNo(
  serialNo: number,
  userId: string
): Promise<QuoteBundle | null> {
  const supabase = await createClient();
  const { data: quote } = await supabase
    .from("daily_quotes")
    .select("*")
    .eq("serial_no", serialNo)
    .maybeSingle();

  if (!quote) return null;
  return await attachMetadata(quote, userId);
}

async function attachMetadata(
  quote: DailyQuote,
  userId: string
): Promise<QuoteBundle> {
  const supabase = await createClient();

  const [savedRes, readsRes, prevRes, nextRes] = await Promise.all([
    supabase
      .from("saved_items")
      .select("id")
      .eq("user_id", userId)
      .eq("item_type", "daily")
      .eq("item_id", quote.id)
      .maybeSingle(),
    supabase
      .from("saved_items")
      .select("id", { count: "exact", head: true })
      .eq("item_type", "daily")
      .eq("item_id", quote.id),
    supabase
      .from("daily_quotes")
      .select("serial_no, title")
      .lt("serial_no", quote.serial_no)
      .order("serial_no", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("daily_quotes")
      .select("serial_no, title")
      .gt("serial_no", quote.serial_no)
      .order("serial_no", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    quote,
    isSaved: !!savedRes.data,
    reads: readsRes.count ?? 0,
    prev: prevRes.data ?? null,
    next: nextRes.data ?? null,
  };
}
