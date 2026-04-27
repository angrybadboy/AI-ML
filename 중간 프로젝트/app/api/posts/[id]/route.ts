import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { PostUpdateSchema } from "@/lib/schemas/post";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({ id: z.string().uuid() });

/**
 * PATCH /api/posts/:id — 본인 글만 수정 (RLS도 동일 보장).
 */
export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTH", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const params = await ctx.params;
  const idParsed = ParamsSchema.safeParse(params);
  if (!idParsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "BAD_ID", message: "유효하지 않은 글 ID." } },
      { status: 400 }
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

  const parsed = PostUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "BAD_INPUT",
          message: parsed.error.issues[0]?.message ?? "입력 검증 실패",
        },
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_posts")
    .update(parsed.data)
    .eq("id", idParsed.data.id)
    .eq("user_id", user.id) // 코드 레벨 추가 방어 (RLS 외에)
    .select("id, serial_no")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: "UPDATE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_FOUND", message: "글을 찾지 못했거나 권한이 없습니다." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data });
}

/**
 * DELETE /api/posts/:id — 본인 글만 삭제.
 */
export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTH", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const params = await ctx.params;
  const idParsed = ParamsSchema.safeParse(params);
  if (!idParsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "BAD_ID", message: "유효하지 않은 글 ID." } },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_posts")
    .delete()
    .eq("id", idParsed.data.id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: "DELETE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_FOUND", message: "글을 찾지 못했거나 권한이 없습니다." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data });
}
