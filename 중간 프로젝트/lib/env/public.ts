import { z } from "zod";

/**
 * 클라이언트 + 서버 모두에서 안전하게 import 가능한 공개 env.
 * NEXT_PUBLIC_* 만 포함.
 *
 * ⚠️ 이 파일은 절대 server-only 키를 정의하거나 import하지 말 것.
 *    클라이언트 번들에 정의된 모든 식별자가 그대로 노출된다.
 */
const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().min(1).optional(),
});

let _publicEnv: z.infer<typeof PublicEnvSchema> | null = null;

export function getPublicEnv() {
  if (_publicEnv) return _publicEnv;
  const parsed = PublicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
  });
  if (!parsed.success) {
    throw new Error(
      `[env] 공개 환경변수 검증 실패: ${parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ")}\n.env.local을 확인하세요 (TRD §9.2).`
    );
  }
  _publicEnv = parsed.data;
  return _publicEnv;
}
