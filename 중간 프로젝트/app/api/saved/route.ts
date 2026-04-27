import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ToggleBodySchema = z.object({
  item_type: z.enum(["daily", "user"]),
  item_id: z.string().uuid(),
});

/**
 * POST /api/saved — 저장 토글.
 *   body: { item_type: 'daily' | 'user', item_id: uuid }
 *   응답: { ok: true, data: { saved: boolean } }
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

  const parsed = ToggleBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "BAD_INPUT",
          message: parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join(", "),
        },
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { item_type, item_id } = parsed.data;

  // 토글 — 있으면 DELETE, 없으면 INSERT
  const { data: existing } = await supabase
    .from("saved_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_type", item_type)
    .eq("item_id", item_id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("id", existing.id);
    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "DELETE_FAILED", message: error.message },
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, data: { saved: false } });
  }

  const { error: insErr } = await supabase
    .from("saved_items")
    .insert({ user_id: user.id, item_type, item_id });

  if (insErr) {
    return NextResponse.json(
      { ok: false, error: { code: "INSERT_FAILED", message: insErr.message } },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, data: { saved: true } });
}

/**
 * GET /api/saved — 내가 저장한 아이템 목록 (간이 — Phase 3에서 확장).
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTH", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_items")
    .select("id, item_type, item_id, saved_at")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: "QUERY_FAILED", message: error.message } },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, data });
}
