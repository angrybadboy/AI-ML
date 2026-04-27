import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getQuoteBySerialNo } from "@/lib/quotes";
import { QuoteView } from "@/components/quote/QuoteView";

export const dynamic = "force-dynamic";

export default async function PostByNoPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { no } = await params;
  const serial = Number.parseInt(no, 10);
  if (!Number.isFinite(serial) || serial <= 0) {
    notFound();
  }

  const result = await getQuoteBySerialNo(serial, user.id);
  if (!result) notFound();

  return (
    <QuoteView
      quote={result.quote}
      isSaved={result.isSaved}
      reads={result.reads}
      prev={result.prev}
      next={result.next}
    />
  );
}
