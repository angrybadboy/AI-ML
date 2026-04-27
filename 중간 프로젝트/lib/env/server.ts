import "server-only";
import { z } from "zod";

/**
 * 서버 전용 env. 절대 클라이언트로 import 되어서는 안 된다.
 * `import "server-only"`가 클라이언트 번들 포함 시도를 빌드 타임에 거절한다.
 *
 * Phase 2/4에서 ANTHROPIC_API_KEY, TOSS_SECRET_KEY 등 추가.
 */
const ServerEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1).startsWith("sk-ant-", {
    message: "ANTHROPIC_API_KEY 형식이 올바르지 않습니다 (sk-ant- 으로 시작해야 함).",
  }),
  TOSS_SECRET_KEY: z
    .string()
    .min(1)
    .refine((v) => v.startsWith("test_sk_") || v.startsWith("test_gsk_") || v.startsWith("live_sk_"), {
      message: "TOSS_SECRET_KEY 형식이 올바르지 않습니다 (test_sk_ / test_gsk_ / live_sk_ 으로 시작).",
    }),
});

let _serverEnv: z.infer<typeof ServerEnvSchema> | null = null;

export function getServerEnv() {
  if (_serverEnv) return _serverEnv;
  const parsed = ServerEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    TOSS_SECRET_KEY: process.env.TOSS_SECRET_KEY,
  });
  if (!parsed.success) {
    throw new Error(
      `[env] 서버 환경변수 검증 실패: ${parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ")}\n.env.local을 확인하세요 (TRD §9.2).`
    );
  }
  _serverEnv = parsed.data;
  return _serverEnv;
}
