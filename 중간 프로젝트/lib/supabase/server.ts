import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/db";
import { getPublicEnv } from "@/lib/env/public";
import { getServerEnv } from "@/lib/env/server";

/**
 * 서버(Server Component, Route Handler, Server Action)용 Supabase 클라이언트.
 * RSC에서는 cookieStore.set이 throw할 수 있어 try/catch로 감싼다 — 세션 갱신은 middleware가 담당.
 */
export async function createClient() {
  const env = getPublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // RSC에서 호출되면 set이 막혀있다. middleware가 세션을 갱신하므로 안전.
          }
        },
      },
    }
  );
}

/**
 * 관리자 작업(시드, 글귀 생성, payment_logs INSERT 등)용 service role 클라이언트.
 * RLS를 우회하므로 반드시 서버 코드에서만, 신뢰된 입력만 사용.
 */
export async function createAdminClient() {
  const publicEnv = getPublicEnv();
  const serverEnv = getServerEnv();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // admin client는 세션을 다루지 않는다.
        },
      },
    }
  );
}

/**
 * 현재 인증된 유저를 반환. 없으면 null.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
