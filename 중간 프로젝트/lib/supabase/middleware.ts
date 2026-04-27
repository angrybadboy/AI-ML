import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/db";
import { getPublicEnv } from "@/lib/env/public";

/**
 * Next.js middleware 안에서 Supabase 세션을 갱신.
 * - 만료된 access token이 있으면 자동 refresh
 * - 갱신된 쿠키를 응답에 동기화
 * 호출자는 반환된 response를 그대로 반환해야 한다.
 */
export async function updateSession(request: NextRequest) {
  const env = getPublicEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser()는 토큰을 검증하고 필요시 refresh 한다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
