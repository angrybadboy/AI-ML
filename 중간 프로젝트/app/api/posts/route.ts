import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { PostCreateSchema } from "@/lib/schemas/post";
import { CATEGORIES } from "@/lib/categories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ListQuerySchema = z.object({
  scope: z.enum(["feed", "me"]).default("feed"),
  category: z.enum(CATEGORIES).optional(),
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(24),
});

/**
 * POST /api/posts — 글 작성. 본인(auth.uid())만.
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

  const parsed = PostCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "BAD_INPUT",
          message: parsed.error.issues[0]?.message ?? "입력 검증 실패",
          issues: parsed.error.issues,
        },
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_posts")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category,
      visibility: parsed.data.visibility,
      tags: parsed.data.tags,
    })
    .select("id, serial_no, visibility")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: { code: "INSERT_FAILED", message: error?.message ?? "저장 실패" } },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data });
}

/**
 * GET /api/posts?scope=feed|me — 글 목록.
 *   feed: visibility='public' 인 모든 글 (RLS가 추가로 막지 않음 — public 정책)
 *   me  : 본인 글 (RLS가 본인만 select 허용)
 *   cursor: 다음 페이지 시작 serial_no (이 값보다 작은 것)
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTH", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const queryParsed = ListQuerySchema.safeParse(
    Object.fromEntries(url.searchParams)
  );
  if (!queryParsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "BAD_QUERY",
          message: queryParsed.error.issues[0]?.message ?? "쿼리 검증 실패",
        },
      },
      { status: 400 }
    );
  }

  const { scope, category, cursor, limit } = queryParsed.data;
  const supabase = await createClient();

  let q = supabase
    .from("user_posts")
    .select(
      "id, serial_no, title, body, category, visibility, tags, like_count, user_id, created_at"
    )
    .order("serial_no", { ascending: false })
    .limit(limit);

  if (scope === "feed") {
    q = q.eq("visibility", "public");
  } else {
    q = q.eq("user_id", user.id);
  }
  if (category) q = q.eq("category", category);
  if (cursor) q = q.lt("serial_no", cursor);

  const { data: posts, error } = await q;
  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: "QUERY_FAILED", message: error.message } },
      { status: 500 }
    );
  }

  // 작성자 닉네임 일괄 조회
  const userIds = Array.from(new Set(posts.map((p) => p.user_id)));
  let nicknameMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, nickname")
      .in("id", userIds);
    nicknameMap = new Map((profs ?? []).map((p) => [p.id, p.nickname]));
  }

  const data = posts.map((p) => ({
    ...p,
    author_nickname: nicknameMap.get(p.user_id) ?? "익명",
    is_mine: p.user_id === user.id,
  }));

  const nextCursor =
    data.length === limit ? data[data.length - 1].serial_no : null;

  return NextResponse.json({
    ok: true,
    data,
    nextCursor,
  });
}
