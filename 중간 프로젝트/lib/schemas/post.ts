import { z } from "zod";
import { CATEGORIES } from "@/lib/categories";

/**
 * user_posts 스키마.
 * DB CHECK + Zod + UI 3중 검증 (CLAUDE.md §3.4 / Phase 3 Exit).
 *
 * 길이 제약: title 1~40자, body 1~600자 (TRD §3.1).
 * 공백만 입력은 거부 — trim 후 min(1).
 */

const TitleSchema = z
  .string()
  .trim()
  .min(1, "제목을 입력해 주세요.")
  .max(40, "제목은 40자 이내입니다.");

const BodySchema = z
  .string()
  .trim()
  .min(1, "본문을 입력해 주세요.")
  .max(600, "본문은 600자 이내입니다.");

const TagsSchema = z
  .array(z.string().trim().min(1).max(12))
  .max(4, "태그는 최대 4개입니다.")
  .default([]);

export const PostCreateSchema = z.object({
  title: TitleSchema,
  body: BodySchema,
  category: z.enum(CATEGORIES),
  visibility: z.enum(["public", "private"]).default("private"),
  tags: TagsSchema,
});

export const PostUpdateSchema = z
  .object({
    title: TitleSchema,
    body: BodySchema,
    category: z.enum(CATEGORIES),
    visibility: z.enum(["public", "private"]),
    tags: TagsSchema,
  })
  .partial();

export type PostCreate = z.infer<typeof PostCreateSchema>;
export type PostUpdate = z.infer<typeof PostUpdateSchema>;
