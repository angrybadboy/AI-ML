import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SAFE_NEXT = /^\/[a-zA-Z0-9/_\-[\]]*$/;

/**
 * OAuth 콜백 — Supabase에서 받은 code를 세션으로 교환.
 * Google OAuth 시 redirectTo를 이 경로로 지정한다.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const next = rawNext && SAFE_NEXT.test(rawNext) ? rawNext : "/today";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("oauth_failed")}`
    );
  }
  return NextResponse.redirect(`${origin}${next}`);
}
