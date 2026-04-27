"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/db";
import { getPublicEnv } from "@/lib/env/public";

/**
 * 클라이언트(브라우저)용 Supabase 클라이언트.
 * anon key만 사용. service role key는 절대 클라이언트로 가져오지 않는다.
 */
export function createClient() {
  const env = getPublicEnv();
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
