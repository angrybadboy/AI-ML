import { redirect } from "next/navigation";
import { createAdminClient, getCurrentUser } from "@/lib/supabase/server";
import { HybridLanding } from "@/components/landing/HybridLanding";
import { FadeInPage } from "@/components/motion/FadeInPage";

export const dynamic = "force-dynamic";

/**
 * 루트 라우팅.
 * - 로그인 → /today
 * - 비로그인 → Hybrid 랜딩 (오늘의 글 미리보기)
 *
 * 비로그인은 RLS상 daily_quotes를 select 못 하므로 admin client로 미리보기만 fetch.
 */
export default async function RootPage() {
  const user = await getCurrentUser();
  if (user) redirect("/today");

  const preview = await getLandingPreview();
  return (
    <FadeInPage>
      <HybridLanding preview={preview} />
    </FadeInPage>
  );
}

async function getLandingPreview() {
  const admin = await createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  // 오늘 글이 있으면 그것
  const { data: todayQuote } = await admin
    .from("daily_quotes")
    .select("*")
    .eq("date", today)
    .maybeSingle();
  if (todayQuote) return todayQuote;

  // 없으면 가장 최근 글
  const { data: latest } = await admin
    .from("daily_quotes")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return latest;
}
