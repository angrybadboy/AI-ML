import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getOrCreateTodayQuote } from "@/lib/quotes";
import { QuoteView } from "@/components/quote/QuoteView";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await getOrCreateTodayQuote(user.id);

  if ("error" in result) {
    return (
      <main
        style={{
          padding: "120px 24px",
          maxWidth: 780,
          margin: "0 auto",
        }}
      >
        <div className="eyebrow accent" style={{ marginBottom: 16 }}>
          ― 잠시 멈춘 결
        </div>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 21,
            lineHeight: 1.95,
            color: "var(--ink)",
          }}
        >
          오늘의 글을 불러오는 데 어려움이 있어요.
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--ink-3)",
            marginTop: 16,
          }}
        >
          {result.error}
        </p>
      </main>
    );
  }

  const { quote, isSaved, reads, prev, next } = result;

  return (
    <QuoteView
      quote={quote}
      isSaved={isSaved}
      reads={reads}
      prev={prev}
      next={next}
    />
  );
}
