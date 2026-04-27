import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/categories";

export type SavedItemView = {
  saved_id: string;
  saved_at: string;
  item_type: "daily" | "user";
  item_id: string;
  serial_no: number;
  title: string;
  category: Category;
  author_label: string;
  href: string;
};

/**
 * 사용자가 간직한 항목들을 daily_quotes/user_posts에서 join하여 통합 뷰로.
 */
export async function getMySavedItems(
  userId: string,
  limit = 24
): Promise<SavedItemView[]> {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("saved_items")
    .select("id, item_type, item_id, saved_at")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false })
    .limit(limit);

  if (!rows || rows.length === 0) return [];

  const dailyIds = rows.filter((r) => r.item_type === "daily").map((r) => r.item_id);
  const userIds_ = rows.filter((r) => r.item_type === "user").map((r) => r.item_id);

  const [dailyRes, userRes] = await Promise.all([
    dailyIds.length > 0
      ? supabase
          .from("daily_quotes")
          .select("id, serial_no, title, category, source_type")
          .in("id", dailyIds)
      : Promise.resolve({ data: [] as { id: string; serial_no: number; title: string; category: string; source_type: string }[] }),
    userIds_.length > 0
      ? supabase
          .from("user_posts")
          .select("id, serial_no, title, category, user_id")
          .in("id", userIds_)
      : Promise.resolve({ data: [] as { id: string; serial_no: number; title: string; category: string; user_id: string }[] }),
  ]);

  const dailyMap = new Map((dailyRes.data ?? []).map((d) => [d.id, d]));
  const userMap = new Map((userRes.data ?? []).map((u) => [u.id, u]));

  // user_post 작성자 닉네임
  const authorIds = Array.from(
    new Set((userRes.data ?? []).map((u) => u.user_id))
  );
  const nicknameMap = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, nickname")
      .in("id", authorIds);
    (profs ?? []).forEach((p) => nicknameMap.set(p.id, p.nickname));
  }

  const items: SavedItemView[] = [];
  for (const r of rows) {
    if (r.item_type === "daily") {
      const d = dailyMap.get(r.item_id);
      if (!d) continue;
      items.push({
        saved_id: r.id,
        saved_at: r.saved_at,
        item_type: "daily",
        item_id: r.item_id,
        serial_no: d.serial_no,
        title: d.title,
        category: d.category as Category,
        author_label:
          d.source_type === "ai" ? "글결 · AI" : "글결 큐레이션",
        href: `/g/${d.serial_no}`,
      });
    } else {
      const u = userMap.get(r.item_id);
      if (!u) continue;
      items.push({
        saved_id: r.id,
        saved_at: r.saved_at,
        item_type: "user",
        item_id: r.item_id,
        serial_no: u.serial_no,
        title: u.title,
        category: u.category as Category,
        author_label: nicknameMap.get(u.user_id) ?? "익명",
        href: `/p/${u.serial_no}`,
      });
    }
  }
  return items;
}
