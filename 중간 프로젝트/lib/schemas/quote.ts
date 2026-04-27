import { z } from "zod";
import { CATEGORIES } from "@/lib/categories";

/**
 * Claude API 응답 검증용 Zod 스키마.
 * TRD §7.2 — { title, body, tags } 강제 + 길이 제약 + 카테고리 enum.
 *
 * DB 레벨 CHECK (title 60자, body 600자) + 여기서 한 번 더 = 이중 방어.
 */
export const GeneratedQuoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "title은 비어있을 수 없습니다.")
    .max(60, "title은 60자 이내여야 합니다."),
  body: z
    .string()
    .trim()
    .min(40, "body는 너무 짧습니다.")
    .max(600, "body는 600자 이내여야 합니다."),
  category: z.enum(CATEGORIES),
  tags: z
    .array(z.string().trim().min(1).max(20))
    .max(6, "tags는 최대 6개입니다.")
    .default([]),
});

export type GeneratedQuote = z.infer<typeof GeneratedQuoteSchema>;
