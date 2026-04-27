import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next 16 proxy (구 middleware) — 보호 라우트:
 *   /today, /feed, /write, /me, /premium, /g/:no
 * 미인증 시 /login 으로 리다이렉트.
 *
 * 비공개 → 공개 리다이렉트:
 *   인증된 유저가 /login, /signup 에 접근하면 /today 로 보낸다.
 */

const PROTECTED_PREFIXES = ["/today", "/feed", "/write", "/me", "/premium", "/g/", "/p/", "/payment/"];
const AUTH_ONLY_PUBLIC = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const isAuthPage = AUTH_ONLY_PUBLIC.includes(pathname);
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/today";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 요청에서 실행:
     *   - _next/static (정적 자산)
     *   - _next/image (이미지 최적화)
     *   - favicon.ico
     *   - public 폴더의 정적 파일
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
