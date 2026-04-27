import "server-only";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, type Category } from "@/lib/categories";

export type FeedPost = {
  id: string;
  serial_no: number;
  title: string;
  body: string;
  category: Category;
  visibility: "public" | "private";
  tags: string[];
  like_count: number;
  user_id: string;
  created_at: string;
  author_nickname: string;
  is_mine: boolean;
  is_saved: boolean;
};

type Scope = "feed" | "me";

type Args = {
  userId: string;
  scope: Scope;
  category?: Category;
  cursor?: number;
  limit?: number;
};

/**
 * 발견 피드 / 마이 글 목록을 조회.
 * scope='feed' → visibility='public' (RLS public 정책)
 * scope='me'   → 본인 글 (모든 visibility)
 */
export async function getFeedPosts({
  userId,
  scope,
  category,
  cursor,
  limit = 24,
}: Args): Promise<{ posts: FeedPost[]; nextCursor: number | null }> {
  const supabase = await createClient();

  let q = supabase
    .from("user_posts")
    .select(
      "id, serial_no, title, body, category, visibility, tags, like_count, user_id, created_at"
    )
    .order("serial_no", { ascending: false })
    .limit(limit);

  if (scope === "feed") q = q.eq("visibility", "public");
  else q = q.eq("user_id", userId);
  if (category) q = q.eq("category", category);
  if (cursor) q = q.lt("serial_no", cursor);

  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) return { posts: [], nextCursor: null };

  // 작성자 닉네임 + 내가 저장한 항목 일괄 조회
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const postIds = rows.map((r) => r.id);
  const [profilesRes, savedRes] = await Promise.all([
    supabase.from("profiles").select("id, nickname").in("id", userIds),
    supabase
      .from("saved_items")
      .select("item_id")
      .eq("user_id", userId)
      .eq("item_type", "user")
      .in("item_id", postIds),
  ]);

  const nicknameMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p.nickname])
  );
  const savedSet = new Set(
    (savedRes.data ?? []).map((s) => s.item_id as string)
  );

  const posts: FeedPost[] = rows.map((r) => ({
    ...r,
    category: r.category as Category,
    visibility: r.visibility as "public" | "private",
    author_nickname: nicknameMap.get(r.user_id) ?? "익명",
    is_mine: r.user_id === userId,
    is_saved: savedSet.has(r.id),
  }));

  const nextCursor =
    posts.length === limit ? posts[posts.length - 1].serial_no : null;

  return { posts, nextCursor };
}

export function isCategoryParam(value: string | null): value is Category {
  return !!value && (CATEGORIES as readonly string[]).includes(value);
}
